const express = require('express');
const jwt = require('jsonwebtoken');

const { verifikasiToken, cekAdmin, validasiBukuBaru, peminjamanBuku } = require('./middleware');

const app = express();
const port = 3000;

app.use(express.json());
const secretKey = 'menguji coba';

const databasePengguna = [
    { id: "1", username: "Zainul", password: "Punya Zainul", role: "admin", name: "Zainul"},
    { id: "2", username: "Hairul", password: "Punya Hairul", role: "magang", name: "Hairul"}
];

const databaseBuku = [
    { slug: "laskar-pelangi", judul: "Laskar Pelangi", penulis: "Andrean Hirata", tahun: 2005, dipinjamOleh: null },
    { slug: "bumi-manusia", judul: "Bumi Manusia", penulis: "Pramoedya Ananta Toer", tahun: 1980, dipinjamOleh: null }
];

const databasePenulis = [
    { slug: "andrea-hirata", nama: "Andrea Hirata", asal: "Belitung" },
    { slug: "pramoedya", nama: "Pramoedya Ananta Toer", asal: "Blora" }
];

app.get('/', (req, res) => {
    res.send("Menguji apakah ini berhasil dan muncul dihalaman web");
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userDitemukan = databasePengguna.find((user) => user.username === username && user.password === password);

if (userDitemukan) {
    const payload = {
        id: userDitemukan.id,
        role: userDitemukan.role,
        name: userDitemukan.name
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    return res.json({
        pesan: "Login berhasil",
        token: token
    });
  } else {
    return res.status(401).json({
        pesan: "Gagal login"
    });
   }
});

app.get('/me', verifikasiToken, (req, res) => {
    return res.json({
        pesan: "Berhasil mengakses data", profil: req.user
    });
});

app.get('/me-admin', verifikasiToken, cekAdmin, (req, res) => {
    return res.json({
        pesan: "Selamat datang admin"
    });
});

//================================================

app.get('/books', (req, res) => {
    return res.json(databaseBuku);
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
    return res.json(databasePenulis);
});

app.get('/authors/:slug', (req, res) => {
    const slugg = req.params.slug;
    const penulisDitemukan = databasePenulis.find((p) => p.slug === slugg);

    if (!penulisDitemukan) {
        return res.status(404).json({ pesan: "Penulis tidak ditemukan!" });
    }

    return res.json({ pesan: "Penulis berhasil ditemukan" });
});

//=================================================

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});