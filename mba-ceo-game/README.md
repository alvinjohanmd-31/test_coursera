# CEO Mandate

Simulasi strategi untuk kelas MBA, dengan mekanik ala **Democracy 3** (Positech Games) yang diterjemahkan ke dunia korporasi. Mahasiswa berperan sebagai Direktur Utama perusahaan Tbk fiktif di Indonesia, dipilih dari lima skenario (termasuk **perusahaan AI** dan **perkebunan kelapa sawit**). Mereka mengatur 35 kebijakan strategis, membaca peta sebab-akibat yang dilengkapi **penjelasan teori bisnis**, menghadapi krisis dan kasus dilema, lalu harus mempertahankan kepercayaan Dewan Komisaris di setiap RUPS tahunan.

Game berjalan sepenuhnya di browser (HTML + JavaScript murni, tanpa server, tanpa instalasi), dwibahasa Indonesia dan Inggris, dan bisa dimainkan di laptop maupun ponsel.

> *English summary at the bottom.*

---

## Menjalankan

- **Paling mudah:** buka `index.html` di browser (Chrome, Edge, Firefox, Safari).
- **Untuk satu kelas:** unggah folder ini ke hosting statis mana pun (GitHub Pages, Netlify, server kampus, atau LMS yang menerima file HTML), lalu bagikan tautannya.
- Progres tersimpan otomatis di browser masing-masing mahasiswa, jadi permainan bisa dilanjutkan bila tab tertutup.

## Konsep Democracy 3 → CEO Mandate

| Democracy 3 | CEO Mandate |
|---|---|
| Kebijakan pemerintah (slider) | 35 kebijakan strategis di 6 departemen: Keuangan, Pemasaran, Operasional, SDM, Inovasi, Tata Kelola & ESG |
| Political capital | **Modal Eksekutif**: batas perubahan kebijakan per kuartal |
| Kelompok pemilih | **10 pemangku kepentingan** dengan bobot suara yang berubah (aktivis menguat saat jejak karbon buruk, kreditur menguat saat rating jatuh, dst.) |
| Pemilu | **RUPS tahunan**: perlu ≥ 50% suara tertimbang |
| Pembunuhan politik | **RUPS Luar Biasa**: bila Dewan Komisaris dan pemegang saham sangat kecewa dua kuartal berturut-turut |
| Situations | **24 krisis & peluang**: 17 umum (mogok kerja, investigasi KPPU, perang harga, Employer of Choice, Pemimpin ESG, …) dan 7 khusus skenario (halusinasi model, krisis GPU, karhutla & kabut asap, ditolak pasar UE, …) |
| Dilemmas | **33 kasus dilema**, masing-masing terikat pada satu konsep MBA (21 umum, 12 khusus skenario AI dan sawit) |
| Anggaran, utang, credit rating | Laporan laba rugi lengkap, kas, utang, peringkat kredit AAA–CCC, harga saham, dan PKPU bila gagal bayar |

Peta strategi di tengah layar menyusun KPI menurut **Balanced Scorecard** (Kaplan & Norton): Keuangan, Pelanggan, Proses Internal, Pembelajaran & Pertumbuhan, ditambah ESG. Arahkan kursor ke node mana pun untuk melihat panah sebab-akibatnya: hijau menaikkan, merah menurunkan. Kartu **“Teori di balik panah ini”** muncul di pojok peta dan menjelaskan teori bisnis di balik hubungan terpenting.

## Lima skenario

| Skenario | Perusahaan (fiktif) | Tantangan utama |
|---|---|---|
| **Turnaround** | PT Rasa Nusa Pangan Tbk, FMCG | Merek tua kehilangan pangsa, utang tinggi, moral rendah, pesaing asing masuk di tahun pertama |
| **Scale-up** | PT Arunika Niaga Digital, e-commerce | Tumbuh cepat tapi membakar kas; harus menemukan jalan menuju EBITDA positif dan tata kelola siap IPO |
| **Pemimpin Pasar** | PT Baja Samudra Perkasa Tbk, baja | Nyaman tapi beremisi tinggi, inovasi mandek, dekat ambang investigasi KPPU, pajak karbon datang |
| **Perusahaan AI** | PT Nalar Nusantara Teknologi Tbk, model bahasa Indonesia | Pasca-skandal deepfake dan mundurnya pendiri: perang harga API dari raksasa global, biaya GPU dalam dolar, aturan audit AI, dan godaan valuasi unicorn. Berisiko tinggi: belanja agresif hanya berhasil bila didukung tambahan modal |
| **Perkebunan Sawit** | PT Tandan Emas Khatulistiwa Tbk, 120.000 ha kebun | Harga CPO naik-turun, El Niño dan risiko karhutla, regulasi bebas deforestasi Uni Eropa, konflik lahan, kampanye LSM, dan seperlima pohon perlu diremajakan. Pendapatan dalam dolar, jadi rupiah melemah justru menguntungkan |

Setiap skenario membawa tiga **sasaran dari Dewan Komisaris** yang menyumbang skor akhir. Dua skenario baru mengganti nama sebagian kebijakan, KPI, dan pemangku kepentingan agar sesuai industrinya (misalnya *Optimasi Inferensi*, *Forum Engineer*, *Mitra Cloud & Data Center* di AI; *Kemitraan Plasma*, *Hutan & Gambut*, *LSM Hutan & Satwa*, *Petani Plasma & Mitra* di sawit), serta membawa kejadian makro sendiri (kelangkaan GPU, perang harga API, aturan audit AI, harga CPO melonjak/anjlok, El Niño, regulasi deforestasi UE, mandat B50, pungutan ekspor).

### Alur cerita

Setiap skenario punya cerita bersambung:

- **Prolog** saat permainan dimulai: siapa perusahaannya, mengapa Anda ditunjuk, dan badai apa yang mendekat.
- **Bab per tahun** di laporan RUPS: cerita berlanjut sesuai kondisi perusahaan Anda. Ada versi baik bila kepercayaan dewan di akhir tahun minimal 55%, dan versi buruk bila di bawahnya.
- **Epilog** di layar akhir yang mengikuti hasil Anda: gemilang (skor ≥ 640, setara nilai B ke atas), bertahan, atau buruk (dicopot RUPS atau PKPU).

Pelajaran yang dirancang: di skenario sawit, pemain yang **bersiap sebelum El Niño dan regulasi UE** (pencegahan kebakaran, ketertelusuran, sertifikasi) menghindari krisis karhutla dan penolakan pasar; yang menunda membayar mahal. Di skenario AI, strategi pasif kalah oleh perang harga, sedangkan belanja tanpa disiplin sering berakhir PKPU.

### Teori bisnis di balik hubungan variabel

Ada **61 penjelasan teori** (55 umum, 6 khusus skenario) yang menempel pada panah sebab-akibat terpenting. Contoh:

| Hubungan | Teori |
|---|---|
| Kualitas → Kepuasan Pelanggan | Kualitas yang dirasakan (SERVQUAL) |
| Kepuasan → Pangsa Pasar | Service-Profit Chain (Heskett) |
| Pelatihan → Talenta | Teori human capital (Becker) |
| Upah → Moral | Efficiency wage (Shapiro–Stiglitz) |
| PHK → Moral | Survivor syndrome & kontrak psikologis |
| R&D → Inovasi | Absorptive capacity & real options |
| Just-in-Time → Rantai Pasok | Trade-off lean vs. tangguh |
| Outsourcing → Rantai Pasok | Transaction cost economics (Williamson) |
| Operasi Hijau → Keberlanjutan | Hipotesis Porter |
| Pendapatan → Laba Bersih | Operating leverage |
| Bayar Utang → Rating Kredit | Struktur modal (Modigliani–Miller) |
| *AI:* Agen AI Internal → Efisiensi Compute | General Purpose Technology (productivity J-curve) |
| *AI:* AI Safety → Kualitas Model | Responsible AI & red teaming |
| *AI:* Cloud Asing → Pasokan Compute | Resource dependence theory |
| *Sawit:* Ekspansi Lahan → Hutan & Gambut | Eksternalitas negatif (Pigou) |
| *Sawit:* Kemitraan Plasma → Pasokan TBS | Creating Shared Value & kemitraan plasma |
| *Sawit:* ISPO/RSPO → Tata Kelola | Rantai nilai global (Gereffi) |

Penjelasan muncul di tiga tempat: kartu **“Teori di balik panah ini”** saat kursor diarahkan ke node peta, catatan teori di dialog detail kebijakan/KPI/keuangan, dan **glosarium lengkap** di menu **Panduan**. Sebagian teori khusus skenario (misalnya Pigou untuk sawit, J-curve untuk AI).

---

## Panduan dosen

### Tujuan pembelajaran

1. Memahami *trade-off* antar-pemangku kepentingan (stakeholder theory vs. shareholder primacy).
2. Menghubungkan keputusan operasional dengan hasil keuangan lewat peta Balanced Scorecard.
3. Merasakan **jeda waktu** strategi: biaya langsung terasa, manfaat (R&D, pelatihan, operasi hijau) baru muncul beberapa kuartal kemudian.
4. Membaca laporan laba rugi, *operating leverage*, struktur modal, dan dampaknya pada peringkat kredit serta valuasi.
5. Mengambil keputusan etis di bawah tekanan dan memahami konsekuensi yang tertunda.

### Format sesi yang disarankan (90–120 menit)

| Waktu | Kegiatan |
|---|---|
| 10 menit | Pengantar: tampilkan peta strategi, jelaskan Modal Eksekutif dan RUPS. Buka **Panduan** di dalam game. |
| 50–70 menit | Mahasiswa bermain (individu atau tim 2–3 orang). Mode **2 tahun / 8 kuartal** cocok untuk sesi pendek; **3 tahun / 12 kuartal** untuk tugas di luar kelas. |
| 5 menit | Mahasiswa menyalin **ringkasan hasil** dari layar akhir dan menempelkannya ke formulir/LMS. |
| 25–35 menit | Debrief memakai pertanyaan diskusi di layar akhir dan catatan keputusan masing-masing. |

### Kode kelas = kompetisi yang adil

Isi kolom **Kode kelas** dengan kode yang sama untuk seluruh kelas (misalnya `MBA-A-2027`). Semua mahasiswa dengan kode dan skenario yang sama menghadapi guncangan ekonomi yang sama (kenaikan BI-Rate, pelemahan rupiah, pesaing masuk, dst.) dan urutan kasus yang sama. Perbedaan skor murni berasal dari keputusan mereka. Ganti kode untuk kelas berikutnya agar jawaban tidak bocor.

### Skor dan nilai

Skor 0–1000 menggabungkan: Keuangan (TSR & rating, 250), Pelanggan (150), Proses Internal (120), Pembelajaran & Pertumbuhan (120), ESG (100), kepercayaan pemangku kepentingan (110), dan sasaran dewan (150). Dicopot sebelum masa jabatan selesai memberi penalti; pailit (PKPU) memberi penalti besar. Nilai: A ≥ 760, B ≥ 640, C ≥ 520, D ≥ 400.

Layar akhir juga menampilkan **gaya kepemimpinan** mahasiswa (Shareholder Primacy, People-First, Customer-Obsessed, Stakeholder Capitalist, atau Balanced Scorecard Strategist) berdasarkan kelompok yang paling puas. Ini bahan diskusi yang bagus.

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

Beberapa pilihan punya **konsekuensi tertunda** yang diundi beberapa kuartal kemudian (misalnya menunda pengungkapan kebocoran data). Program Etika & Whistleblowing menurunkan peluang konsekuensi itu muncul.

### Pertanyaan debrief

1. Trade-off apa yang paling sulit, dan pemangku kepentingan mana yang Anda korbankan?
2. Kebijakan mana yang efeknya paling lambat? Bagaimana Anda mengelola jeda itu di depan Dewan Komisaris?
3. Krisis apa yang muncul, dan indikator awal apa yang seharusnya dipantau lebih dini? (Lihat tab **Indikator & risiko**.)
4. Bandingkan dengan rekan yang memakai kode kelas sama. Apa perbedaan strategi utamanya?
5. Bila mengulang, satu keputusan apa yang akan Anda ubah, dan mengapa?

---

## Cara kerja model

Semua nilai indikator berskala 0–1. Setiap kuartal:

1. **Kebijakan** bergerak bertahap menuju intensitas yang dipilih (kecepatan berbeda per kebijakan). **Biaya** langsung dibayar; **penghematan** (PHK, outsourcing, efisiensi) ikut bertahap.
2. **KPI** bergerak menuju target = nilai dasar + efek kebijakan + efek KPI lain + krisis aktif + kejadian sementara. Contoh: Kualitas → Kepuasan → Pangsa Pasar; Talenta → Inovasi → Kualitas. Elastisitas harga turun bila merek dan kualitas kuat.
3. **Keuangan:** pendapatan = ukuran pasar × pangsa pasar × harga. HPP turun seiring efisiensi dan naik bersama harga komoditas dan kurs (dapat dilindungi hedging). Paparan dolar berbeda per skenario: biaya GPU perusahaan AI sangat sensitif terhadap kurs, sedangkan pendapatan CPO perusahaan sawit naik saat rupiah melemah. Sebagian besar beban operasional dan penyusutan bersifat tetap (*operating leverage*). Bunga = BI-Rate + spread peringkat. Pajak 22%. Kas negatif memicu pinjaman darurat; bila rating sudah CCC, perusahaan masuk PKPU.
4. **Peringkat kredit** dari utang bersih/EBITDA (atau runway kas bila EBITDA negatif), bergerak maksimal satu notch per kuartal.
5. **Harga saham** = pendapatan tahunan × kelipatan P/S (dipengaruhi margin, pertumbuhan vs ekspektasi, inovasi, merek, tata kelola, ESG) − utang bersih.
6. **Pemangku kepentingan** bereaksi terhadap KPI, sinyal keuangan, kebijakan, dan krisis. Bobot suaranya berubah sesuai kondisi.
7. **Krisis & peluang** aktif bila skor pemicunya melewati ambang dan baru berakhir di bawah ambang yang lebih rendah (histeresis).
8. Kejadian makro (BI-Rate, rupiah, resesi, pajak karbon, UU PDP, kenaikan UMP, gelombang GenAI, …) dijadwalkan dari kode kelas.

## Mengubah isi game

Semua angka dan teks ada di **`content.js`**, dengan komentar di bagian atas file. Dosen dapat:

- menambah atau mengubah **kasus dilema** (konteks lokal, kasus perusahaan sungguhan yang dibahas di kelas),
- menyesuaikan **skenario** (ukuran pasar, margin, utang, kebijakan awal, sasaran dewan),
- mengubah bobot suara pemangku kepentingan atau kekuatan efek kebijakan.

Setelah mengubah angka, jalankan uji keseimbangan (butuh Node.js):

```bash
node test/simulate.js                               # ringkasan semua skenario × strategi
node test/simulate.js turnaround balanced 1 --trace # jejak per kuartal
```

Uji ini juga gagal (exit code 1) bila ada nilai yang keluar rentang atau NaN. Hasil saat ini: strategi pasif dan murni ekstraktif (PHK + dividen maksimal) kalah di kelima skenario, dan "belanja semuanya" berakhir PKPU kecuali sesekali di skenario AI, sementara strategi bertahap yang seimbang bisa bertahan dan meraih nilai B–C.

## Struktur file

| File | Isi |
|---|---|
| `index.html` | Kerangka halaman |
| `styles.css` | Tampilan (tema terang dan gelap) |
| `icons.js` | Ikon [Lucide](https://lucide.dev) (lisensi ISC) yang dibundel agar game tetap jalan tanpa internet |
| `content.js` | Semua data game, dwibahasa: skenario, cerita, kasus, dan teori bisnis |
| `engine.js` | Mesin simulasi (logika murni, juga berjalan di Node.js) |
| `ui.js` | Antarmuka: peta strategi, panel, dialog |
| `test/simulate.js` | Uji keseimbangan dan invarian tanpa browser |

---

## English summary

**CEO Mandate** is a browser-based strategy game for MBA classes that adapts the policy-web mechanics of *Democracy 3* to corporate leadership. Students act as CEO of a fictional Indonesian listed company. They set 35 policies across six departments, spend limited **Executive Capital** (political capital), watch a Balanced Scorecard cause-and-effect map, respond to 24 crises and opportunities and 33 case dilemmas tied to MBA concepts, and must win at least 50% of the weighted stakeholder vote at each annual general meeting.

Five scenarios are included: an FMCG turnaround, an e-commerce scale-up, a steel market leader, an **AI company** (post-deepfake scandal, global API price war, GPU costs in dollars, AI audit rules) and a **palm oil plantation** (CPO price swings, El Niño fires, EU deforestation rules, land conflicts, smallholder partnerships). Each has a story told through a prologue, yearly chapters and an outcome-dependent epilogue. Sixty-one short **business-theory notes** (SERVQUAL, Service-Profit Chain, Pigou, transaction cost economics, Porter hypothesis, productivity J-curve, …) explain the key cause-and-effect arrows. They appear on hover, in detail dialogs and in a glossary under Help. The model includes a full income statement, operating leverage, credit ratings, a P/S-based share price and bankruptcy.

- Open `index.html` in any modern browser; no build step or server needed.
- Use the same **class code** for the whole class so everyone faces the same macro shocks and case order.
- The end screen produces a copyable summary for grading, a leadership-style profile and debrief questions.
- Edit `content.js` to localize cases or scenarios, then run `node test/simulate.js` to check balance.

Mechanics inspired by Democracy 3 by Positech Games. This project is not affiliated with Positech. All companies are fictional.
