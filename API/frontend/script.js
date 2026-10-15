const inputUser = document.querySelector('#inputUsername');
const inputPass = document.querySelector('#inputPassword');
const buttonLogin = document.querySelector('#tombolLogin');
const statusLogin = document.querySelector('#statusLogin');
const wadahAuth = document.querySelector('#wadahAuth');
const halamanUtama = document.querySelector('#halamanUtama');
const wadahBuku = document.querySelector('#wadahBuku');
const tombolLogout = document.querySelector('#tombolLogout');

buttonLogin?.addEventListener('click', async () => {
    const username = inputUser.value.trim();
    const password = inputPass.value;

    if (!username || !password) {
        statusLogin.innerText = 'Username dan password harus diisi!';
        return;
    }

    try {
        const respon = await fetch('http://127.0.0.1:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const hasil = await respon.json();

        if (respon.ok) {
            localStorage.setItem('tokenku', hasil.token);
            statusLogin.innerText = 'Login berhasil!';
            masukHalamanUtama();
        } else {
            statusLogin.innerText = hasil.pesan;
        }
    } catch (error) {
        statusLogin.innerText = 'Gagal terhubung ke server backend!';
    }
});

function masukHalamanUtama() {
    if (wadahAuth) wadahAuth.style.display = 'none';
    if (halamanUtama) halamanUtama.style.display = 'block';
    ambilDataBuku();
}

tombolLogout?.addEventListener('click', () => {
    localStorage.removeItem('tokenku');
    location.reload();
});

async function ambilDataBuku() {
    const token = localStorage.getItem('tokenku');
    if (!token) {
        wadahBuku.innerText = 'Error: Token tidak ditemukan. Silakan login ulang.';
        return;
    }

    wadahBuku.innerText = 'Tunggu bentar, lagi ngambil data...';

    try {
       const respon = await fetch('http://127.0.0.1:3000/books', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('tokenku')
            }
        });
        const hasil = await respon.json();

        if (!respon.ok) {
            wadahBuku.innerText = hasil.pesan;
            return;
        }

        wadahBuku.innerHTML = `<h3>${hasil.pesan}</h3>`;

        hasil.data.forEach((buku) => {
            wadahBuku.innerHTML += `
                <div style="border: 2px solid black; padding: 15px; margin-bottom: 15px; border-radius: 8px; width: 300px;">
                    <h2 style="margin: 0 0 10px 0;">${buku.judul}</h2>
                    <p style="margin: 5px 0;"><strong>Penulis:</strong> ${buku.penulis}</p>
                    <p style="margin: 5px 0;"><strong>Tahun Terbit:</strong> ${buku.tahun}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: gray;">Slug: ${buku.slug}</p>
                </div>
            `;
        });
    } catch (error) {
        wadahBuku.innerText = 'Gagal terhubung ke server backend buku!';
    }
}

if (localStorage.getItem('tokenku')) {
    masukHalamanUtama();
}
