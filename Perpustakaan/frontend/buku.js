// --- BAGIAN 1: AMBIL ELEMEN HTML ---
const wadahBuku = document.querySelector('#wadahBuku');
const formSlug = document.querySelector('#formSlug');
const formJudul = document.querySelector('#formJudul');
const formPenulis = document.querySelector('#formPenulis');
const formTahun = document.querySelector('#formTahun');
const tombolSimpanBuku = document.querySelector('#tombolSimpanBuku');
const tombolBatalEdit = document.querySelector('#tombolBatalEdit');
const judulForm = document.querySelector('#judulForm');
const inputPencarianBuku = document.querySelector('#inputPencarianBuku, [id*="cari" i], [type="search"]');

// --- BAGIAN 2: FITUR PENCARIAN BUKU ---
const pesanBukuTidakDitemukan = document.createElement('p');
pesanBukuTidakDitemukan.textContent = 'Buku tidak ditemukan';
pesanBukuTidakDitemukan.style.cssText = 'display:none;margin:16px auto;text-align:center;color:#64748b;font-size:14px;font-weight:500;';
pesanBukuTidakDitemukan.setAttribute('aria-live', 'polite');

if (inputPencarianBuku) {
    (inputPencarianBuku.form || inputPencarianBuku).insertAdjacentElement('afterend', pesanBukuTidakDitemukan);
    inputPencarianBuku.addEventListener('input', filterBuku);

    if (inputPencarianBuku.form) {
        inputPencarianBuku.form.addEventListener('submit', (event) => {
            event.preventDefault();
            filterBuku();
        });
    }
}

function filterBuku() {
    if (!wadahBuku || !inputPencarianBuku) return;

    const kataKunci = inputPencarianBuku.value.trim().toLowerCase();
    const kartuBuku = wadahBuku.querySelectorAll('.kartu-buku');
    let adaBuku = false;

    kartuBuku.forEach((kartu) => {
        const elemenJudul = kartu.querySelector('h4');
        const judul = elemenJudul ? elemenJudul.textContent.toLowerCase() : '';
        const cocok = judul.startsWith(kataKunci);

        kartu.classList.toggle('hidden', !cocok);
        if (cocok) adaBuku = true;
    });

    pesanBukuTidakDitemukan.style.display = kataKunci && !adaBuku ? 'block' : 'none';
}

// --- BAGIAN 3: BERSIHKAN FORM INPUT ---
function resetFormBuku() {
    if (!formSlug || !formJudul || !formPenulis || !formTahun) return;

    formSlug.value = '';
    formJudul.value = '';
    formPenulis.value = '';
    formTahun.value = '';

    if (judulForm) judulForm.textContent = 'Tambah Buku Baru';
    if (tombolBatalEdit) tombolBatalEdit.classList.add('hidden');
}

if (tombolBatalEdit) {
    tombolBatalEdit.addEventListener('click', resetFormBuku);
}

// --- BAGIAN 4: AMBIL DATA DARI SERVER BE ---
async function ambilDataBuku() {
    if (!wadahBuku) return;

    const token = localStorage.getItem('tokenku');
    if (!token) {
        wadahBuku.textContent = 'Token tidak ditemukan. Silakan login ulang.';
        return;
    }

    wadahBuku.textContent = 'Tunggu bentar, lagi ngambil data...';

    try {
        const respon = await fetch(`${API_BASE_URL}/books`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const hasil = await respon.json();

        if (!respon.ok) {
            wadahBuku.textContent = hasil.pesan || 'Gagal memuat data buku.';
            return;
        }

        const daftarBuku = Array.isArray(hasil) ? hasil : hasil.data;
        if (!Array.isArray(daftarBuku)) {
            wadahBuku.textContent = 'Format data buku dari server tidak valid.';
            return;
        }

        if (daftarBuku.length === 0) {
            wadahBuku.textContent = 'Belum ada koleksi buku. Silakan tambah data di samping!';
            return;
        }

        wadahBuku.innerHTML = '';

        daftarBuku.forEach((buku) => {
            const kartu = document.createElement('div');
            kartu.className = 'kartu-buku bg-white p-5 rounded-2xl border border-slate-100 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-auto min-w-0 max-w-full [overflow-wrap:anywhere]';
            kartu.innerHTML = `
                <div>
                    <h4 class="font-black text-xl text-slate-800 tracking-tight mb-2"></h4>
                    <div class="space-y-1 text-sm text-slate-600 mb-4">
                        <p><span class="text-slate-400 font-medium">Penulis:</span> <strong class="nama-penulis text-slate-700 font-semibold"></strong></p>
                        <p><span class="text-slate-400 font-medium">Tahun:</span> <strong class="tahun-buku text-slate-700 font-semibold"></strong></p>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-50 flex items-center justify-between gap-2 mt-auto">
                    <span class="slug-buku text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md"></span>
                    <div class="flex gap-1.5 shrink-0">
                        <button class="tombol-edit bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition shadow-sm active:scale-95">Edit</button>
                        <button class="tombol-hapus bg-rose-50 hover:bg-rose-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition shadow-sm active:scale-95">Hapus</button>
                    </div>
                </div>
            `;

            kartu.querySelector('h4').textContent = buku.judul || '';
            kartu.querySelector('.nama-penulis').textContent = buku.penulis || '';
            kartu.querySelector('.tahun-buku').textContent = buku.tahun || '';
            kartu.querySelector('.slug-buku').textContent = `Slug: ${buku.slug || ''}`;
            kartu.querySelector('.tombol-edit').dataset.slug = buku.slug || '';
            kartu.querySelector('.tombol-edit').dataset.judul = buku.judul || '';
            kartu.querySelector('.tombol-edit').dataset.penulis = buku.penulis || '';
            kartu.querySelector('.tombol-edit').dataset.tahun = buku.tahun || '';
            kartu.querySelector('.tombol-hapus').dataset.slug = buku.slug || '';
            wadahBuku.appendChild(kartu);
        });

        filterBuku();
        inisialisasiAksiTombol();
    } catch (error) {
        wadahBuku.textContent = 'Gagal terhubung ke server backend buku!';
    }
}

// --- BAGIAN 5: SIMPAN & EDIT DATA BUKU ---
if (tombolSimpanBuku && formSlug && formJudul && formPenulis && formTahun) {
    tombolSimpanBuku.addEventListener('click', async () => {
        const token = localStorage.getItem('tokenku');
        const slug = formSlug.value;
        const judul = formJudul.value.trim();
        const penulis = formPenulis.value.trim();
        const tahun = formTahun.value.trim();

        if (!judul || !penulis || !tahun) {
            alert('Semua bidang data buku wajib diisi!');
            return;
        }

        const sedangEdit = slug !== '';
        const url = sedangEdit
            ? `${API_BASE_URL}/books/${encodeURIComponent(slug)}`
            : `${API_BASE_URL}/books`;

        try {
            const respon = await fetch(url, {
                method: sedangEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ judul, penulis, tahun })
            });
            const hasil = await respon.json();

            if (!respon.ok) {
                alert(hasil.pesan || 'Gagal menyimpan data buku.');
                return;
            }

            resetFormBuku();
            ambilDataBuku();
        } catch (error) {
            alert('Gagal menyimpan data buku ke server!');
        }
    });
}

// --- BAGIAN 6: AKSI TOMBOL EDIT & HAPUS ---
function inisialisasiAksiTombol() {
    document.querySelectorAll('.tombol-edit').forEach((tombol) => {
        tombol.addEventListener('click', (event) => {
            if (!formSlug || !formJudul || !formPenulis || !formTahun || !judulForm || !tombolBatalEdit) return;

            const dataBuku = event.currentTarget.dataset;
            formSlug.value = dataBuku.slug;
            formJudul.value = dataBuku.judul;
            formPenulis.value = dataBuku.penulis;
            formTahun.value = dataBuku.tahun;
            judulForm.textContent = 'Edit Data Buku';
            tombolBatalEdit.classList.remove('hidden');
            formJudul.focus();
        });
    });

    document.querySelectorAll('.tombol-hapus').forEach((tombol) => {
        tombol.addEventListener('click', async (event) => {
            const slug = event.currentTarget.dataset.slug;
            if (!confirm('Apakah kamu yakin ingin menghapus buku ini?')) return;

            const token = localStorage.getItem('tokenku');

            try {
                const respon = await fetch(`${API_BASE_URL}/books/${encodeURIComponent(slug)}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (respon.ok) {
                    ambilDataBuku();
                } else {
                    const hasil = await respon.json();
                    alert(hasil.pesan || 'Gagal menghapus buku.');
                }
            } catch (error) {
                alert('Gagal memproses penghapusan buku!');
            }
        });
    });
}

ambilDataBuku();