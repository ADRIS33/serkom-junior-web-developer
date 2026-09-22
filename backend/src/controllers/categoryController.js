const db = require('../config/db');
async function getCategories(req, res) {
  const [rows] = await db.query('SELECT id,name,description FROM categories ORDER BY name ASC');
  res.json(rows);
}
module.exports = { getCategories };
