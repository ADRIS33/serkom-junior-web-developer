const { verifyUser } = require('../config/auth');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
  try { req.user = verifyUser(token); next(); }
  catch { return res.status(401).json({ message: 'Sesi tidak valid atau sudah kedaluwarsa.' }); }
}

module.exports = requireAuth;
