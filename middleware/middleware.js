const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'menguji coba';

function verifikasiToken(req, res, next) {
    const autHeader = req.headers['authorization'];

    if (!autHeader) {
        return res.status(401).json({ pesan: "Akses ditolak! Kamu ni siapa?" });
    }

    const token = autHeader.split(' ')[1];

    try {
        const dataTerverifikasi = jwt.verify(token, secretKey);
        req.user = dataTerverifikasi;
        next();
    } catch (error) {
        return res.status(403).json({ pesan: "Token tidak valid!" });
    }
};

function validasiBukuBaru(req, res, next) {
    const { judul, penulis, tahun } = req.body;

    if (!judul)
        return res.status(400).json({ pesan: "Gagal!, Judul Buku harus diisi"});
    if (!penulis)
        return res.status(400).json({ pesan: "Gagal!, Nama penulis harus diisi"});
    if (!tahun || typeof tahun !== 'number') {
        return res.status(400).json({ pesan: "Gagal!, Tahun harus berupa angka"});
    };

    next();
}

module.exports = { verifikasiToken, validasiBukuBaru, };