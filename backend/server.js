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
  const isMeeting = payload.type === 'meeting';
  const branchName = payload.branch === 'kafr-abdo' ? 'The Circle Kafr Abdo' : 'The Circle Roushdy';
  const branchAddress = payload.branch === 'kafr-abdo' 
    ? 'Villa 15, Ali Zou El Fekar st, Kafr Abdo' 
    : '15 Syria st, 1st Floor, Roushdy';
  const mapsLink = payload.branch === 'kafr-abdo'
    ? 'https://maps.google.com/?q=The+Circle+Kafr+Abdo+Alexandria'
    : 'https://maps.google.com/?q=The+Circle+Roushdy+Alexandria';
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: payload.email,
    subject: `Your space is ready - The Circle`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #ffffff; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #ffffff; padding-bottom: 60px; }
          .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f; }
          .header { padding: 40px 20px; text-align: center; }
          .hero { padding: 0 40px 40px 40px; text-align: center; }
          .hero h1 { font-size: 32px; font-weight: 600; margin: 0 0 12px 0; letter-spacing: -0.03em; color: #000; }
          .hero p { font-size: 18px; color: #86868b; margin: 0; font-weight: 400; }
          .card { background: #F5F5F7; border-radius: 28px; padding: 40px; margin: 0 20px 32px 20px; }
          .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #00674F; margin-bottom: 24px; display: block; }
          .detail-item { margin-bottom: 20px; }
          .detail-label { font-size: 13px; color: #86868b; margin-bottom: 4px; display: block; }
          .detail-value { font-size: 17px; font-weight: 500; color: #1d1d1f; display: block; }
          .footer { padding: 40px 20px; text-align: center; border-top: 1px solid #F2F2F7; }
          .address-text { font-size: 12px; color: #86868b; margin-top: 24px; line-height: 1.5; }
          .btn-maps { display: inline-block; padding: 12px 24px; background: #000; color: #fff !important; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 500; margin-top: 12px; }
          .btn-wa { display: inline-block; padding: 14px 40px; background: #00674F; color: #FFFFFF !important; text-decoration: none; border-radius: 50px; font-weight: 500; margin-top: 12px; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="main">
            <div class="header">
              <img src="cid:logo" alt="The Circle" width="50" height="50">
            </div>
            
            <div class="hero">
              <h1>Confirmed.</h1>
              <p>Everything is set for your visit to ${payload.branch === 'kafr-abdo' ? 'Kafr Abdo' : 'Roushdy'}.</p>
            </div>

            <div class="card">
              <span class="card-title">Reservation Details</span>
              
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">${branchName}</span>
                <a href="${mapsLink}" class="btn-maps">Open in Google Maps</a>
              </div>

              <div class="detail-item">
                <span class="detail-label">Date</span>
                <span class="detail-value">${payload.date}</span>
              </div>

              ${isMeeting ? `
              <div class="detail-item">
                <span class="detail-label">Assigned Time Slot</span>
                <span class="detail-value">${payload.start_time} — ${payload.end_time}</span>
              </div>
              ` : `
              <div class="detail-item">
                <span class="detail-label">Access Type</span>
                <span class="detail-value">Full Day Pass</span>
              </div>
              `}
            </div>

            <div style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="font-size: 15px; color: #86868b; margin-bottom: 24px;">Need help or have questions? Our team is available on WhatsApp.</p>
              <a href="https://wa.me/201034708850" class="btn-wa">Chat on WhatsApp</a>
            </div>

            <div class="footer">
              <div style="margin-bottom: 24px;">
                <a href="https://www.instagram.com/circleworkspace/" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                  <img src="cid:ig" alt="Instagram" width="20" height="20" style="display: inline-block; border: 0;">
                </a>
                <a href="https://www.facebook.com/thecircleworkspace" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                  <img src="cid:fb" alt="Facebook" width="20" height="20" style="display: inline-block; border: 0;">
                </a>
                <a href="https://www.linkedin.com/company/circleworkspace" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                  <img src="cid:li" alt="LinkedIn" width="20" height="20" style="display: inline-block; border: 0;">
                </a>
                <a href="https://www.tiktok.com/@circleworkspace" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                  <img src="cid:tt" alt="TikTok" width="20" height="20" style="display: inline-block; border: 0;">
                </a>
                <a href="https://wa.me/201034708850" style="display: inline-block; margin: 0 12px; text-decoration: none;">
                  <img src="cid:wa" alt="WhatsApp" width="20" height="20" style="display: inline-block; border: 0;">
                </a>
              </div>
              <p class="address-text">
                <strong>The Circle Coworking Space Alexandria</strong><br>
                ${branchAddress}<br><br>
                © 2026 The Circle. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      { filename: 'logo.png', path: path.join(__dirname, 'assets/logo.png'), cid: 'logo' },
      { filename: 'ig.png',   path: path.join(__dirname, 'assets/ig_black.png'), cid: 'ig' },
      { filename: 'fb.png',   path: path.join(__dirname, 'assets/fb_black.png'), cid: 'fb' },
      { filename: 'li.png',   path: path.join(__dirname, 'assets/li_black.png'), cid: 'li' },
      { filename: 'tt.png',   path: path.join(__dirname, 'assets/tt_black.png'), cid: 'tt' },
      { filename: 'wa.png',   path: path.join(__dirname, 'assets/wa_black.png'), cid: 'wa' }
    ]
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
  const isMeeting = payload.type === 'meeting';
  const branchName = payload.branch === 'kafr-abdo' ? 'Kafr Abdo' : 'Roushdy';
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: 'contact@circleworkspace.com',
    subject: `🚨 NEW BOOKING: ${payload.name} - ${branchName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; padding: 30px; border: 1px solid #F2F2F7; border-radius: 20px; max-width: 500px;">
        <h2 style="color: #00674F; margin-top: 0;">New Website Booking</h2>
        <p style="color: #86868b;">A new booking has been received from the website.</p>
        <div style="background: #F5F5F7; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${payload.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${payload.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${payload.phone}</p>
          <p style="margin: 5px 0;"><strong>Branch:</strong> ${branchName}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${isMeeting ? 'Meeting Room' : 'Shared Space'}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${payload.date}</p>
          ${isMeeting ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${payload.start_time} - ${payload.end_time}</p>` : ''}
        </div>
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
      <div style="font-family: -apple-system, sans-serif; padding: 30px; border: 1px solid #F2F2F7; border-radius: 20px; max-width: 500px;">
        <h2 style="color: #00674F; margin-top: 0;">New Support Request</h2>
        <p style="color: #86868b;">A new support request has been received from the website.</p>
        <div style="background: #F5F5F7; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${payload.firstName} ${payload.lastName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${payload.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${payload.phone || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Branch:</strong> ${payload.location}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${payload.category}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${payload.subject}</p>
          <p style="margin: 20px 0 5px 0;"><strong>Details:</strong></p>
          <p style="margin: 0; font-style: italic;">"${payload.message}"</p>
        </div>
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
