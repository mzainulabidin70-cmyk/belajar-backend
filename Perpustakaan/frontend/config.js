const API_BASE_URL = 'http://localhost:3000';

function tampilkanLoadingNavigasi(pesan) {
    const loading = document.getElementById('loading-screen');
    const teks = document.getElementById('loading-text');
    
    teks.textContent = pesan;
    loading.classList.remove('hidden');
}

function sembunyikanLoadingNavigasi() {
    const loading = document.getElementById('loading-screen');
    loading.classList.add('hidden');
}
