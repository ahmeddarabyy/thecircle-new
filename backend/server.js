console.log('--- STARTING THE CIRCLE API ---');
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'thecircle_admin_secret_2026';

console.log(`📡 Port detected: ${PORT}`);

// Basic routes that don't need DB
app.get('/', (req, res) => {
  console.log('👋 Root ping');
  res.send('The Circle API is ALIVE');
});

app.get('/api/health', (req, res) => {
  res.json({ live: true, timestamp: new Date().toISOString() });
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Handle (Lazy Loaded)
let _db;
function getDB() {
  if (!_db) {
    try {
      console.log('📂 Initializing SQL Database...');
      _db = new Database(path.join(__dirname, 'bookings.db'));
      _db.exec(`
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
      
      const adminExists = _db.prepare("SELECT id FROM admins WHERE username = 'admin'").get();
      if (!adminExists) {
        const hash = bcrypt.hashSync('thecircle2026', 10);
        _db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run('admin', hash);
      }
      console.log('✅ DB Ready');
    } catch (err) {
      console.error('❌ DB CRASH:', err.message);
      throw err;
    }
  }
  return _db;
}

// Routes
app.get('/api/availability', (req, res) => {
  try {
    const db = getDB();
    const { branch, date } = req.query;
    if (!branch || !date) return res.status(400).json({ error: 'Missing' });
    const booked = db.prepare(`SELECT start_time, end_time FROM bookings WHERE branch = ? AND type = 'meeting' AND date = ? AND status != 'cancelled'`).all(branch, date);
    res.json({ booked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const db = getDB();
    const { name, email, phone, branch, type, date, start_time, end_time, attendees, notes } = req.body;
    const result = db.prepare(`
        INSERT INTO bookings (name, email, phone, branch, type, date, start_time, end_time, attendees, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, branch, type || 'meeting', date, start_time, end_time, attendees || 1, notes || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support', (req, res) => {
  try {
      const db = getDB();
      const { firstName, lastName, email, phone, location, category, subject, message } = req.body;
      const result = db.prepare(`
          INSERT INTO support_requests (first_name, last_name, email, phone, location, category, subject, message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(firstName, lastName, email, phone || '', location, category, subject, message);
      res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const db = getDB();
    const { username, password } = req.body;
    const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) return res.status(401).send('Bad');
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get(/^\/dashboard/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🟢 API LIVE ON PORT ${PORT}`);
});

module.exports = app;
