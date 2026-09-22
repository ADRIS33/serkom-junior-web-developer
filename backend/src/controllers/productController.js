const db = require('../config/db');

function validateProduct(body) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const categoryId = Number(body.category_id);
  const price = Number(body.price);
  const stock = Number(body.stock);
  const image = String(body.image || '').trim();
  if (!Number.isInteger(categoryId) || categoryId <= 0) return { error: 'Kategori tidak valid.' };
  if (name.length < 3 || name.length > 150) return { error: 'Nama produk harus 3–150 karakter.' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Harga harus berupa angka >= 0.' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'Stok harus berupa bilangan bulat >= 0.' };
  if (image && !/^https?:\/\//i.test(image) && !image.startsWith('/')) return { error: 'URL gambar tidak valid.' };
  return { value: { categoryId, name, description, price, stock, image: image || null } };
}

const selectFields = `SELECT p.id,p.name,p.description,p.price,p.stock,p.image,p.category_id,c.name AS category_name,p.created_at FROM products p JOIN categories c ON c.id=p.category_id`;

async function getProducts(req, res) {
  const search = String(req.query.search || '').trim();
  const categoryId = Number(req.query.category_id || 0);
  const params = [];
  const where = [];
  if (search) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (categoryId) { where.push('p.category_id = ?'); params.push(categoryId); }
  const sql = `${selectFields} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY p.created_at DESC`;
  const [rows] = await db.query(sql, params);
  res.json(rows);
}

async function getProductById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID produk tidak valid.' });
  const [rows] = await db.query(`${selectFields} WHERE p.id = ? LIMIT 1`, [id]);
  if (!rows.length) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  res.json(rows[0]);
}

async function createProduct(req, res) {
  const validated = validateProduct(req.body);
  if (validated.error) return res.status(400).json({ message: validated.error });
  const { categoryId, name, description, price, stock, image } = validated.value;
  const [category] = await db.query('SELECT id FROM categories WHERE id=? LIMIT 1', [categoryId]);
  if (!category.length) return res.status(400).json({ message: 'Kategori tidak ditemukan.' });
  const [result] = await db.query('INSERT INTO products (category_id,name,description,price,stock,image) VALUES (?,?,?,?,?,?)', [categoryId,name,description || null,price,stock,image]);
  res.status(201).json({ message: 'Produk berhasil ditambahkan.', product_id: result.insertId });
}

async function updateProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID produk tidak valid.' });
  const validated = validateProduct(req.body);
  if (validated.error) return res.status(400).json({ message: validated.error });
  const { categoryId, name, description, price, stock, image } = validated.value;
  const [result] = await db.query('UPDATE products SET category_id=?,name=?,description=?,price=?,stock=?,image=? WHERE id=?', [categoryId,name,description || null,price,stock,image,id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  res.json({ message: 'Produk berhasil diperbarui.' });
}

async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID produk tidak valid.' });
  try {
    const [result] = await db.query('DELETE FROM products WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'Produk sudah memiliki riwayat transaksi dan tidak dapat dihapus.' });
    throw error;
  }
}
module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
