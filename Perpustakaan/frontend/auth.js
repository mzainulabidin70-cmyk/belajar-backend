const inputUser = document.querySelector('#inputUsername');
const inputPass = document.querySelector('#inputPassword');
const buttonLogin = document.querySelector('#tombolLogin');
const statusLogin = document.querySelector('#statusLogin');
const wadahAuth = document.querySelector('#wadahAuth');
const halamanUtama = document.querySelector('#halamanUtama');
const tombolLogout = document.querySelector('#tombolLogout');

function masukHalamanUtama() {
    if (wadahAuth) wadahAuth.classList.add('hidden');
    if (halamanUtama) halamanUtama.classList.remove('hidden');
    if (typeof ambilDataBuku === 'function') ambilDataBuku();
}

if (buttonLogin && inputUser && inputPass && statusLogin) {
    buttonLogin.addEventListener('click', async () => {
        const username = inputUser.value.trim();
        const password = inputPass.value;

        if (!username || !password) {
            statusLogin.textContent = 'Username dan password harus diisi!';
            return;
        }

        buttonLogin.disabled = true;

        try {
            const respon = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const hasil = await respon.json();

            if (!respon.ok) {
                statusLogin.textContent = hasil.pesan || 'Login gagal.';
                buttonLogin.disabled = false;
                return;
            }

            localStorage.setItem('tokenku', hasil.token);
            tampilkanLoadingNavigasi('Login berhasil, membuka dashboard...');
            window.location.replace(new URL('dashboard.html', window.location.href).href);
        } catch (error) {
            statusLogin.textContent = 'Gagal terhubung ke server backend!';
            buttonLogin.disabled = false;
        }
    });
}

if (tombolLogout) {
    tombolLogout.addEventListener('click', (event) => {
        event.preventDefault();
        tombolLogout.disabled = true;
        localStorage.removeItem('tokenku');
        tampilkanLoadingNavigasi('Sedang keluar...');

        setTimeout(() => {
            const halamanLogin = new URL('login.html', window.location.href);
            halamanLogin.searchParams.set('_refresh', Date.now());
            window.location.replace(halamanLogin.href);
        }, 3000);
    });
}

if (localStorage.getItem('tokenku') && halamanUtama) {
    masukHalamanUtama();
}
