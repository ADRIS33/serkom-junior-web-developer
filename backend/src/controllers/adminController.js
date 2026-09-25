const db = require('../config/db');
async function dashboard(req,res){
  const [[products]] = await db.query('SELECT COUNT(*) total FROM products');
  const [[users]] = await db.query("SELECT COUNT(*) total FROM users WHERE role='user'");
  const [[orders]] = await db.query('SELECT COUNT(*) total FROM orders');
  const [[revenue]] = await db.query("SELECT COALESCE(SUM(total),0) total FROM orders WHERE status <> 'cancelled'");
  res.json({products:products.total,users:users.total,orders:orders.total,revenue:revenue.total});
}

async function salesReport(req,res){
  const today = new Date();
  const defaultTo = today.toISOString().slice(0,10);
  const defaultFrom = new Date(today.getTime() - 29*24*60*60*1000).toISOString().slice(0,10);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from||'') ? req.query.from : defaultFrom;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to||'') ? req.query.to : defaultTo;
  const toExclusive = new Date(new Date(to+'T00:00:00').getTime() + 24*60*60*1000).toISOString().slice(0,10);

  const [[summary]] = await db.query(
    `SELECT COUNT(*) total_orders, COALESCE(SUM(total),0) total_revenue
     FROM orders WHERE status <> 'cancelled' AND created_at >= ? AND created_at < ?`,
    [from, toExclusive]
  );
  const [[itemsRow]] = await db.query(
    `SELECT COALESCE(SUM(oi.quantity),0) total_items
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'cancelled' AND o.created_at >= ? AND o.created_at < ?`,
    [from, toExclusive]
  );
  const [daily] = await db.query(
    `SELECT DATE(created_at) date, COUNT(*) orders, COALESCE(SUM(total),0) revenue
     FROM orders WHERE status <> 'cancelled' AND created_at >= ? AND created_at < ?
     GROUP BY DATE(created_at) ORDER BY date`,
    [from, toExclusive]
  );
  const [topProducts] = await db.query(
    `SELECT oi.product_id, oi.product_name name, SUM(oi.quantity) qty_sold, SUM(oi.price*oi.quantity) revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'cancelled' AND o.created_at >= ? AND o.created_at < ?
     GROUP BY oi.product_id, oi.product_name
     ORDER BY qty_sold DESC LIMIT 10`,
    [from, toExclusive]
  );
  const [statusBreakdown] = await db.query(
    `SELECT status, COUNT(*) total FROM orders
     WHERE created_at >= ? AND created_at < ? GROUP BY status`,
    [from, toExclusive]
  );

  res.json({
    range: { from, to },
    summary: {
      total_orders: summary.total_orders,
      total_revenue: summary.total_revenue,
      total_items: itemsRow.total_items
    },
    daily,
    top_products: topProducts,
    status_breakdown: statusBreakdown
  });
}

module.exports={dashboard,salesReport};