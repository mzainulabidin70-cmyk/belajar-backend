const express = require('express');
const { createClient } = require('@supabase/supabase-js'); 

const app = express();
const port = 3000;

app.use(express.json());

const SUPERBASE_URL = 'https://fxjbxlitihywpjylwsjn.supabase.co'; 
const SUPERBASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4amJ4bGl0aWh5d3BqeWx3c2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDU5NTcsImV4cCI6MjEwNjEyMTk1N30.xrN1egPNGZkO8dZB6QZftzEm7ki6Puu5HWMoX2KMb8k';

const superbase = createClient(SUPERBASE_URL, SUPERBASE_KEY);

app.post('/author', async (req, res) => {
    const namaPenulis = req.body.name;
    
    const { data, error } = await superbase
        .from('author')
        .insert([{ name: namaPenulis }])
        .select();

    if (error) {
        res.status(500).json({
            pesan: "Gagal menyimpan data pemilik",
            error: error.message
        });
    } else {
        res.status(201).json({
            pesan: "Penulis berhasil disimpan di Supabase",
            data: data
        });
    }
});

app.listen(port, () => {
    console.log(`Server database aktif di: http://localhost:${port}`);
});