const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const dataYangDiambil = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Koneksi databse terputus");
            resolve({id: 1, name: "MobileLegend Bang-bang"});
        }, 3000);
    });
};

app.get('/test-game', async (req, res) => {
    try {

    const dataGame = await ambilDataGameLambat();

    res.json({
        pesan: "Mencoba mengambil data game lambat",
        data: dataGame
    });
} catch (error) {
    console.log("Log Error untuk programer:", error);
     
    res.status(500).json({
        pesan: "Maaf, server kali sedang mengalami gangguan"
    });
}
});

app.listen(port, () => {
    console.log(`Server latihan jalan di http://localhost:${port}`);
});