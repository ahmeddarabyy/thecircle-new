const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'thecircle_admin_secret_2026';

// Supabase configuration
const SUPABASE_URL = process.env.INTERNAL_SYSTEM_URL;
const SUPABASE_KEY = process.env.INTERNAL_SYSTEM_KEY;

// ─── Supabase Helper ────────────────────────────────────────────────────────
async function supabaseRequest(table, method = 'GET', data = null, query = '') {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase environment variables missing. Please check Vercel Settings.');
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (data) options.body = JSON.stringify(data);
  
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = await response.text();
    console.error(`Supabase Error [${table}]:`, err);
    throw new Error(`DB Error (${response.status})`);
  }
  return await response.json();
}

// ─── Email Setup ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }
});

async function sendBookingConfirmation(payload) {
  const branchAddress = payload.branch === 'kafr-abdo' 
    ? 'Villa 15, Ali Zou El Fekar st, Kafr Abdo' 
    : '15 Syria st, 1st Floor, Roushdy';
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: payload.email,
    subject: `Your space is ready - The Circle`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #00674F;">Booking Confirmed!</h2>
        <p>Hi ${payload.name}, thanks for booking with The Circle.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <p><strong>Branch:</strong> ${payload.branch === 'kafr-abdo' ? 'Kafr Abdo' : 'Roushdy'}</p>
          <p><strong>Address:</strong> ${branchAddress}</p>
          <p><strong>Date:</strong> ${payload.date}</p>
          <p><strong>Time:</strong> ${payload.start_time} - ${payload.end_time}</p>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">If you need to change your booking, please reply to this email.</p>
      </div>
    `
  };
  try { 
    const info = await transporter.sendMail(mailOptions); 
    console.log('User confirmation sent:', info.messageId);
    return info;
  } catch (e) { 
    console.error('User email failed:', e); 
    throw e;
  }
}

async function sendTeamNotification(payload) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: 'contact@circleworkspace.com',
    subject: `🚨 NEW BOOKING: ${payload.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3>New Website Booking</h3>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Phone:</strong> ${payload.phone}</p>
        <p><strong>Branch:</strong> ${payload.branch}</p>
        <p><strong>Date:</strong> ${payload.date}</p>
        <p><strong>Time:</strong> ${payload.start_time} - ${payload.end_time}</p>
      </div>
    `
  };
  try { 
    const info = await transporter.sendMail(mailOptions); 
    console.log('Team notification sent:', info.messageId);
    return info;
  } catch (e) { 
    console.error('Team email failed:', e); 
    throw e;
  }
}

async function sendSupportTeamNotification(payload) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: 'contact@circleworkspace.com',
    subject: `🚨 NEW SUPPORT REQUEST: ${payload.subject}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3>New Support Request</h3>
        <p><strong>From:</strong> ${payload.firstName} ${payload.lastName}</p>
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <p><strong>Message:</strong> ${payload.message}</p>
      </div>
    `
  };
  try { 
    const info = await transporter.sendMail(mailOptions); 
    console.log('Support team notification sent:', info.messageId);
    return info;
  } catch (e) { 
    console.error('Support email failed:', e); 
    throw e;
  }
}

// ─── Middleware ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('The Circle API is Running'));
app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    supabase: { url: !!SUPABASE_URL, key: !!SUPABASE_KEY },
    smtp: {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
        from: !!process.env.SMTP_FROM
    }
}));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Public Endpoints ────────────────────────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, branch, type, date, start_time, end_time, attendees, notes } = req.body;
    
    // Check availability
    if (type === 'meeting') {
      const q = `?branch=eq.${branch}&type=eq.meeting&date=eq.${date}&status=neq.cancelled`;
      const bookings = await supabaseRequest('website_bookings', 'GET', null, q);
      const conflict = bookings.find(b => {
        return !(end_time <= b.start_time || start_time >= b.end_time);
      });
      if (conflict) return res.status(409).json({ error: 'Time slot occupied' });
    }

    const result = await supabaseRequest('website_bookings', 'POST', {
      name, email, phone, branch, 
      type: type || 'meeting', 
      date, start_time, end_time, 
      attendees: attendees || 1, 
      notes: notes || ''
    });

    // Send notifications (MUST await in serverless)
    try {
      await Promise.all([
        sendBookingConfirmation(req.body),
        sendTeamNotification(req.body)
      ]);
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.json({ success: true, booking: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, category, subject, message } = req.body;
    const result = await supabaseRequest('support_requests', 'POST', {
      first_name: firstName, last_name: lastName, email, phone, location, category, subject, message
    });
    
    try {
      await sendSupportTeamNotification(req.body);
    } catch (e) {
      console.error('Support notification error:', e);
    }
    
    res.json({ success: true, request: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/availability', async (req, res) => {
  try {
    const { branch, date } = req.query;
    const q = `?branch=eq.${branch}&type=eq.meeting&date=eq.${date}&status=neq.cancelled&select=start_time,end_time`;
    const booked = await supabaseRequest('website_bookings', 'GET', null, q);
    res.json({ booked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin Endpoints ──────────────────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admins = await supabaseRequest('admins', 'GET', null, `?username=eq.${username}`);
    const admin = admins[0];
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', requireAuth, async (req, res) => {
  try {
    const bookings = await supabaseRequest('website_bookings', 'GET');
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      today: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/bookings', requireAuth, async (req, res) => {
  try {
    const { status, branch, date } = req.query;
    let query = '?order=created_at.desc';
    if (status) query += `&status=eq.${status}`;
    if (branch) query += `&branch=eq.${branch}`;
    if (date) query += `&date=eq.${date}`;
    const bookings = await supabaseRequest('website_bookings', 'GET', null, query);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/bookings/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supabaseRequest('website_bookings', 'PATCH', req.body, `?id=eq.${id}`);
    res.json({ success: true, booking: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/bookings/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseRequest('website_bookings', 'DELETE', null, `?id=eq.${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get(/^\/dashboard/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 The Circle API running on ${PORT}`);
  });
}

module.exports = app;
