const db = require('../config/db');

async function getOrCreateCart(userId) {
  const [rows] = await db.query('SELECT id FROM carts WHERE user_id=? LIMIT 1', [userId]);
  if (rows.length) return rows[0].id;
  const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
}

async function getCart(req, res) {
  const [items] = await db.query(`SELECT ci.id,ci.product_id,ci.quantity,p.name,p.price,p.stock,p.image,c.name AS category_name,(ci.quantity*p.price) subtotal FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id JOIN products p ON p.id=ci.product_id JOIN categories c ON c.id=p.category_id WHERE ca.user_id=? ORDER BY ci.id DESC`, [req.user.id]);
  res.json({ items, totalItems: items.reduce((s,i)=>s+Number(i.quantity),0), total: items.reduce((s,i)=>s+Number(i.subtotal),0) });
}

async function addToCart(req,res) {
  const productId=Number(req.body.product_id), quantity=Number(req.body.quantity || 1);
  if(!Number.isInteger(productId)||productId<1||!Number.isInteger(quantity)||quantity<1) return res.status(400).json({message:'Produk dan jumlah tidak valid.'});
  const [products]=await db.query('SELECT id,stock FROM products WHERE id=? LIMIT 1',[productId]);
  if(!products.length) return res.status(404).json({message:'Produk tidak ditemukan.'});
  if(Number(products[0].stock)<quantity) return res.status(400).json({message:'Jumlah melebihi stok produk.'});
  const cartId=await getOrCreateCart(req.user.id);
  const [items]=await db.query('SELECT id,quantity FROM cart_items WHERE cart_id=? AND product_id=? LIMIT 1',[cartId,productId]);
  const newQty=items.length?Number(items[0].quantity)+quantity:quantity;
  if(newQty>Number(products[0].stock)) return res.status(400).json({message:'Jumlah keranjang melebihi stok produk.'});
  if(items.length) await db.query('UPDATE cart_items SET quantity=? WHERE id=?',[newQty,items[0].id]);
  else await db.query('INSERT INTO cart_items(cart_id,product_id,quantity) VALUES(?,?,?)',[cartId,productId,quantity]);
  res.status(201).json({message:'Produk ditambahkan ke keranjang.'});
}

async function updateCartItem(req,res){
  const id=Number(req.params.id), quantity=Number(req.body.quantity);
  if(!Number.isInteger(id)||id<1||!Number.isInteger(quantity)||quantity<1) return res.status(400).json({message:'Data jumlah tidak valid.'});
  const [rows]=await db.query('SELECT ci.id,p.stock FROM cart_items ci JOIN carts c ON c.id=ci.cart_id JOIN products p ON p.id=ci.product_id WHERE ci.id=? AND c.user_id=? LIMIT 1',[id,req.user.id]);
  if(!rows.length) return res.status(404).json({message:'Item keranjang tidak ditemukan.'});
  if(quantity>Number(rows[0].stock)) return res.status(400).json({message:'Jumlah melebihi stok produk.'});
  await db.query('UPDATE cart_items SET quantity=? WHERE id=?',[quantity,id]);
  res.json({message:'Jumlah diperbarui.'});
}
async function deleteCartItem(req,res){
  const id=Number(req.params.id);
  const [result]=await db.query('DELETE ci FROM cart_items ci JOIN carts c ON c.id=ci.cart_id WHERE ci.id=? AND c.user_id=?',[id,req.user.id]);
  if(!result.affectedRows) return res.status(404).json({message:'Item keranjang tidak ditemukan.'});
  res.json({message:'Item dihapus dari keranjang.'});
}
module.exports={getCart,addToCart,updateCartItem,deleteCartItem};
