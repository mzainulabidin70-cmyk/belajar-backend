const express = require('express');
const app = express();
const port = 3000;

app.set('json spaces', 2);

const dataLaptop = [
    { id: 1, name: "Lenovo" },
    { id: 2, name: "ROG" },
    { id: 3, name: "Acer" },
    { id: 4, name: "Apple" }
];


app.get('/data', (req, res) => {
    res.json(dataLaptop);
});

app.get('/data/:laptop', (req, res) => {
    const menyimpan = req.params.laptop;
    const menentukan = dataLaptop.find(lap => lap.id === Number(menyimpan));

    if (menentukan) {
        res.json(menentukan);
    } else {
        res.status(404).send("pesan: Mana ada laptop di ID ini ,cari yang lain!");
    };
});

app.listen(port, () => {
    console.log(`Server saya selalu aktif di: http://localhost:${port}`);
});