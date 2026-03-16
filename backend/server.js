const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3001;
const JWT_SECRET = 'thecircle_admin_secret_2026';

// ─── Email Setup ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with some shared hosting certificates
  }
});

async function sendBookingConfirmation(payload, bookingId) {
  const isMeeting = payload.type === 'meeting';
  const branchName = payload.branch === 'kafr-abdo' ? 'Kafr Abdo' : 'Roushdy';
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
              <img src="cid:logo" alt="The Circle" width="70" style="display: block; margin: 0 auto;">
            </div>

            <div class="hero">
              <h1>Confirmed.</h1>
              <p>Everything is set for your visit to ${branchName}.</p>
            </div>

            <div class="card">
              <span class="card-title">Reservation Details</span>
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">The Circle ${branchName}</span>
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
      { filename: 'logo.png', path: path.join(__dirname, '../assets/logo.png'), cid: 'logo' },
      { filename: 'ig.png',   path: path.join(__dirname, '../assets/ig_black.png'), cid: 'ig' },
      { filename: 'fb.png',   path: path.join(__dirname, '../assets/fb_black.png'), cid: 'fb' },
      { filename: 'li.png',   path: path.join(__dirname, '../assets/li_black.png'), cid: 'li' },
      { filename: 'tt.png',   path: path.join(__dirname, '../assets/tt_black.png'), cid: 'tt' },
      { filename: 'wa.png',   path: path.join(__dirname, '../assets/wa_black.png'), cid: 'wa' }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${payload.email}`);
  } catch (error) {
  }
}

async function sendTeamNotification(payload, bookingId) {
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
        <p style="font-size: 13px; color: #86868b;">Booking ID: #${bookingId}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📡 Team notification sent for booking #${bookingId}`);
  } catch (error) {
    console.error(`❌ Team notification failed:`, error.message);
  }
}

async function sendSupportTeamNotification(payload, supportId) {
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
        <p style="font-size: 13px; color: #86868b;">Request ID: #SR-${supportId}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📡 Support team notification sent for request #SR-${supportId}`);
  } catch (error) {
    console.error(`❌ Support notification failed:`, error.message);
  }
}

async function syncToInternalSystem(bookingId) {
  const supabaseUrl = process.env.INTERNAL_SYSTEM_URL;
  const supabaseKey = process.env.INTERNAL_SYSTEM_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log(`⚠️ Supabase sync skipped: Credentials missing in .env`);
    return;
  }

  try {
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);
    if (!booking) return;

    // Map local data to Supabase schema
    const data = {
      id: `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      booker_name: booking.name,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      resource_type: booking.type === 'meeting' ? 'room' : 'desk',
      booker_type: 'visitor',
      status: 'pending',
      branch_id: booking.branch, // Assumes branch IDs match slugs
      notes: `Phone: ${booking.phone}\n${booking.notes || ''}`.trim(),
      created_at: new Date().toISOString()
    };

    // Construct Supabase REST URL
    const url = `${supabaseUrl}/rest/v1/bookings`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log(`✅ Booking #${bookingId} synced to "thecircle-main" (Supabase)`);
    } else {
      const errText = await response.text();
      console.error(`❌ Supabase Sync Failed (${response.status}):`, errText);
    }
  } catch (error) {
    console.error(`❌ Internal sync error:`, error.message);
  }
}

// ─── DB Setup ────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'bookings.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    branch TEXT NOT NULL,
    type TEXT DEFAULT 'meeting',
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    attendees INTEGER DEFAULT 1,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default admin if not exists
const adminExists = db.prepare("SELECT id FROM admins WHERE username = 'admin'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('thecircle2026', 10);
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run('admin', hash);
  console.log('✅ Default admin created: username=admin, password=thecircle2026');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
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

// ─── Public: Submit Booking ───────────────────────────────────────────────────
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, branch, type, date, start_time, end_time, attendees, notes } = req.body;
  console.log(`[DEBUG] Booking attempt: type=${type}, branch=${branch}, date=${date}, slot=${start_time}-${end_time}`);
  if (!name || !email || !phone || !branch || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for conflicts ONLY if it's a meeting room
  if (type === 'meeting') {
    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE branch = ? AND type = 'meeting' AND date = ? AND status != 'cancelled'
      AND NOT (end_time <= ? OR start_time >= ?)
    `).get(branch, date, start_time, end_time);

    if (conflict) {
      console.log(`[DEBUG] Conflict found for meeting: ID ${conflict.id}`);
      return res.status(409).json({ error: 'That time slot is already booked. Please choose a different time.' });
    }
  } else {
    console.log(`[DEBUG] Skipping conflict check for type: ${type}`);
  }

  const result = db.prepare(`
    INSERT INTO bookings (name, email, phone, branch, type, date, start_time, end_time, attendees, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, email, phone, branch, type || 'meeting', date, start_time, end_time, attendees || 1, notes || '');

  // Send notifications and sync asynchronously (don't block the response)
  sendBookingConfirmation(req.body, result.lastInsertRowid);
  sendTeamNotification(req.body, result.lastInsertRowid);
  syncToInternalSystem(result.lastInsertRowid);

  res.json({ success: true, bookingId: result.lastInsertRowid });
});

// ─── Public: Submit Support Request ───────────────────────────────────────────
app.post('/api/support', (req, res) => {
  const { firstName, lastName, email, phone, location, category, subject, message } = req.body;
  
  if (!firstName || !lastName || !email || !location || !category || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = db.prepare(`
    INSERT INTO support_requests (first_name, last_name, email, phone, location, category, subject, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(firstName, lastName, email, phone || '', location, category, subject, message);

  // Send email notification
  sendSupportTeamNotification(req.body, result.lastInsertRowid);

  res.json({ success: true, requestId: result.lastInsertRowid });
});

// ─── Public: Check availability ──────────────────────────────────────────────
app.get('/api/availability', (req, res) => {
  const { branch, date } = req.query;
  if (!branch || !date) return res.status(400).json({ error: 'branch and date required' });

  const booked = db.prepare(`
    SELECT start_time, end_time FROM bookings
    WHERE branch = ? AND type = 'meeting' AND date = ? AND status != 'cancelled'
  `).all(branch, date);

  res.json({ booked });
});

// ─── Admin: Login ────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// ─── Admin: Get Bookings ──────────────────────────────────────────────────────
app.get('/api/admin/bookings', requireAuth, (req, res) => {
  const { status, branch, date } = req.query;
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (branch) { query += ' AND branch = ?'; params.push(branch); }
  if (date)   { query += ' AND date = ?';   params.push(date); }
  query += ' ORDER BY id DESC';
  const bookings = db.prepare(query).all(...params);
  res.json({ bookings });
});

// ─── Admin: Get Support Requests ──────────────────────────────────────────────
app.get('/api/admin/support', (req, res) => {
  const requests = db.prepare('SELECT * FROM support_requests ORDER BY id DESC').all();
  res.json({ requests });
});

// ─── Admin: Update Status ────────────────────────────────────────────────────
app.patch('/api/admin/bookings/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, req.params.id);
  
  if (status === 'confirmed') {
    syncToInternalSystem(req.params.id);
  }
  
  res.json({ success: true });
});

// ─── Admin: Delete Booking ────────────────────────────────────────────────────
app.delete('/api/admin/bookings/:id', requireAuth, (req, res) => {
  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ─── Admin: Stats ─────────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, (req, res) => {
  const total    = db.prepare("SELECT COUNT(*) as n FROM bookings").get().n;
  const pending  = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status='pending'").get().n;
  const confirmed= db.prepare("SELECT COUNT(*) as n FROM bookings WHERE status='confirmed'").get().n;
  const today    = db.prepare("SELECT COUNT(*) as n FROM bookings WHERE date=date('now')").get().n;
  res.json({ total, pending, confirmed, today });
});

// ─── Serve Dashboard ──────────────────────────────────────────────────────────
app.get(/^\/dashboard/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🟢 The Circle Booking Server running at http://localhost:${PORT}`);
    console.log(`📊 Admin dashboard at http://localhost:${PORT}/dashboard`);
    console.log(`🔑 Login: admin / thecircle2026\n`);
  });
}

module.exports = app;
