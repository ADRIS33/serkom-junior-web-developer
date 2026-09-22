const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret';

function signUser(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
}

function verifyUser(token) { return jwt.verify(token, JWT_SECRET); }
function hashPassword(password) { return bcrypt.hash(password, 10); }
function comparePassword(password, hash) { return bcrypt.compare(password, hash); }

module.exports = { signUser, verifyUser, hashPassword, comparePassword };
