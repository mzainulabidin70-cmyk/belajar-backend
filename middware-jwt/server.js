const express = require('express');
const jwt = require('jsonwebtoken');

const { verifikasiToken, cekAdmin } = require('./middleware');

const app = express();
const port = 3000;

app.use(express.json());
const secretKey = 'menguji coba';

const databasePengguna = [
    { id: "1", username: "Zainul", password: "Punya Zainul", role: "admin", name: "Zainul"},
    { id: "2", username: "Hairul", password: "Punya Hairul", role: "magang", name: "Hairul"}
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

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});