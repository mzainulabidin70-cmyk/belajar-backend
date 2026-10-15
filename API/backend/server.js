require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const jwtSecret = process.env.JWT_SECRET || 'menguji coba';

app.use(express.json());
app.use(cors());

const databaseBuku = [
    { slug: "laskar-pelangi", judul: "Laskar Pelangi", penulis: "Andrean Hirata", tahun: 2005, },
    { slug: "bumi-manusia", judul: "Bumi Manusia", penulis: "Pramoedya Ananta Toer", tahun: 1980, }
];

const verifikasiToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
        return res.status(401).json({ pesan: 'Token autentikasi wajib disertakan.' });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        return next();
    } catch (error) {
        return res.status(401).json({ pesan: 'Token tidak valid atau kedaluwarsa.' });
    }
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ pesan: "Username dan password wajib diisi!" });
    }

    try {
        const query = 'SELECT id, username, name, role FROM pengguna WHERE username = \$1 AND password = \$2';
        const hasil = await pool.query(query, [username, password]);

        if (hasil.rows.length === 0) {
            return res.status(401).json({ pesan: "Username atau password salah!" });
        }

        const userDitemukan = hasil.rows[0];
        const token = jwt.sign({ username: userDitemukan.username }, jwtSecret, { expiresIn: '1h' });

        return res.json({ pesan: "Login berhasil", token, user: userDitemukan });

    } catch (error) {
        console.error('Gagal memproses login:', error);
        return res.status(500).json({ pesan: "Terjadi kesalahan pada server" });
    }
});

app.get('/books', verifikasiToken, (req, res) => {
    return res.json({
        pesan: "Berhasil mengambil semua data buku",
        data: databaseBuku
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di: http://127.0.0.1:${port}`);
});
