# CEO Mandate

Simulasi strategi untuk kelas MBA, dengan mekanik ala **Democracy 3** (Positech Games) yang diterjemahkan ke dunia korporasi. Mahasiswa berperan sebagai Direktur Utama perusahaan fiktif, dipilih dari **delapan skenario**: tujuh perusahaan Tbk di Indonesia (termasuk perusahaan AI, perkebunan sawit, rumah sakit, dan agensi influencer) dan satu **jaringan ryokan di Jepang yang sedang terpuruk**, skenario tersulit. Mereka:

- mengatur 35 kebijakan strategis,
- memimpin **tim direksi** berisi enam direktur dengan kompetensi, loyalitas, dan agenda masing-masing,
- menjalankan **proyek strategis** multi-kuartal,
- membaca peta sebab-akibat yang dilengkapi **246 catatan teori bisnis**,
- menghadapi krisis dan kasus dilema,
- dan harus mempertahankan kepercayaan Dewan Komisaris di setiap RUPS tahunan selama masa jabatan hingga **5 tahun**.

Ada dua tingkat kesulitan, **Normal** dan **Sulit**. Game berjalan sepenuhnya di browser (HTML + JavaScript murni, tanpa server, tanpa instalasi), dwibahasa Indonesia dan Inggris, dan bisa dimainkan di laptop maupun ponsel.

> *English summary at the bottom.*

---

## Menjalankan

- **Paling mudah:** buka `index.html` di browser (Chrome, Edge, Firefox, Safari).
- **Untuk satu kelas:** unggah folder ini ke hosting statis mana pun (GitHub Pages, Netlify, server kampus, atau LMS yang menerima file HTML), lalu bagikan tautannya.
- **Tiga slot simpan:** setiap perangkat bisa menyimpan hingga tiga permainan sekaligus (misalnya satu per skenario). Progres tersimpan otomatis setiap kuartal di slot yang dipilih saat permainan dimulai. Dari menu utama, setiap slot bisa dilanjutkan, ditimpa, atau dihapus. Simpanan dari versi lama otomatis dipindah ke slot pertama yang kosong.

## Konsep Democracy 3 → CEO Mandate

| Democracy 3 | CEO Mandate |
|---|---|
| Kebijakan pemerintah (slider) | 35 kebijakan strategis di 6 departemen: Keuangan, Pemasaran, Operasional, SDM, Inovasi, Tata Kelola & ESG |
| Political capital | **Modal Eksekutif**: batas perubahan kebijakan, rekrutmen direksi, dan proyek baru per kuartal |
| Kabinet & menteri | **Tim Direksi**: 6 direktur. Kompetensi mereka memperbesar atau memperkecil efek kebijakan departemennya; loyalitas mengikuti agenda pribadi |
| Kelompok pemilih | **10 pemangku kepentingan** dengan bobot suara yang berubah (aktivis menguat saat jejak karbon buruk, kreditur menguat saat rating jatuh, dst.) |
| Pemilu | **RUPS tahunan**: perlu ≥ 50% suara tertimbang |
| Pembunuhan politik | **RUPS Luar Biasa**: bila Dewan Komisaris dan pemegang saham sangat kecewa dua kuartal berturut-turut |
| Situations | **43 krisis & peluang**: 19 umum (mogok kerja, investigasi KPPU, perang harga, perpecahan direksi, Employer of Choice, …) dan 24 khusus skenario, masing-masing dengan teorinya |
| Dilemmas | **63 kasus dilema**, masing-masing terikat pada satu konsep MBA (29 umum, 34 khusus skenario) |
| Tingkat kesulitan | **Normal** atau **Sulit** |
| Anggaran, utang, credit rating | Laporan laba rugi lengkap, kas, utang, peringkat kredit AAA–CCC, harga saham, dan PKPU bila gagal bayar |

Peta strategi di tengah layar menyusun KPI menurut **Balanced Scorecard** (Kaplan & Norton): Keuangan, Pelanggan, Proses Internal, Pembelajaran & Pertumbuhan, ditambah ESG. Arahkan kursor ke node mana pun untuk melihat panah sebab-akibatnya: hijau menaikkan, merah menurunkan. Kartu **“Teori di balik panah ini”** muncul di pojok peta dan menjelaskan teori bisnis di balik hubungan terpenting.

## Delapan skenario

| Skenario | Perusahaan (fiktif) | Tantangan utama |
|---|---|---|
| **Turnaround** | PT Rasa Nusa Pangan Tbk, FMCG | Merek tua kehilangan pangsa, utang tinggi, moral rendah, pesaing asing masuk di tahun pertama |
| **Scale-up** | PT Arunika Niaga Digital, e-commerce | Tumbuh cepat tapi membakar kas; harus menemukan jalan menuju EBITDA positif dan tata kelola siap IPO |
| **Pemimpin Pasar** | PT Baja Samudra Perkasa Tbk, baja | Nyaman tapi beremisi tinggi, inovasi mandek, dekat ambang investigasi KPPU, pajak karbon datang |
| **Perusahaan AI** | PT Nalar Nusantara Teknologi Tbk, model bahasa Indonesia | Pasca-skandal deepfake dan mundurnya pendiri: perang harga API dari raksasa global, biaya GPU dalam dolar, aturan audit AI, dan godaan valuasi unicorn |
| **Perkebunan Sawit** | PT Tandan Emas Khatulistiwa Tbk, 120.000 ha kebun | Harga CPO naik-turun, El Niño dan risiko karhutla, regulasi bebas deforestasi Uni Eropa, konflik lahan, kampanye LSM, dan pohon tua yang perlu diremajakan. Pendapatan dalam dolar |
| **Rumah Sakit** | PT Husada Lestari Nusantara Tbk, 18 RS | Pasca-kasus pasien IGD yang viral: porsi pasien BPJS (akses vs. margin), klaim yang terlambat dibayar, kelangkaan dokter spesialis, turis medis ke Penang, aturan kelas rawat inap standar, dan wabah |
| **Agensi Influencer** | PT Gema Kreator Nusantara Tbk, 450 kreator | Pasca-skandal promosi judi online: algoritma platform yang berubah, perang bajak kreator, larangan transaksi di media sosial, aturan label iklan, avatar AI, dan kontrak buzzer politik |
| **Ryokan Terpuruk** *(baru, ekstrem)* | Kaede Onsen Holdings Co., Ltd., 9 ryokan di Jepang | CEO asing pertama setelah grup Indonesia membeli 51%: kamar ditutup karena kekurangan nakai dan koki, komisi agen online, gedung era gelembung yang setengah kosong, utang ke bank utama, yen lemah, kenaikan suku bunga BOJ, gempa, overtourism, dan dana aktivis. Uang dalam yen |

Setiap skenario membawa tiga **sasaran dari Dewan Komisaris** yang menyumbang skor akhir. Skenario industri khusus mengganti nama sebagian kebijakan, KPI, dan pemangku kepentingan agar sesuai industrinya. Contohnya:

| Skenario | Contoh nama khusus |
|---|---|
| Perusahaan AI | *Optimasi Inferensi*, *Forum Engineer* |
| Perkebunan Sawit | *Kemitraan Plasma*, *Hutan & Gambut* |
| Rumah Sakit | *Porsi BPJS*, *Akreditasi*, *Jadwal Jaga*, *Mutu Klinis*, *Dokter & Perawat* |
| Agensi Influencer | *Bagi Hasil Kreator*, *Label Iklan*, *Retensi Kreator*, *Etika Konten*, *Kreator & KOL* |
| Ryokan | *Omotenashi*, *Booking Langsung*, *Staf Multi-tugas*, *Kaizen*, *Tenaga Kerja & Shokunin*, *Bank Utama & Bank Regional* |

Skenario-skenario ini juga membawa kejadian makro, krisis, kasus, teori, dan proyek strategisnya sendiri.

### Skenario ekstrem: Ryokan Terpuruk

Kaede Onsen Holdings mengelola sembilan ryokan bersejarah; yang tertua berdiri tahun 1716. Anda mewarisi perusahaan yang sudah dalam krisis:

- Sejak kuartal pertama sudah ada tiga krisis aktif: *Eksodus Talenta*, *Kamar Ditutup karena Kekurangan Staf*, dan *Terjebak Komisi Agen Online*. Laporan keuangan awal sudah memuat dampaknya, dan biaya tetap masih berukuran untuk bisnis sebelum krisis (*operating leverage*).
- Uang dalam yen (¥ juta / miliar). Suku bunga mengikuti BOJ, kurs USD/JPY menggerakkan biaya energi dan jumlah turis asing, dan pajak penghasilan 30%.
- Kejadian khusus: yen melemah, BOJ menaikkan bunga, ledakan turis mancanegara, gempa, krisis tenaga kerja pariwisata, visa pekerja berketerampilan khusus, subsidi wisata domestik, pajak menginap, upah minimum, dana aktivis, dan tuntutan efisiensi modal Bursa Tokyo.
- Empat krisis tambahan bisa muncul: *Keracunan Makanan Kaiseki*, *Overtourism & Protes Warga*, *Kerusakan Gempa*, dan *Dicap Perusahaan Zombi*. Peluangnya: *Ryokan Legendaris & Daftar Tunggu*.
- Sepuluh kasus khusus, misalnya suksesi okami, gedung 12 lantai yang setengah kosong, paritas harga agen online, merekrut staf dari Indonesia dan Vietnam, aktivis yang meminta gedung dijual ke REIT, harga khusus turis asing, kaiseki beku, dan rapat direksi yang selalu diam (*nemawashi*).
- Sasaran dewan: utang bersih/EBITDA di bawah 4×, tenaga kerja minimal 55%, dan kepuasan tamu minimal 65%.

Uji keseimbangan menunjukkan bahwa setengah-setengah tidak cukup. Strategi pasif, ekstraktif, dan bertahap yang lambat hampir selalu dicopot. Yang bertahan adalah strategi yang sejak awal berinvestasi pada orang (gaji, pelatihan, shift manusiawi, staf asing) sekaligus pada kanal dan layanan (booking langsung, omotenashi, kaizen, harga dinamis).

### Tingkat kesulitan

Pilih **Normal** atau **Sulit** sebelum mulai. Mode Sulit tidak mengubah perusahaan yang Anda warisi, tetapi mulai kuartal pertama:

- kejadian makro sekitar 35% lebih banyak dan guncangan ekonomi lebih besar,
- risiko buruk 40% lebih sering,
- krisis lebih mudah muncul dan peluang lebih sulit diraih,
- semua pemangku kepentingan sedikit lebih kritis,
- Modal Eksekutif berkurang satu setiap kuartal.

Mode permainan tercatat di slot simpan, bilah atas, dan ringkasan hasil, sehingga dosen bisa membandingkan nilai secara adil.

### Masa jabatan

Pilih **2 tahun (8 kuartal)** untuk sesi kelas singkat, **3 tahun (12 kuartal)**, atau **5 tahun (20 kuartal)**, yaitu masa jabatan penuh direksi Tbk dan pilihan bawaan. Permainan 5 tahun memberi waktu bagi investasi lambat (R&D, proyek besar, perbaikan budaya) untuk membuahkan hasil, sekaligus lebih banyak RUPS, kejadian makro, dan kasus.

### Tim Direksi

Tab **Direksi** menampilkan enam direktur: Keuangan (CFO), Pemasaran (CMO), Operasional (COO), SDM (CHRO), Teknologi (CTO), serta Kepatuhan & Keberlanjutan (CCO).

- **Kompetensi** mengalikan efek KPI dari kebijakan departemennya, dari ×0,75 sampai ×1,25. Direktur baru butuh sekitar dua kuartal untuk mencapai kemampuan penuh.
- **Loyalitas** bergerak menuju nilai dasar ditambah pengaruh kepercayaan dewan, remunerasi direksi, dan **agenda** pribadi. Agenda menentukan kebijakan yang didukung dan ditentang; ada 18 tipe, misalnya *Konservatif*, *Pengejar Pertumbuhan*, *Pembela Karyawan*, *Penjaga Integritas*. Memotong anggaran departemen juga menurunkan loyalitas.
- **Akibat loyalitas:**
  - Direktur yang tidak loyal membocorkan rapat ke komisaris. Bila terlalu lama tidak loyal, ia mundur dan kursinya kosong.
  - Tim yang loyal menambah Modal Eksekutif; kursi kosong menguranginya.
  - Muncul juga situasi *Perpecahan di Direksi* (krisis) dan *Tim Direksi yang Solid* (peluang).
- **Mengganti direktur** memakai Modal Eksekutif, biaya rekrutmen, dan pesangon. Dewan menilai siapa yang Anda pecat: menyingkirkan direktur yang kompeten membuat mereka curiga.
- Setiap tim warisan punya satu direktur lemah dan satu yang gelisah, ditentukan dari kode kelas.

Teori yang diangkat: *upper echelons theory* (Hambrick & Mason) dan teori keagenan.

### Proyek strategis

Tab **Proyek** berisi investasi besar multi-kuartal: 7 umum dan 17 khusus skenario.

| Skenario | Contoh proyek |
|---|---|
| Umum | ERP, Pusat Riset, Akademi Korporat, Transformasi Budaya, PLTS |
| Scale-up | Persiapan IPO (menghimpun modal bila tata kelola ≥ 55%) |
| Pemimpin Pasar | Tanur busur listrik baja hijau |
| Perusahaan AI | Klaster GPU sendiri |
| Perkebunan Sawit | Peremajaan 20.000 hektare |
| Rumah Sakit | RS baru di Surabaya Timur, Pusat Jantung & Kanker |
| Agensi Influencer | Studio Live Shopping, Akademi Kreator |
| Ryokan | Renovasi gedung era gelembung, platform booking langsung, asrama staf & akademi omotenashi, pembangkit panas bumi (perlu dukungan warga ≥ 50%) |

Cara kerjanya:

- Biaya dibayar bertahap setiap kuartal, sedangkan manfaatnya (kenaikan KPI permanen, biaya per unit lebih rendah, pendapatan lebih tinggi) baru datang saat proyek selesai.
- Kecepatan proyek bergantung pada kompetensi direktur penanggung jawab.
- Setiap kuartal ada risiko **terlambat** atau **biaya membengkak** (*planning fallacy*).
- Proyek bisa dihentikan, tetapi biaya yang sudah keluar hangus. Ini adalah bahan diskusi tentang *sunk cost* dan eskalasi komitmen.
- Paling banyak dua proyek bisa berjalan bersamaan.

### Alur cerita

Setiap skenario punya cerita bersambung:

- **Prolog** saat permainan dimulai: siapa perusahaannya, mengapa Anda ditunjuk, dan badai apa yang mendekat.
- **Bab per tahun** di laporan RUPS (hingga empat bab dalam permainan 5 tahun). Ada versi baik bila kepercayaan dewan di akhir tahun minimal 55%, dan versi buruk bila di bawahnya.
- **Epilog** di layar akhir yang mengikuti hasil Anda: gemilang (skor ≥ 640, setara nilai B ke atas), bertahan, atau buruk (dicopot RUPS atau PKPU).

Pelajaran yang dirancang:

- **Sawit:** pemain yang bersiap sebelum El Niño dan regulasi UE menghindari krisis.
- **AI:** strategi pasif kalah oleh perang harga.
- **Rumah Sakit:** memangkas perawat atau menolak pasien demi margin mengundang gugatan malpraktik dan sanksi.
- **Agensi Influencer:** kreator pergi bila bagi hasil tidak disesuaikan, dan uang cepat dari judi online atau buzzer berakhir dengan bencana reputasi.
- **Ryokan:** memangkas orang atau mengganti kaiseki dengan makanan beku memperdalam krisis; pemulihan datang dari staf, kanal sendiri, dan pengalaman tamu yang tidak bisa ditiru.

### Teori bisnis di balik hubungan variabel

Ada **246 catatan teori**:

- **161 di panah peta** (122 umum, 39 khusus skenario, 21 di antaranya untuk ryokan),
- **43** untuk setiap krisis dan peluang,
- **18** untuk setiap tipe direktur,
- **24** untuk setiap proyek strategis.

Contoh di panah peta:

| Hubungan | Teori |
|---|---|
| Kualitas → Kepuasan Pelanggan | Kualitas yang dirasakan (SERVQUAL) |
| Kepuasan → Pangsa Pasar | Service-Profit Chain (Heskett) |
| Pelatihan → Talenta | Teori human capital (Becker) |
| Upah → Moral | Efficiency wage (Shapiro–Stiglitz) |
| PHK → Moral | Survivor syndrome & kontrak psikologis |
| R&D → Inovasi | Absorptive capacity & real options |
| Outsourcing → Rantai Pasok | Transaction cost economics (Williamson) |
| Operasi Hijau → Keberlanjutan | Hipotesis Porter |
| Pendapatan → Laba Bersih | Operating leverage |
| *AI:* Agen AI Internal → Efisiensi Compute | General Purpose Technology (productivity J-curve) |
| *Sawit:* Ekspansi Lahan → Hutan & Gambut | Eksternalitas negatif (Pigou) |
| *Rumah Sakit:* Mutu Klinis → Kepuasan Pasien | Model Donabedian (struktur–proses–hasil) |
| *Rumah Sakit:* Lab Otomatis → Efisiensi | Baumol cost disease |
| *Rumah Sakit:* Jadwal Jaga → Moral Nakes | Burnout (Maslach) |
| *Agensi:* Live Shopping → Pangsa Pasar | Pasar dua sisi (Rochet & Tirole) |
| *Agensi:* Bagi Hasil → Retensi Kreator | Superstar economics (Rosen) |
| *Agensi:* Label Iklan → Kepatuhan | Persuasion Knowledge Model (Friestad & Wright) |
| *Ryokan:* Omotenashi → Kepuasan Tamu | Omotenashi & kerja emosional (Hochschild) |
| *Ryokan:* Kepuasan Tamu → Reputasi | Aturan puncak-akhir (Kahneman) |
| *Ryokan:* Harga Dinamis → Efisiensi | Revenue management |
| *Ryokan:* Staf Multi-tugas → Efisiensi | Model multi-tugas Hoshino Resorts |
| *Ryokan:* Pelatihan → Tenaga Kerja | Model SECI (Nonaka & Takeuchi) |
| *Ryokan:* Onsen Hijau → Onsen & Alam | Commons onsen (Ostrom) |
| *Ryokan:* Laba Bersih → Rating Kredit | Perusahaan zombi (Caballero, Hoshi & Kashyap) |

Contoh lain: *Eksodus Talenta* dijelaskan dengan exit, voice & loyalty (Hirschman), *Perang Harga* dengan persaingan Bertrand, direktur *Pro-Investor* dengan shareholder value (Jensen), dan proyek *Renovasi Gedung* dengan servicescape (Bitner).

Penjelasan muncul di tiga tempat:

- kartu **“Teori di balik panah ini”** saat kursor diarahkan ke node peta (untuk krisis, teori krisis itu sendiri tampil pertama),
- catatan teori di dialog detail kebijakan, KPI, krisis, dan keuangan,
- kartu direktur, kandidat direktur, dan kartu proyek,
- **glosarium lengkap** di menu **Panduan**, dengan bagian terpisah untuk panah peta, krisis & peluang, tipe direktur, dan proyek.

---

## Panduan dosen

### Tujuan pembelajaran

1. Memahami *trade-off* antar-pemangku kepentingan (stakeholder theory vs. shareholder primacy).
2. Menghubungkan keputusan operasional dengan hasil keuangan lewat peta Balanced Scorecard.
3. Merasakan **jeda waktu** strategi: biaya langsung terasa, manfaat (R&D, pelatihan, proyek besar) baru muncul beberapa kuartal kemudian.
4. Membaca laporan laba rugi, *operating leverage*, struktur modal, dan dampaknya pada peringkat kredit serta valuasi.
5. Memimpin tim puncak: kompetensi, loyalitas, dan politik organisasi.
6. Menilai investasi modal (NPV, risiko eksekusi, sunk cost).
7. Mengambil keputusan etis di bawah tekanan dan memahami konsekuensi yang tertunda.

### Format sesi yang disarankan

| Format | Masa jabatan | Catatan |
|---|---|---|
| Sesi kelas 90–120 menit | 2 tahun / 8 kuartal | 10 menit pengantar, 50–70 menit bermain (individu atau tim 2–3 orang), 25–35 menit debrief |
| Tugas mingguan | 3 tahun / 12 kuartal | Cukup waktu untuk satu atau dua proyek strategis |
| Tugas besar / proyek semester | 5 tahun / 20 kuartal | Semua mekanik terasa: rotasi direksi, beberapa proyek, empat bab cerita. Sekitar 2–3 jam bermain, bisa dicicil karena progres tersimpan di slot |

Di akhir permainan, mahasiswa menyalin **ringkasan hasil** dari layar akhir ke formulir/LMS. Ringkasan mencakup skor, TSR, gaya kepemimpinan, jumlah proyek selesai, dan jumlah direktur yang diganti.

### Kode kelas = kompetisi yang adil

Isi kolom **Kode kelas** dengan kode yang sama untuk seluruh kelas (misalnya `MBA-A-2027`), dan minta semua memakai tingkat kesulitan yang sama. Semua mahasiswa dengan kode, skenario, dan tingkat kesulitan yang sama menghadapi hal yang sama:

- guncangan ekonomi (kenaikan BI-Rate, pelemahan rupiah, pesaing masuk; di ryokan: yen, BOJ, gempa, dst.),
- urutan kasus,
- tim direksi warisan (dan kandidat pengganti yang sama bila mereka merekrut pada kuartal yang sama).

Perbedaan skor murni berasal dari keputusan mereka. Ganti kode untuk kelas berikutnya agar jawaban tidak bocor.

### Skor dan nilai

Skor 0–1000 menggabungkan:

| Komponen | Bobot maksimal |
|---|---|
| Keuangan (TSR & rating) | 250 |
| Pelanggan | 150 |
| Proses Internal | 120 |
| Pembelajaran & Pertumbuhan | 120 |
| ESG | 100 |
| Kepercayaan pemangku kepentingan | 110 |
| Sasaran dewan | 150 |

Dicopot sebelum masa jabatan selesai memberi penalti; pailit (PKPU) memberi penalti besar. Nilai: A ≥ 760, B ≥ 640, C ≥ 520, D ≥ 400.

Layar akhir juga menampilkan **gaya kepemimpinan** mahasiswa (Shareholder Primacy, People-First, Customer-Obsessed, Stakeholder Capitalist, atau Balanced Scorecard Strategist) berdasarkan kelompok yang paling puas.

### Kasus dan konsep MBA

| Kasus | Konsep |
|---|---|
| Pesaing Memangkas Harga 15% | Strategi Generik Porter · Teori Permainan |
| Tuntutan Kenaikan Upah 10% | Negosiasi & BATNA · Efficiency Wage |
| Pekerja Anak di Rantai Pasok | Etika Rantai Pasok · Due Diligence ESG |
| Kebocoran Data Pelanggan | Komunikasi Krisis · Kepatuhan UU PDP |
| GenAI Bisa Menggantikan 30% Staf Layanan | Transformasi Digital · Human Capital |
| Peluang Mengakuisisi Pesaing | M&A · Sinergi & Winner’s Curse |
| Permintaan “Uang Pelicin” | Etika Bisnis · Antikorupsi |
| Pangkas R&D demi Target Laba? | Short-termism · R&D sebagai Real Option |
| Brand Ambassador Tersandung Skandal | Manajemen Risiko Merek |
| Tawaran Green Bond | Keuangan Berkelanjutan · Biaya Modal |
| Kontrak Eksklusif Peritel Raksasa | Lima Kekuatan Porter · Risiko Konsentrasi |
| Laporan Whistleblower | Tata Kelola (GCG) · Fraud Triangle |
| Wajib Kembali ke Kantor? | Budaya Organisasi · Employee Value Proposition |
| Laporan Pencemaran Sungai | Teori Stakeholder · Social License to Operate |
| Tawaran Rights Issue | Struktur Modal · Pecking Order Theory |
| CTO Anda Dibajak Pesaing | Manajemen Talenta · Perencanaan Suksesi |
| Banjir Besar di Kota Pabrik | Creating Shared Value · Kewargaan Korporat |
| Kemitraan dengan Super-App | Strategi Platform · Tata Kelola Data |
| Potong Dividen? | Kebijakan Dividen · Signaling Theory |
| Tawaran Joint Venture Teknologi | Aliansi Strategis · Make, Buy, or Ally |
| Konsultan Menyarankan PHK 10% | Restrukturisasi · Kontrak Psikologis |
| Pemegang Saham Pengendali Titip Keponakan | Tata kelola perusahaan keluarga · Konflik prinsipal–prinsipal |
| Proyek Strategis Membengkak 40% | Sunk cost fallacy · Eskalasi komitmen (Staw) |
| Direktur Keuangan vs. Direktur Pemasaran | Konflik tim puncak · Politik organisasi |
| Analis Minta Panduan Laba Tahun Depan | Manajemen ekspektasi · Panduan laba |
| Laporan Short Seller | Asimetri informasi · Sinyal yang kredibel |
| Kontrak Pemerintah di Daerah 3T | Base of the pyramid (Prahalad) · Shared value |
| Dewan Minta Rencana Suksesi | Suksesi kepemimpinan · Risiko orang kunci |
| Skor ESG Diturunkan Lembaga Pemeringkat | Divergensi rating ESG · Substansi vs. pencitraan |
| *AI:* Model Anda Dipakai Membuat Deepfake | Responsible AI · Tanggung jawab platform |
| *AI:* Rilis Model sebagai Open Source? | Open Innovation · Strategi platform |
| *AI:* Data Latih dari Media Tanpa Izin | Kekayaan intelektual · Etika data |
| *AI:* Big Tech Menawarkan Investasi | Resource dependence theory · Aliansi strategis |
| *AI:* Kontrak AI Pengawasan Publik | Etika bisnis · Exit, voice, loyalty (Hirschman) |
| *AI:* Bank Minta Model Khusus On-Premise | Model bisnis produk vs. jasa · Skalabilitas |
| *Sawit:* Lahan Gambut Murah di Kalimantan | Eksternalitas (Pigou) · Risiko ESG |
| *Sawit:* Kampanye LSM: Orangutan di Konsesi Anda | Stakeholder salience (Mitchell dkk.) |
| *Sawit:* Pembeli Eropa Minta Ketertelusuran 100% | Rantai nilai global · Pemilihan pasar |
| *Sawit:* Petani Plasma Menuntut Harga TBS Lebih Adil | Creating Shared Value · Kekuasaan dalam rantai pasok |
| *Sawit:* Remajakan Pohon Tua Sekarang? | NPV & waktu investasi |
| *Sawit:* Laba Durian Runtuh dari Harga CPO | Siklus komoditas · Alokasi modal |
| *Rumah Sakit:* Pasien Gawat Darurat Tanpa Uang Muka | Etika kedokteran · Kewajiban hukum layanan gawat darurat |
| *Rumah Sakit:* Batasi Kuota Pasien BPJS? | Cream skimming · Akses vs. margin |
| *Rumah Sakit:* Dokter Bintang Minta Bagi Hasil 60% | Superstar economics (Rosen) · Hold-up problem |
| *Rumah Sakit:* Insentif dari Perusahaan Farmasi | Konflik kepentingan · Asimetri informasi (Arrow) |
| *Rumah Sakit:* Tambah Pasien per Perawat? | Rasio perawat & keselamatan pasien (Aiken) · Baumol cost disease |
| *Rumah Sakit:* Akuisisi Jaringan RS Daerah yang Merugi | Skala & cakupan ekonomi · Integrasi pasca-merger |
| *Agensi:* Tawaran Promosi Situs Judi Online | Etika bisnis · Risiko hukum |
| *Agensi:* Kontrak Buzzer Pilkada | Etika persuasi · Disinformasi |
| *Agensi:* Kreator Terbesar Minta Saham | Hold-up problem · Superstar economics |
| *Agensi:* Brand Skincare Minta Klaim Berlebihan | Etika periklanan · Asimetri informasi |
| *Agensi:* Ganti Kreator dengan Avatar AI? | Disrupsi teknologi · Hak atas kemiripan diri |
| *Agensi:* Kontrak Eksklusif dengan Satu Platform | Resource dependence theory · Multi-homing di pasar dua sisi |
| *Ryokan:* Siapa Pengganti Okami Fumiko? | Suksesi bisnis keluarga · Pengetahuan tacit (Polanyi) |
| *Ryokan:* Gedung 12 Lantai yang Setengah Kosong | Sunk cost fallacy · Analisis arus kas terdiskonto |
| *Ryokan:* OTA Minta Paritas Harga & Komisi 22% | Kekuatan platform & disintermediasi |
| *Ryokan:* Merekrut 80 Staf dari Indonesia & Vietnam | Manajemen lintas budaya (Hofstede) · Kontrak psikologis |
| *Ryokan:* Aktivis Minta Gedung Dijual ke REIT | Sale-and-leaseback · Teori agensi & aktivisme pemegang saham |
| *Ryokan:* Harga Khusus untuk Turis Asing? | Diskriminasi harga · Keadilan harga yang dipersepsikan (Kahneman) |
| *Ryokan:* Kaiseki Beku dari Pabrik Pusat? | Biaya mutu · Konsistensi merek |
| *Ryokan:* Buka Ryokan untuk Pengungsi Gempa? | Corporate citizenship · Modal sosial (Putnam) |
| *Ryokan:* Rapat Direksi yang Selalu Diam | Nemawashi & ringi · Konteks tinggi (Hall) |
| *Ryokan:* Hapus Gaji Berdasarkan Senioritas? | Nenkō joretsu & shūshin koyō · Teori turnamen |

Beberapa pilihan punya **konsekuensi tertunda** yang diundi beberapa kuartal kemudian (misalnya menunda pengungkapan kebocoran data). Program Etika & Whistleblowing menurunkan peluang konsekuensi itu muncul.

### Pertanyaan debrief

1. Trade-off apa yang paling sulit, dan pemangku kepentingan mana yang Anda korbankan?
2. Kebijakan atau proyek mana yang efeknya paling lambat? Bagaimana Anda mengelola jeda itu di depan Dewan Komisaris?
3. Krisis apa yang muncul, dan indikator awal apa yang seharusnya dipantau lebih dini? (Lihat tab **Indikator & risiko**.)
4. Direktur mana yang Anda pertahankan atau ganti, dan mengapa? Apa harga loyalitas mereka?
5. Bandingkan dengan rekan yang memakai kode kelas sama. Apa perbedaan strategi utamanya?
6. Bila mengulang, satu keputusan apa yang akan Anda ubah, dan mengapa?

---

## Cara kerja model

Semua nilai indikator berskala 0–1. Setiap kuartal:

1. **Kebijakan** bergerak bertahap menuju intensitas yang dipilih (kecepatan berbeda per kebijakan). **Biaya** langsung dibayar; **penghematan** (PHK, outsourcing, efisiensi) ikut bertahap. Efek kebijakan pada KPI dikalikan faktor kompetensi direktur departemennya.
2. **KPI** bergerak menuju target = nilai dasar + efek kebijakan + efek KPI lain + krisis aktif + kejadian sementara. Contoh: Kualitas → Kepuasan → Pangsa Pasar; Talenta → Inovasi → Kualitas. Elastisitas harga turun bila merek dan kualitas kuat.
3. **Proyek strategis** membayar cicilan, maju sesuai kompetensi direktur penanggung jawab, dan mungkin terlambat atau membengkak. Proyek yang selesai menambah KPI atau mengubah struktur biaya secara permanen.
4. **Keuangan:**
   - Pendapatan = ukuran pasar × pangsa pasar × harga.
   - HPP turun seiring efisiensi dan naik bersama harga komoditas dan kurs (dapat dilindungi hedging). Paparan dolar berbeda per skenario.
   - Sebagian besar beban operasional dan penyusutan bersifat tetap (*operating leverage*).
   - Bunga = suku bunga kebijakan (BI-Rate, atau BOJ untuk ryokan) + spread peringkat. Pajak 22% (Indonesia) atau 30% (Jepang).
   - Kas negatif memicu pinjaman darurat; bila rating sudah CCC, perusahaan masuk PKPU.
5. **Peringkat kredit** dari utang bersih/EBITDA (atau runway kas bila EBITDA negatif), bergerak maksimal satu notch per kuartal.
6. **Harga saham** = pendapatan tahunan × kelipatan P/S (dipengaruhi margin, pertumbuhan vs ekspektasi, inovasi, merek, tata kelola, ESG) − utang bersih.
7. **Pemangku kepentingan** bereaksi terhadap KPI, sinyal keuangan, kebijakan, dan krisis. Bobot suaranya berubah sesuai kondisi. Regulasi yang berlaku bisa membuat satu kelompok menilai Anda dari hal baru; misalnya aturan label iklan membuat regulator menilai transparansi iklan Anda.
8. **Direksi:** loyalitas setiap direktur bergerak menuju targetnya. Direktur yang tidak loyal bisa membocorkan rapat atau mundur.
9. **Krisis & peluang** aktif bila skor pemicunya melewati ambang dan baru berakhir di bawah ambang yang lebih rendah (histeresis).
10. **Kejadian makro** (BI-Rate, rupiah, resesi, pajak karbon, UU PDP, kenaikan UMP, gelombang GenAI; untuk ryokan: yen, BOJ, gempa, turis mancanegara, …) dijadwalkan dari kode kelas. Jumlahnya bertambah sesuai panjang masa jabatan dan tingkat kesulitan.
11. **Kondisi awal:** krisis yang sudah berlangsung saat Anda menjabat ikut tercermin di KPI dan laporan keuangan kuartal pertama.

## Mengubah isi game

Semua angka dan teks ada di **`content.js`**, dengan komentar di setiap bagian. Dosen dapat:

- menambah atau mengubah **kasus dilema** (konteks lokal, kasus perusahaan sungguhan yang dibahas di kelas),
- menyesuaikan **skenario** (ukuran pasar, margin, utang, kebijakan awal, sasaran dewan),
- menambah **proyek strategis**, **tipe direktur**, atau mengubah bobot suara pemangku kepentingan.

Setelah mengubah angka, jalankan uji keseimbangan (butuh Node.js):

```bash
node test/simulate.js                          # ringkasan semua skenario × strategi, 12 dan 20 kuartal
node test/simulate.js --len 20 --scen health   # satu skenario, satu panjang masa jabatan
node test/simulate.js creator builder 0 --len 20   # jejak per kuartal
node test/simulate.js --mode hard --scen ryokan    # mode Sulit
```

Uji ini juga gagal (exit code 1) bila ada nilai yang keluar rentang atau NaN. Hasil saat ini:

- Strategi murni ekstraktif (PHK + dividen maksimal) kalah di kedelapan skenario.
- Strategi pasif sering dicopot, dan yang bertahan hanya meraih nilai rendah (C–E). Di ryokan, strategi pasif selalu dicopot.
- "Belanja semuanya" biasanya berakhir PKPU. Di ryokan kadang bertahan, karena masalah utamanya memang kurang investasi pada orang.
- Di ryokan, hanya strategi yang berinvestasi pada orang dan kanal sejak awal yang bertahan dengan andal (sekitar 4 dari 5 kode kelas pada mode Normal, 0–2 dari 5 pada mode Sulit).
- Mode Sulit menurunkan tingkat bertahan semua strategi, tetapi strategi yang baik masih bisa lulus.
- Strategi bertahap yang seimbang bisa bertahan dan meraih nilai B–C.
- Strategi "builder" (yang juga mengganti direktur lemah dan menjalankan proyek) cenderung meraih skor tertinggi.

## Struktur file

| File | Isi |
|---|---|
| `index.html` | Kerangka halaman |
| `styles.css` | Tampilan (tema terang dan gelap) |
| `icons.js` | Ikon [Lucide](https://lucide.dev) (lisensi ISC) yang dibundel agar game tetap jalan tanpa internet |
| `content.js` | Semua data game, dwibahasa: skenario, cerita, direksi, proyek, kasus, dan teori bisnis |
| `engine.js` | Mesin simulasi (logika murni, juga berjalan di Node.js) |
| `ui.js` | Antarmuka: peta strategi, panel, dialog, slot simpan |
| `test/simulate.js` | Uji keseimbangan dan invarian tanpa browser |

---

## English summary

**CEO Mandate** is a browser-based strategy game for MBA classes that adapts the policy-web mechanics of *Democracy 3* to corporate leadership. Students act as CEO of a fictional company (seven Indonesian listed companies and one struggling Japanese ryokan chain) over a term of 2, 3 or 5 years, on Normal or Hard difficulty. They:

- set 35 policies across six departments,
- spend limited **Executive Capital** (political capital),
- lead a **leadership team** of six directors, the game's cabinet ministers,
- run multi-quarter **strategic projects**,
- watch a Balanced Scorecard cause-and-effect map,
- respond to 43 crises and opportunities and 63 case dilemmas tied to MBA concepts,
- and must win at least 50% of the weighted stakeholder vote at each annual general meeting.

**Leadership team.** Each director's competence scales their department's policy effects (×0.75–×1.25). Their loyalty follows a personal agenda, board confidence and executive pay. Disloyal directors leak to the board or resign. Replacing a director costs capital, signing fees and severance, and the board judges who you fire.

**Projects.** Projects such as an ERP rollout, an IPO, a green-steel furnace, a GPU cluster, replanting, a new hospital or a live-shopping studio are paid in installments. Their permanent benefits arrive only on completion, and every quarter they can slip or overrun, which makes them good material for discussing NPV, the planning fallacy and sunk costs.

**Scenarios.** Eight scenarios are included: an FMCG turnaround, an e-commerce scale-up, a steel market leader, an AI company, a palm oil plantation, a hospital group, an influencer agency and a **struggling ryokan chain in Japan**, the hardest one.

- *Hospital group:* national insurance access vs. margins, specialist shortages, medical tourism, outbreaks, malpractice and claims fraud.
- *Influencer agency:* algorithm changes, creator poaching, a social-commerce ban, ad-labeling rules, AI avatars, online-gambling and political-buzzer offers.
- *Ryokan (extreme):* you are the first foreign CEO after an Indonesian group bought 51%. Three crises are already running when you start (staff shortages, closed rooms, online-agent commissions), money is in yen, rates follow the BOJ, and the year brings a weak yen, earthquakes, overtourism and an activist fund. Ten cases cover okami succession, bubble-era buildings, OTA rate parity, foreign staff, REIT sale-and-leaseback, nemawashi and seniority pay.
- *Hard difficulty:* more macro shocks, more frequent risks, crises that trigger sooner, tougher stakeholders and one less unit of Executive Capital per quarter. It does not change the company you inherit.

Each scenario has a story told through a prologue, up to four yearly chapters and an outcome-dependent epilogue. There are 246 short **business-theory notes**: 161 on the key cause-and-effect arrows, plus one for every crisis and opportunity, director type and strategic project.

- Open `index.html` in any modern browser; no build step or server needed.
- **Three save slots** per device; progress autosaves every quarter.
- Use the same **class code** for the whole class so everyone faces the same macro shocks, case order and inherited leadership team.
- The end screen produces a copyable summary for grading, a leadership-style profile and debrief questions.
- Edit `content.js` to localize cases, scenarios, projects or director types, then run `node test/simulate.js` to check balance.

Mechanics inspired by Democracy 3 by Positech Games. This project is not affiliated with Positech. All companies are fictional.
