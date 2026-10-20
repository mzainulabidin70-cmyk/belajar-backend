const API_BASE_URL = 'http://localhost:3000';

const inputUser = document.querySelector('#inputUsername');
const inputPass = document.querySelector('#inputPassword');
const buttonLogin = document.querySelector('#tombolLogin');
const statusLogin = document.querySelector('#statusLogin');
const wadahAuth = document.querySelector('#wadahAuth');
const halamanUtama = document.querySelector('#halamanUtama');
const wadahBuku = document.querySelector('#wadahBuku');
const tombolLogout = document.querySelector('#tombolLogout');

const formSlug = document.querySelector('#formSlug');
const formJudul = document.querySelector('#formJudul');
const formPenulis = document.querySelector('#formPenulis');
const formTahun = document.querySelector('#formTahun');
const tombolSimpanBuku = document.querySelector('#tombolSimpanBuku');
const tombolBatalEdit = document.querySelector('#tombolBatalEdit');
const judulForm = document.querySelector('#judulForm');
const inputPencarianBuku = document.querySelector('#inputPencarianBuku, [id*="cari" i], [type="search"]');
const pesanBukuTidakDitemukan = document.createElement('p');
pesanBukuTidakDitemukan.textContent = 'Buku tidak ditemukan';
pesanBukuTidakDitemukan.style.cssText = 'display:none;margin:16px auto;text-align:center;color:#64748b;font-size:14px;font-weight:500;';
if (inputPencarianBuku) {
    pesanBukuTidakDitemukan.setAttribute('aria-live', 'polite');
    (inputPencarianBuku.form || inputPencarianBuku).insertAdjacentElement('afterend', pesanBukuTidakDitemukan);
}

function filterBuku() {
    if (!wadahBuku || !inputPencarianBuku) return;

    const kataKunci = inputPencarianBuku.value.trim().toLowerCase();
    const kartuBuku = wadahBuku.querySelectorAll('.kartu-buku');
    let bukuDitemukan = false;

    for (const kartu of kartuBuku) {
        const judul = kartu.querySelector('h4').textContent.toLowerCase();
        const cocok = judul.startsWith(kataKunci);
        kartu.classList.toggle('hidden', !cocok);
        if (cocok) bukuDitemukan = true;
    }

    pesanBukuTidakDitemukan.style.display = kataKunci && !bukuDitemukan ? 'block' : 'none';
}

if (inputPencarianBuku) {
    inputPencarianBuku.addEventListener('input', filterBuku);
    if (inputPencarianBuku.form) {
        inputPencarianBuku.form.addEventListener('submit', (event) => {
            event.preventDefault();
            filterBuku();
        });
    }
}

function tampilkanLoadingNavigasi(pesan) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.65);color:white;font:600 16px sans-serif;';
    const konten = document.createElement('div');
    konten.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px;';
    const spinner = document.createElement('div');
    spinner.style.cssText = 'width:42px;height:42px;border:4px solid rgba(255,255,255,.35);border-top-color:white;border-radius:50%;animation:loadingPutar .8s linear infinite;';
    const teks = document.createElement('span');
    teks.textContent = pesan;
    const gaya = document.createElement('style');
    gaya.textContent = '@keyframes loadingPutar{to{transform:rotate(360deg)}}';
    document.head.appendChild(gaya);
    konten.append(spinner, teks);
    overlay.appendChild(konten);
    document.body.appendChild(overlay);
}

if (buttonLogin) {
    buttonLogin.addEventListener('click', async () => {
        const username = inputUser.value.trim();
        const password = inputPass.value;

        if (!username || !password) {
            statusLogin.innerText = 'Username dan password harus diisi!';
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
                statusLogin.innerText = hasil.pesan;
                buttonLogin.disabled = false;
                return;
            }

            localStorage.setItem('tokenku', hasil.token);
            tampilkanLoadingNavigasi('Login berhasil, membuka dashboard...');
            await new Promise((selesai) => setTimeout(selesai, 3000));
            const halamanDashboard = new URL('dashboard.html', window.location.href);
            halamanDashboard.searchParams.set('_refresh', Date.now());
            window.location.replace(halamanDashboard.href);
        } catch (error) {
            statusLogin.innerText = 'Gagal terhubung ke server backend!';
            buttonLogin.disabled = false;
        }
    });
}

function masukHalamanUtama() {
    if (wadahAuth) wadahAuth.classList.add('hidden');
    if (halamanUtama) halamanUtama.classList.remove('hidden');
    ambilDataBuku();
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

async function ambilDataBuku() {
    if (!wadahBuku) return;

    const token = localStorage.getItem('tokenku');
    if (!token) {
        wadahBuku.innerHTML = '<div class="col-span-full p-4 text-center text-rose-500 font-bold bg-rose-50 rounded-xl">Error: Token tidak ditemukan. Silakan login ulang.</div>';
        return;
    }

    wadahBuku.innerHTML = '<div class="col-span-full p-4 text-center text-slate-500 font-medium">Tunggu bentar, lagi ngambil data...</div>';

    try {
        const respon = await fetch(`${API_BASE_URL}/books`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const hasil = await respon.json();

        if (!respon.ok) {
            wadahBuku.innerHTML = `<div class="col-span-full p-4 text-center text-rose-500 font-bold bg-rose-50 rounded-xl">${hasil && hasil.pesan ? hasil.pesan : 'Gagal memuat data buku.'}</div>`;
            return;
        }

        let daftarBuku = null;
        if (Array.isArray(hasil)) {
            daftarBuku = hasil;
        } else if (hasil) {
            daftarBuku = hasil.data;
        }

        if (!Array.isArray(daftarBuku)) {
            wadahBuku.innerHTML = '<div class="col-span-full p-4 text-center text-rose-500 font-bold bg-rose-50 rounded-xl">Format data buku dari server tidak valid.</div>';
            return;
        }

        if (daftarBuku.length === 0) {
            wadahBuku.innerHTML = '<div class="col-span-full p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">Belum ada koleksi buku. Silakan tambah data di samping!</div>';
            return;
        }

        wadahBuku.innerHTML = '';
        for (const buku of daftarBuku) {
            const kartu = document.createElement('div');
            kartu.className = 'kartu-buku bg-white p-5 rounded-2xl border border-slate-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-auto min-w-0 max-w-full [overflow-wrap:anywhere]';
            kartu.innerHTML = `
                <div>
                    <h4 class="font-black text-xl text-slate-800 tracking-tight mb-2">${buku.judul}</h4>
                    <div class="space-y-1 text-sm text-slate-600 mb-4">
                        <p><span class="text-slate-400 font-medium">Penulis:</span> <strong class="text-slate-700 font-semibold">${buku.penulis}</strong></p>
                        <p><span class="text-slate-400 font-medium">Tahun:</span> <strong class="text-slate-700 font-semibold">${buku.tahun}</strong></p>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-50 flex items-center justify-between gap-2 mt-auto">
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">Slug: ${buku.slug}</span>
                    <div class="flex gap-1.5 shrink-0">
                        <button class="tombol-edit bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition shadow-sm active:scale-95" data-slug="${buku.slug}" data-judul="${buku.judul}" data-penulis="${buku.penulis}" data-tahun="${buku.tahun}">Edit</button>
                        <button class="tombol-hapus bg-rose-50 hover:bg-rose-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition shadow-sm active:scale-95" data-slug="${buku.slug}">Hapus</button>
                    </div>
                </div>
            `;
            wadahBuku.appendChild(kartu);
        }

        filterBuku();
        inisialisasiAksiTombol();
    } catch (error) {
        wadahBuku.innerHTML = '<div class="col-span-full p-4 text-center text-rose-500 font-bold bg-rose-50 rounded-xl">Gagal terhubung ke server backend buku!</div>';
    }
}

if (tombolSimpanBuku) {
    tombolSimpanBuku.addEventListener('click', async () => {
        const token = localStorage.getItem('tokenku');
        const judul = formJudul.value.trim();
        const penulis = formPenulis.value.trim();
        const tahun = formTahun.value.trim();
        const slug = formSlug.value;

        if (!judul || !penulis || !tahun) {
            alert('Semua bidang data buku wajib diisi!');
            return;
        }

        const sedangEdit = slug !== '';
        let url = `${API_BASE_URL}/books`;
        let method = 'POST';
        if (sedangEdit) {
            url = `${API_BASE_URL}/books/${encodeURIComponent(slug)}`;
            method = 'PUT';
        }

        try {
            const respon = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ judul, penulis, tahun })
            });
            const hasil = await respon.json();

            if (respon.ok) {
                resetFormBuku();
                ambilDataBuku();
            } else {
                alert(hasil.pesan);
            }
        } catch (error) {
            alert('Gagal menyimpan data buku ke server!');
        }
    });
}

function inisialisasiAksiTombol() {
    document.querySelectorAll('.tombol-edit').forEach((tombol) => {
        tombol.addEventListener('click', (event) => {
            const dataBuku = event.target.dataset;
            formSlug.value = dataBuku.slug;
            formJudul.value = dataBuku.judul;
            formPenulis.value = dataBuku.penulis;
            formTahun.value = dataBuku.tahun;

            judulForm.innerText = 'Edit Data Buku';
            tombolBatalEdit.classList.remove('hidden');
            formJudul.focus();
        });
    });

    document.querySelectorAll('.tombol-hapus').forEach((tombol) => {
        tombol.addEventListener('click', async (event) => {
            const slug = event.target.dataset.slug;
            if (!confirm('Apakah kamu yakin ingin menghapus buku ini?')) return;

            const token = localStorage.getItem('tokenku');
            try {
                const respon = await fetch(`${API_BASE_URL}/${encodeURIComponent(slug)}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                if (respon.ok) {
                    ambilDataBuku();
                } else {
                    const hasil = await respon.json();
                    alert(hasil.pesan);
                }
            } catch (error) {
                alert('Gagal memproses penghapusan buku!');
            }
        });
    });
}

if (tombolBatalEdit) {
    tombolBatalEdit.addEventListener('click', resetFormBuku);
}

function resetFormBuku() {
    formSlug.value = '';
    formJudul.value = '';
    formPenulis.value = '';
    formTahun.value = '';
    judulForm.innerText = 'Tambah Buku Baru';
    tombolBatalEdit.classList.add('hidden');
}

if (localStorage.getItem('tokenku') && halamanUtama) {
    masukHalamanUtama();
}