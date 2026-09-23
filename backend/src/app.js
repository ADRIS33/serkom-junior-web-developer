const express = require('express');
const cors = require('cors');

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Contoh Route Sederhana / Health Check
app.get('/', (req, res) => {
    jsonResponse = {
        status: 'success',
        message: 'Kriya Kita API is running smoothly!'
    };
    res.json(jsonResponse);
});

// Import dan gunakan routes kamu di sini (sesuaikan dengan nama file routernya jika ada)
// Contoh:
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

module.exports = app;