const express = require('express');
const app = express();
const port = 3000;
const data = {
    nama: "Zainul",
    status: "Magang"
};

const daftarNamaBuku = [
    { id: 1, nama: "Laskar pelangi", tahun: 2005 },
    { id: 2, nama: "Perahu kertas", tahun: 2009 },
    { id: 3, nama: "Negri 5 negara", tahun: 2009 }
];

app.get('/me', (req, res) => {
    res.json(data);
});

app.get('/book', (req, res) => {
    res.json(daftarNamaBuku);
});

app.listen(port, () => {
    console.log(`Server express di https://localhost:${port}`);
});