const express = require('express');
const cors = require('cors');

// 1. Import routes yang sudah kamu buat
const authRoutes = require('./routes/authRoutes'); 
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (halaman depan JSON)
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Kriya Kita API is running smoothly!'
    });
});

// 2. Daftarkan dan aktifkan rute API di sini
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

module.exports = app;