const db = require('../config/db');
async function dashboard(req,res){
  const [[products]] = await db.query('SELECT COUNT(*) total FROM products');
  const [[users]] = await db.query("SELECT COUNT(*) total FROM users WHERE role='user'");
  const [[orders]] = await db.query('SELECT COUNT(*) total FROM orders');
  const [[revenue]] = await db.query("SELECT COALESCE(SUM(total),0) total FROM orders WHERE status <> 'cancelled'");
  res.json({products:products.total,users:users.total,orders:orders.total,revenue:revenue.total});
}
module.exports={dashboard};
