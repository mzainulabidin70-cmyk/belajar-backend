require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('./database.js');

const app = express();
const port = 3000;

app.use(express.json());

const kodeRahasia = process.env.JWT_SECRET || 'databaseSaya';

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password);

        if (error) throw error;

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Gagal login: Username atau password salah!"
            });
        }

        const user = users[0];

        const token = jwt.sign(
            {id: user.id, username: user.username},
            kodeRahasia,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            pesan: "Login berhasil lewat Supabase!",
            token: token
        });
    } catch (error) {
        return res.status(500).json({
            pesan: "Error Supabase",
            error: error.message
        });
    }
});

app.get('/me', async (req, res) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            pesan: "Token tidak ditemukan"
        });
    }

    try {
        const decoded = jwt.verify(token, kodeRahasia);
        const {data: users, error} = await supabase
        .from('users')
        .select('id, username, nama_lengkap, email')
        .eq('id', decoded.id);

    if (error) throw error;

    if (!users || users.length === 0) {
        return res.status(404).json({
            pesan: "User tidak ditemukan"
        });
    }

    return res.json({
        success: true,
        pesan: "Berhasil mengambil data dari Supabase",
        user: users[0]
    });

    } catch (error) {
        return res.status(403).json({
            pesan: "Token kadaluwarsa atau tidak valid!"
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});