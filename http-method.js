const express = require('express');
const app = express();
const port = 3000;

app.set('json spaces');
app.use(express.json());

let bumi = [
    { id: 1, name: "Tanah" },
    { id: 2, name: "Rumput" },
    { id: 3, name: "Langit" },
    { id: 4, name: "Awan" },
    { id: 5, name: "Batu" }
];

app.get('/data', (req, res) => {
    res.status(200).json(bumi);
});

app.get('/data/:id', (req, res) => {
    const idBumi = req.params.id;
    const mencariIdBumi = bumi.find(b => b.id === Number(idBumi));

    if (mencariIdBumi) {
        res.status(200).json(mencariIdBumi);
    } else {
        res.status(404).json({ pesan: "Data tidak ditemukan" });
    }
});

app.post('/data', (req, res) => {
    const membuatNama = req.body.name;
    const isiBumiBaru = {
        id: bumi.length + 1,
        name: membuatNama
    };

    bumi.push(isiBumiBaru);

    res.status(201).json({
        pesan: "Data berhasil ditambahkan",
        data: isiBumiBaru
    });
});

app.put('/data/:id', (req, res) => {
    const menyiapkanNama = req.params.id;
    const membuatNamaBaru = req.body.name;
    const menyaringDataUntukNamaBaru = bumi.find(b => b.id === Number(menyiapkanNama));

    if (menyaringDataUntukNamaBaru) {
        menyaringDataUntukNamaBaru.name = membuatNamaBaru;
        
        res.status(200).json({
            pesan: "Data berhasil diubah",
            data: menyaringDataUntukNamaBaru
        });
    } else {
        res.status(404).json({
            pesan: "Data tidak ditemukan"
        });
    }
});

app.delete('/data/:id', (req, res) => {
    const menghapusNama = req.params.id;
    const idYangMauDihapus = bumi.some(b => b.id === Number(menghapusNama));

    if (idYangMauDihapus) {
        bumi = bumi.filter(b => b.id !== Number(menghapusNama));

        res.status(200).json({
            pesan: "Data berhasil dihapus"
        });
    } else {
        res.status(404).json({
            pesan: "Data tidak ditemukan"
        });
    }
});

app.listen(port, () => {
    console.log(`Server saya selalu aktif well:http://localhost:${port}`);
});
