const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
    throw new Error('Supabase environment variables (INTERNAL_SYSTEM_URL or INTERNAL_SYSTEM_KEY) are missing. Please add them to Vercel Settings.');
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
    throw new Error(`DB Error (${response.status}): ${err}`);
  }
  return await response.json();
}

// ─── Middleware ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('The Circle API (Serverless) is Running'));
app.get('/api/health', (req, res) => res.json({ 
    status: 'ok', 
    engine: 'serverless',
    config: {
        url: SUPABASE_URL ? 'set' : 'MISSING',
        key: SUPABASE_KEY ? 'set' : 'MISSING'
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

    res.json({ success: true, booking: result[0] });
  } catch (err) {
    console.error('SERVER ERROR (bookings):', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, category, subject, message } = req.body;
    const result = await supabaseRequest('support_requests', 'POST', {
      first_name: firstName,
      last_name: lastName,
      email, phone, location, category, subject, message
    });
    res.json({ success: true, request: result[0] });
  } catch (err) {
    console.error('SERVER ERROR (support):', err.message);
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

app.get(/^\/dashboard/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 The Circle Serverless API running on ${PORT}`);
});

module.exports = app;
