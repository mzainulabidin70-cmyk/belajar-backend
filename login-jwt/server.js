const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());

const dataMurid = [
    { id: '1', username: 'Zainul', password: 'Punya Zainul', role: 'admin', name: 'Zainul' },
    { id: '2', username: 'Hairul', password: 'Punya Hairul', role: 'magang', name: 'Hairul' }
];

const kodeRahasia = 'Mengetes';

app.get('/', (req, res) => {
    res.send("Mengetes web blablablabla");
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const memasukanData = dataMurid.find(
        (user) => user.username === username && user.password === password
    );

    if (memasukanData) {
        const payload = {
            id: memasukanData.id,
            role: memasukanData.role,
            name: memasukanData.name
        };
        const token = jwt.sign(payload, kodeRahasia, { expiresIn: '24h' });
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

app.get('/me', (req, res) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(403).json({
            pesan: "Kamu siapa hah?????"
        });
    }

    try {
        const token = header.split(' ')[1];
        const user = jwt.verify(token, kodeRahasia);

        return res.json({
            pesan: "Data user",
            user: user
        });
    } catch (error) {
        return res.status(401).json({
            pesan: "Token tidak valid"
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di: http://localhost:${port}`);
});
