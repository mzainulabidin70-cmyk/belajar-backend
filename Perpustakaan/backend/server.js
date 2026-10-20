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

app.get('/books', verifikasiToken, async (req, res) => {
    try {
        const hasil = await pool.query('SELECT slug, judul, penulis, tahun FROM buku ORDER BY id DESC');
        return res.json({
            pesan: "Data buku berhasil diambil",
            data: hasil.rows
        });
    } catch (error) {
        console.error('Gagal mengambil data buku:', error);
        return res.status(500).json({ pesan: "Gagal mengambil data dari database" });
    }
});

app.post('/books', verifikasiToken, async (req, res) => {
    const { judul, penulis, tahun } = req.body;
    if (!judul || !penulis || !tahun) {
        return res.status(400).json({ pesan: "Semua data buku harus diisi!" });
    }
    
    const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-\$)+/g, '');
    
    try {
        const query = 'INSERT INTO buku (slug, judul, penulis, tahun) VALUES (\$1, \$2, \$3, \$4) RETURNING *';
        const hasil = await pool.query(query, [slug, judul, penulis, parseInt(tahun)]);
        return res.status(201).json({ pesan: "Buku berhasil ditambahkan ke database", data: hasil.rows[0] });
    } catch (error) {
        console.error('Gagal menambah buku:', error);
        return res.status(500).json({ pesan: "Gagal menyimpan buku baru ke database" });
    }
});

app.put('/books/:slug', verifikasiToken, async (req, res) => {
    const { slug } = req.params;
    const { judul, penulis, tahun } = req.body;
    
    if (!judul || !penulis || !tahun) {
        return res.status(400).json({ pesan: "Semua data perubahan buku harus diisi!" });
    }
    
    const slugBaru = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-\$)+/g, '');
    
    try {
        const query = 'UPDATE buku SET slug = \$1, judul = \$2, penulis = \$3, tahun = \$4 WHERE slug = \$5 RETURNING *';
        const hasil = await pool.query(query, [slugBaru, judul, penulis, parseInt(tahun), slug]);
        
        if (hasil.rows.length === 0) {
            return res.status(404).json({ pesan: "Buku tidak ditemukan di database!" });
        }
        return res.json({ pesan: "Buku berhasil diperbarui di database", data: hasil.rows[0] });
    } catch (error) {
        console.error('Gagal memperbarui buku:', error);
        return res.status(500).json({ pesan: "Gagal memperbarui data buku di database" });
    }
});

app.delete('/books/:slug', verifikasiToken, async (req, res) => {
    const { slug } = req.params;
    try {
        const query = 'DELETE FROM buku WHERE slug = \$1 RETURNING *';
        const hasil = await pool.query(query, [slug]);
        
        if (hasil.rows.length === 0) {
            return res.status(404).json({ pesan: "Buku tidak ditemukan di database!" });
        }
        return res.json({ pesan: "Buku berhasil dihapus dari database" });
    } catch (error) {
        console.error('Gagal menghapus buku:', error);
        return res.status(500).json({ pesan: "Gagal menghapus data buku dari database" });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});