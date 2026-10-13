const express = require('express');
const jwt = require('jsonwebtoken');

const { verifikasiToken, cekAdmin, validasiBukuBaru } = require('./middleware');

const app = express();
const port = 3000;

app.use(express.json());
const secretKey = 'menguji coba';

const databasePengguna = [
    { id: "1", username: "Zainul", password: "Punya Zainul", role: "admin", name: "Zainul"},
    { id: "2", username: "Hairul", password: "Punya Hairul", role: "magang", name: "Hairul"}
];

const databaseBuku = [
    { slug: "laskar-pelangi", judul: "Laskar Pelangi", penulis: "Andrean Hirata", tahun: 2005, },
    { slug: "bumi-manusia", judul: "Bumi Manusia", penulis: "Pramoedya Ananta Toer", tahun: 1980, }
];

const databasePenulis = [
    { slug: "andrea-hirata", nama: "Andrean Hirata", asal: "Belitung" },
    { slug: "pramoedya", nama: "Pramoedya Ananta Toer", asal: "Blora" }
];


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userDitemukan = databasePengguna.find((user) => user.username === username && user.password === password);

    if (userDitemukan) {
        const payload = {
            id: userDitemukan.id,
            role: userDitemukan.role,
            name: userDitemukan.name
        }
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        return res.json({ pesan: "Login berhasil", token });
    }
    return res.status(401).json({ pesan: "Gagal login" });
});

app.get('/me', verifikasiToken, (req, res) => {
    const userDitemukan = databasePengguna.find((user) => user.id === req.user.id);

    if (!userDitemukan) {
        return res.status(404).json({ pesan: "User tidak ditemukan" });
    }

    const totalBuku = databaseBuku.filter((buku) => buku.penulis.toLowerCase() === userDitemukan.name.toLowerCase()).length;

    return res.json({
        pesan: "Berhasil mengambil data profil",
        data: {
            id: userDitemukan.id,
            nama: userDitemukan.name,
            username: userDitemukan.username,
            role: userDitemukan.role,
            totalBuku: totalBuku
        }
    });
});

app.get('/me-admin', verifikasiToken, cekAdmin, (req, res) => {
    return res.json({
        pesan: "Selamat datang admin"
    });
});

//================================================

app.get('/books', (req, res) => {
    return res.json({
        pesan: "Berhasil mengambil semua data buku",
        data: databaseBuku
    });
});

app.get('/books/:slug', (req, res) => {
    const slugg = req.params.slug;
    const bukuDitemukan = databaseBuku.find((buku) => buku.slug === slugg);

    if (!bukuDitemukan) {
        return res.status(404).json({ pesan: "Buku tidak ditemukan"});
    }

    return res.json({
        pesan: "Buku berhasil ditemukan",
        data: bukuDitemukan
    });
});

app.post('/books', validasiBukuBaru, (req, res) => {
    const { judul, penulis, tahun } = req.body;
    const slugBaru = judul.toLowerCase().replace(/ /g, "-");

    const bukuBaru = { slug: slugBaru, judul, penulis, tahun };
    databaseBuku.push(bukuBaru);

    return res.status(201).json({
        pesan: "Buku baru berhasil ditambahkan!",
        data: bukuBaru
    });
});

app.get('/authors', (req, res) => {
    const totalBukuPenulis = databasePenulis.map((penulis) => {
        const totalBuku = databaseBuku.filter((buku) => buku.penulis.toLowerCase() === penulis.nama.toLowerCase()).length;

        return {
            slug: penulis.slug,
            nama: penulis.nama,
            asal: penulis.asal,
            totalBuku: totalBuku
        };
    });

    return res.json({
        pesan: "Berhasil mengambil semua data penulis",
        data: totalBukuPenulis
    });
});

app.get('/authors/:slug', (req, res) => {
    const slugg = req.params.slug;

    const penulisDitemukan = databasePenulis.find((p) => p.slug === slugg);

    if (!penulisDitemukan) {
        return res.status(404).json({ pesan: "Penulis tidak ditemukan!" });
    }

    return res.json({ 
        pesan: "Penulis berhasil ditemukan",
        data: {
            nama: penulisDitemukan.nama,
            asal: penulisDitemukan.asal
        } 
    });
});

//=================================================

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});