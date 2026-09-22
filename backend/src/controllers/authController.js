const db = require('../config/db');
const { signUser, hashPassword, comparePassword } = require('../config/auth');

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

async function register(req, res) {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  if (name.length < 3 || name.length > 80) return res.status(400).json({ message: 'Nama harus 3–80 karakter.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Format email tidak valid.' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Password minimal 6 karakter.' });
  if (name.toLowerCase() === 'admin.admin') return res.status(400).json({ message: 'Nama tersebut khusus akun administrator.' });
  const [exists] = await db.query('SELECT id FROM users WHERE email = ? OR name = ? LIMIT 1', [email, name]);
  if (exists.length) return res.status(409).json({ message: 'Email atau nama pengguna sudah terdaftar.' });
  const passwordHash = await hashPassword(password);
  const [result] = await db.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,\'user\')', [name, email, passwordHash]);
  res.status(201).json({ message: 'Registrasi berhasil.', user_id: result.insertId });
}

async function login(req, res) {
  const identity = String(req.body.login || req.body.email || '').trim();
  const password = req.body.password;
  if (!identity || !password) return res.status(400).json({ message: 'Email/nama pengguna dan password wajib diisi.' });
  const [rows] = await db.query('SELECT id,name,email,password,role FROM users WHERE email = ? OR name = ? LIMIT 1', [identity.toLowerCase(), identity]);
  if (!rows.length || !(await comparePassword(password, rows[0].password))) return res.status(401).json({ message: 'Email/nama pengguna atau password salah.' });
  const user = rows[0];
  const token = signUser(user);
  res.json({ message: 'Login berhasil.', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

async function profile(req, res) {
  const [rows] = await db.query('SELECT id,name,email,role,created_at FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
  res.json(rows[0]);
}

module.exports = { register, login, profile };
