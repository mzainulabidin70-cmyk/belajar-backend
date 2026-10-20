const express = require('express');
const jwt = require('jsonwebtoken');
const { verifikasiToken, validasiBukuBaru } = require('./middleware');

const app = express();
const jwtSecret = 'menguji coba';

app.use(express.json());

const databaseBukuPalsu = [
    { judul: "Buku Belajar", penulis: "Andrea Hirata", tahun: 2024 }
];

const databasePenulisPalsu = [
    { nama: "Andrea Hirata", negara: "Indonesia" },
    { nama: "Ahmad Tohari", country: "Indonesia" }
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const token = jwt.sign({ username, role: 'admin' }, jwtSecret, { expiresIn: '1h' });
    return res.json({
        pesan: "Login berhasil",
        token: token
    });
});

app.get('/books', verifikasiToken, (req, res) => {
    return res.json({
        pesan: "Data buku berhasil diambil",
        data: databaseBukuPalsu
    });
});

app.post('/books', verifikasiToken, validasiBukuBaru, (req, res) => {
    const { judul, penulis, tahun } = req.body;
    const bukuBaru = { judul, penulis, tahun };
    databaseBukuPalsu.push(bukuBaru);
    return res.json({
        pesan: "Buku berhasil ditambahkan",
        data: bukuBaru
    });
});

app.get('/authors', verifikasiToken, (req, res) => {
    return res.json({
        pesan: "Data penulis berhasil diambil",
        data: databasePenulisPalsu
    });
});

app.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});
