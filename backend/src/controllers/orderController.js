const db = require('../config/db');

async function createOrder(req,res){
  const name=String(req.body.recipient_name||'').trim();
  const phone=String(req.body.phone||'').trim();
  const address=String(req.body.address||'').trim();
  const payment=String(req.body.payment_method||'').trim();
  if(name.length<3||phone.length<8||address.length<10||!['bank_transfer','cod','ewallet'].includes(payment)) return res.status(400).json({message:'Data checkout belum lengkap atau tidak valid.'});
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const [items]=await conn.query(`SELECT ci.product_id,ci.quantity,p.name,p.price,p.stock FROM carts c JOIN cart_items ci ON ci.cart_id=c.id JOIN products p ON p.id=ci.product_id WHERE c.user_id=? FOR UPDATE`,[req.user.id]);
    if(!items.length) return await rollbackAnd(res,conn,400,'Keranjang masih kosong.');
    for(const item of items) if(Number(item.quantity)>Number(item.stock)) return await rollbackAnd(res,conn,400,`Stok ${item.name} tidak mencukupi.`);
    const total=items.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0);
    const [order]=await conn.query(`INSERT INTO orders(user_id,recipient_name,phone,address,payment_method,total,status) VALUES(?,?,?,?,?,?,?)`,[req.user.id,name,phone,address,payment,total,'pending']);
    for(const item of items){
      await conn.query('INSERT INTO order_items(order_id,product_id,product_name,price,quantity) VALUES(?,?,?,?,?)',[order.insertId,item.product_id,item.name,item.price,item.quantity]);
      await conn.query('UPDATE products SET stock=stock-? WHERE id=?',[item.quantity,item.product_id]);
    }
    const [cart]=await conn.query('SELECT id FROM carts WHERE user_id=? LIMIT 1',[req.user.id]);
    if(cart.length) await conn.query('DELETE FROM cart_items WHERE cart_id=?',[cart[0].id]);
    await conn.commit();
    res.status(201).json({message:'Pesanan berhasil dibuat.',order_id:order.insertId,total});
  }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}
async function rollbackAnd(res,conn,status,message){await conn.rollback();return res.status(status).json({message});}
async function getMyOrders(req,res){
  const [orders]=await db.query('SELECT id,recipient_name,phone,address,payment_method,total,status,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC',[req.user.id]);
  for(const order of orders){const [items]=await db.query('SELECT id,product_id,product_name,price,quantity FROM order_items WHERE order_id=? ORDER BY id',[order.id]);order.items=items;}
  res.json(orders);
}
async function getAllOrders(req,res){
  const [orders]=await db.query('SELECT o.id,o.user_id,o.recipient_name,o.phone,o.address,o.payment_method,o.total,o.status,o.created_at,u.name AS customer_name,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC');
  res.json(orders);
}
async function updateOrderStatus(req,res){
  const id=Number(req.params.id), status=String(req.body.status||'');
  const allowed=['pending','processing','shipped','completed','cancelled'];
  if(!allowed.includes(status)) return res.status(400).json({message:'Status pesanan tidak valid.'});
  const [result]=await db.query('UPDATE orders SET status=? WHERE id=?',[status,id]);
  if(!result.affectedRows) return res.status(404).json({message:'Pesanan tidak ditemukan.'});
  res.json({message:'Status pesanan diperbarui.'});
}
module.exports={createOrder,getMyOrders,getAllOrders,updateOrderStatus};
