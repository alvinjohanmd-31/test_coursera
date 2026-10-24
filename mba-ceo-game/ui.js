/*
 * CEO Mandate — interface.
 * Renders the start screen, the strategy map, the side rail and every dialog.
 * All game rules live in engine.js; all numbers and texts in content.js.
 */
(function () {
  'use strict';
  const C = window.CEO_CONTENT, E = window.CEO_ENGINE;
  const SAVE_KEY = 'ceoMandate.save.v1';
  const PREF_KEY = 'ceoMandate.prefs.v1';
  const DEPT = Object.fromEntries(C.departments.map((d) => [d.id, d]));
  const PERSP = Object.fromEntries(C.perspectives.map((p) => [p.id, p]));
  const FIN = Object.fromEntries(C.finNodes.map((f) => [f.id, f]));
  const REV = Object.fromEntries(C.riskEvents.map((r) => [r.id, r]));
  // Scenario-aware definitions: names, descriptions and effects can differ per scenario.
  const D = () => E.defs(S.scenario);
  const P = (id) => D().POL[id];
  const V = (id) => D().VAR[id];
  const G = (id) => D().GRP[id];
  const PL = () => D().pol;
  const VL = () => D().var;
  const GL = () => D().grp;
  const SL = () => D().sit;

  // Icons (Lucide, bundled in icons.js). Content items may override with an `icon` field.
  const ICONS = window.CEO_ICONS || {};
  const ICON_OF = {
    dividend: 'hand-coins', buyback: 'repeat-2', costcut: 'scissors', hedging: 'umbrella', debtpay: 'piggy-bank', pricing: 'tag',
    advertising: 'megaphone', loyalty: 'gift', ecommerce: 'shopping-cart', custservice: 'headset', expansion: 'globe', automation: 'bot',
    outsourcing: 'ship', qualityctl: 'badge-check', jit: 'timer', supplier: 'handshake', greenops: 'sun', wages: 'wallet',
    training: 'graduation-cap', hybrid: 'house', esop: 'trophy', dei: 'users', layoffs: 'user-minus', safety: 'hard-hat',
    rnd: 'flask-conical', ai: 'brain-circuit', cyber: 'lock', cvc: 'rocket', openinno: 'lightbulb', csr: 'hand-heart',
    execpay: 'crown', esgreport: 'file-check', ethics: 'scale', lobbying: 'mic', netzero: 'leaf',
    share: 'chart-pie', brand: 'sparkles', custsat: 'smile', quality: 'gem', efficiency: 'gauge', resilience: 'truck',
    digital: 'smartphone', innovation: 'atom', talent: 'brain', morale: 'heart', sustainability: 'tree-pine', compliance: 'shield-check',
    f_revenue: 'trending-up', f_profit: 'banknote', f_price: 'chart-line', f_rating: 'star',
    shareholders: 'coins', board: 'building-2', customers: 'shopping-bag', employees: 'id-card', union: 'flag', creditors: 'landmark',
    regulators: 'gavel', suppliers: 'package', community: 'house', activists: 'bird',
  };
  function iconName(kind, id) {
    const o = kind === 'pol' ? P(id) : kind === 'var' ? V(id) : kind === 'grp' ? G(id) : kind === 'sit' ? E.SIT[id] : kind === 'scen' ? E.SCEN[id] : null;
    if (o && o.icon) return o.icon;
    if (ICON_OF[id]) return ICON_OF[id];
    return kind === 'sit' && E.SIT[id].kind === 'bad' ? 'triangle-alert' : 'sparkles';
  }
  const ico = (name, cls = '') => (ICONS[name] ? `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>` : '');
  // Icon drawn inside the strategy-map SVG, centered on (0, y).
  const icoG = (name, size, y = 0, color = '') => (ICONS[name]
    ? `<g class="ico" transform="translate(${(-size / 2).toFixed(1)},${(y - size / 2).toFixed(1)}) scale(${(size / 24).toFixed(3)})"${color ? ` style="color:${color}"` : ''}>${ICONS[name]}</g>` : '');
  // Business theory behind an arrow (scenario-specific first).
  const theoryOf = (from, to) => (S ? E.theory(S.scenario, from, to) : null);
  const theoryNote = (th) => (th ? `<span class="fx-note">${ico('book-open')}<span><b>${esc(L(th.name))}.</b> ${esc(L(th.text))}</span></span>` : '');

  let S = null; // game state (engine)
  const U = {
    lang: 'id', scenario: 'turnaround', seed: 'MBA-2027', length: 12,
    mainTab: 'map', railTab: 'stake', modal: null, stack: [], queue: [], lastReport: null,
    hover: null, saved: null, busy: false,
  };

  /* ------------------------------------------------------------- strings */

  const STR = {
    tagline: ['Simulasi strategi untuk kelas MBA', 'A strategy simulation for MBA classes'],
    heroA: ['Anda Direktur Utama.', 'You are the CEO.'],
    heroB: ['Semua orang punya kepentingan.', 'Everyone has a stake.'],
    lede: ['Atur 35 kebijakan strategis, hadapi krisis dan kasus dilema, lalu pertahankan kepercayaan Dewan Komisaris di setiap RUPS tahunan. Setiap keputusan menyenangkan sebagian pemangku kepentingan dan mengecewakan yang lain.',
      'Set 35 strategic policies, face crises and case dilemmas, and keep the board’s confidence at every annual shareholders’ meeting. Every decision pleases some stakeholders and disappoints others.'],
    mapPolicies: ['Kebijakan', 'Policies'], mapPoliciesD: ['Slider strategis di 6 departemen', 'Strategic sliders in 6 departments'],
    mapCapital: ['Modal Eksekutif', 'Executive Capital'], mapCapitalD: ['Batas perubahan per kuartal', 'Your budget for change each quarter'],
    mapStake: ['Pemangku kepentingan', 'Stakeholders'], mapStakeD: ['10 kelompok dengan bobot suara', '10 groups with weighted votes'],
    mapRups: ['RUPS tahunan', 'Annual meeting'], mapRupsD: ['Di bawah 50%, Anda dicopot', 'Below 50%, you are dismissed'],
    mapSit: ['Krisis & peluang', 'Crises & opportunities'], mapSitD: ['Muncul saat indikator melewati ambang', 'Appear when indicators cross a threshold'],
    mapCase: ['Kasus dilema', 'Case dilemmas'], mapCaseD: ['21 kasus berbasis teori bisnis', '21 cases grounded in business theory'],
    chooseScenario: ['Pilih perusahaan', 'Choose your company'],
    difficulty: ['Tingkat kesulitan', 'Difficulty'],
    revenueQ: ['Pendapatan per kuartal', 'Revenue per quarter'], rating: ['Peringkat', 'Rating'], marketShare: ['Pangsa pasar', 'Market share'],
    classCode: ['Kode kelas', 'Class code'],
    classCodeHelp: ['Mahasiswa dengan kode yang sama menghadapi guncangan ekonomi dan urutan kasus yang sama, jadi skornya bisa dibandingkan.', 'Students with the same code face the same economic shocks and case order, so scores are comparable.'],
    duration: ['Masa jabatan', 'Term'], q8: ['2 tahun · 8 kuartal', '2 years · 8 quarters'], q12: ['3 tahun · 12 kuartal', '3 years · 12 quarters'],
    language: ['Bahasa', 'Language'],
    startGame: ['Mulai sebagai CEO', 'Start as CEO'], resume: ['Lanjutkan {0}', 'Resume {0}'],
    howTitle: ['Cara bermain', 'How to play'],
    how1: ['Atur kebijakan', 'Set policies'], how1d: ['Klik lingkaran di cincin luar peta. Memperkenalkan, mengubah, atau menghentikan kebijakan memakai Modal Eksekutif.', 'Click a circle on the outer ring. Introducing, changing or ending a policy costs Executive Capital.'],
    how2: ['Baca peta sebab-akibat', 'Read the cause-and-effect map'], how2d: ['Arahkan kursor ke node untuk melihat panah: hijau menaikkan, merah menurunkan. Efek berjalan bertahap.', 'Hover a node to see its arrows: green raises, red lowers. Effects build up over time.'],
    how3: ['Akhiri kuartal', 'End the quarter'], how3d: ['Simulasi menghitung KPI, laporan laba rugi, dan risiko. Lalu Anda menghadapi satu kasus dilema.', 'The simulation updates KPIs, the income statement and risks. Then you face one case dilemma.'],
    how4: ['Bertahan di RUPS', 'Survive the AGM'], how4d: ['Di akhir setiap tahun, pemangku kepentingan memberi suara. Di bawah 50%, Anda diberhentikan.', 'At the end of each year, stakeholders vote. Below 50%, you are dismissed.'],
    credit: ['Mekanik permainan terinspirasi dari game simulasi kebijakan Democracy 3 (Positech Games), diadaptasi untuk manajemen strategis. Tidak berafiliasi dengan Positech. Perusahaan dalam skenario adalah fiktif.', 'Game mechanics are inspired by the policy simulation Democracy 3 (Positech Games), adapted for strategic management. Not affiliated with Positech. All scenario companies are fictional.'],
    quarterOf: ['Kuartal {0} dari {1}', 'Quarter {0} of {1}'],
    confidence: ['Kepercayaan dewan', 'Board confidence'], capital: ['Modal eksekutif', 'Exec. capital'],
    confShort: ['Dewan', 'Board'], capShort: ['Modal', 'Capital'],
    cash: ['Kas', 'Cash'], sharePrice: ['Harga saham', 'Share price'], ratingS: ['Rating', 'Rating'], nextRups: ['RUPS', 'AGM'],
    inQ: ['{0} kuartal lagi', 'in {0} quarters'], thisQ: ['akhir kuartal ini', 'end of this quarter'],
    endQuarter: ['Akhiri kuartal', 'End quarter'], help: ['Panduan', 'Guide'], newGame: ['Permainan baru', 'New game'],
    tabMap: ['Peta strategi', 'Strategy map'], tabList: ['Daftar kebijakan', 'Policy list'], tabKpi: ['Indikator & risiko', 'Indicators & risks'],
    tabStake: ['Pemangku kepentingan', 'Stakeholders'], tabFin: ['Keuangan', 'Finance'], tabMandate: ['Mandat', 'Mandate'],
    legRaise: ['menaikkan', 'raises'], legLower: ['menurunkan', 'lowers'], legOff: ['kebijakan belum aktif', 'inactive policy'],
    news: ['Berita', 'News'], noNews: ['Belum ada berita. Atur kebijakan, lalu akhiri kuartal.', 'No news yet. Set your policies, then end the quarter.'],
    noCrisis: ['Tidak ada krisis aktif', 'No active crises'],
    clickDetail: ['Klik untuk detail', 'Click for details'],
    nextRupsNote: ['RUPS berikutnya di akhir {0}. Anda perlu minimal 50% suara tertimbang.', 'Next AGM at the end of {0}. You need at least 50% of the weighted vote.'],
    voteWeight: ['bobot suara {0}', 'vote weight {0}'],
    hoverHint: ['Arahkan kursor ke kebijakan untuk melihat reaksi tiap kelompok.', 'Hover a policy to preview each group’s reaction.'],
    tapHint: ['Buka sebuah kebijakan untuk melihat reaksi tiap kelompok.', 'Open a policy to see how each group reacts.'],
    reactOf: ['Reaksi terhadap: {0}', 'Reaction to: {0}'],
    revenue: ['Pendapatan', 'Revenue'], netIncome: ['Laba bersih', 'Net income'], ebitda: ['EBITDA', 'EBITDA'],
    ebitdaMargin: ['Margin EBITDA', 'EBITDA margin'], netMargin: ['Margin bersih', 'Net margin'], debt: ['Utang', 'Debt'],
    netDebtEbitda: ['Utang bersih/EBITDA', 'Net debt/EBITDA'], interestRate: ['Bunga efektif', 'Interest rate'],
    mcap: ['Kapitalisasi pasar', 'Market cap'], tsr: ['TSR sejak menjabat', 'TSR since you started'], qoq: ['vs kuartal lalu', 'vs last quarter'],
    plTitle: ['Laba rugi kuartal terakhir', 'Last quarter’s income statement'],
    plRevenue: ['Pendapatan', 'Revenue'], plCogs: ['Harga pokok penjualan', 'Cost of goods sold'], plGross: ['Laba kotor', 'Gross profit'],
    plOpex: ['Beban operasional', 'Operating expense'], plCarbon: ['Pajak karbon', 'Carbon tax'], plPolicies: ['Biaya kebijakan (bersih)', 'Policy costs (net)'],
    plDa: ['Penyusutan & amortisasi', 'Depreciation & amortization'], plInterest: ['Beban bunga bersih', 'Net interest'],
    plExtra: ['Pos luar biasa (pesangon, denda)', 'One-offs (severance, fines)'], plTax: ['Pajak penghasilan 22%', 'Income tax 22%'],
    plDiv: ['Dividen dibayar', 'Dividends paid'], plBuyback: ['Buyback', 'Buyback'], plCapex: ['Capex inisiatif baru', 'Capex for new initiatives'],
    plRepay: ['Pelunasan utang', 'Debt repaid'], plBorrow: ['Pinjaman darurat', 'Emergency borrowing'],
    topCosts: ['Biaya kebijakan terbesar', 'Largest policy costs'],
    chartRev: ['Pendapatan per kuartal', 'Revenue per quarter'], chartNi: ['Laba bersih per kuartal', 'Net income per quarter'],
    chartPrice: ['Harga saham', 'Share price'], chartConf: ['Kepercayaan dewan', 'Board confidence'],
    objectives: ['Sasaran dari Dewan Komisaris', 'Targets from the board'], economy: ['Lingkungan makro', 'Macro environment'],
    gdp: ['Pertumbuhan PDB', 'GDP growth'], bi: ['BI-Rate', 'BI-Rate'], fx: ['Kurs USD/IDR', 'USD/IDR'], inputIdx: ['Indeks biaya input', 'Input-cost index'],
    competition: ['Intensitas persaingan', 'Competitive intensity'], marketSize: ['Ukuran pasar/kuartal', 'Market size/quarter'],
    regimes: ['Regulasi & tren yang berlaku', 'Rules and trends in force'], noRegimes: ['Belum ada.', 'None yet.'],
    decisions: ['Catatan keputusan', 'Decision log'], noDecisions: ['Belum ada keputusan.', 'No decisions yet.'],
    status: ['Status', 'Status'], active: ['Aktif', 'Active'], inactive: ['Tidak aktif', 'Inactive'], core: ['Kebijakan inti', 'Core policy'],
    changedThisQ: ['Berubah kuartal ini', 'Changed this quarter'],
    introduce: ['Perkenalkan', 'Introduce'], apply: ['Terapkan', 'Apply'], cancelPolicy: ['Hentikan kebijakan', 'End policy'],
    revert: ['Kembalikan ke awal kuartal', 'Revert to start of quarter'], close: ['Tutup', 'Close'],
    capCost: ['Modal Eksekutif', 'Executive Capital'], capLeft: ['tersisa {0}', '{0} left'], notEnough: ['Modal Eksekutif tidak cukup', 'Not enough Executive Capital'],
    costPerQ: ['Biaya per kuartal', 'Cost per quarter'], savingPerQ: ['Penghematan per kuartal (saat efek penuh)', 'Savings per quarter (at full effect)'],
    capexOnce: ['Capex awal', 'Upfront capex'], severanceOnce: ['Pesangon sekali bayar', 'One-off severance'],
    speedFast: ['Cepat', 'Fast'], speedMid: ['Sedang', 'Medium'], speedSlow: ['Lambat', 'Slow'],
    speedNote: ['≈{0} kuartal untuk mencapai 75% efek', '≈{0} quarters to reach 75% of the effect'],
    effectsOnKpi: ['Dampak pada indikator', 'Effect on indicators'], effectsOnGroups: ['Reaksi pemangku kepentingan', 'Stakeholder reactions'],
    nowContrib: ['saat ini', 'now'], potential: ['potensi', 'potential'], points: ['poin', 'pts'],
    bipolarNote: ['Panah menunjukkan efek saat slider digeser ke kanan ({0}).', 'Arrows show the effect of moving the slider right ({0}).'],
    intensity: ['Intensitas', 'Intensity'],
    drivers: ['Apa yang menggerakkannya', 'What drives it'], influences: ['Apa yang dipengaruhinya', 'What it affects'],
    heading: ['Menuju {0}', 'Heading to {0}'], history: ['Riwayat', 'History'],
    weight: ['Bobot suara', 'Vote weight'], happiness: ['Kepuasan', 'Approval'], policiesTheyCare: ['Kebijakan yang mereka perhatikan', 'Policies they care about'],
    likes: ['suka', 'like'], dislikes: ['tidak suka', 'dislike'],
    crisis: ['Krisis', 'Crisis'], opportunity: ['Peluang', 'Opportunity'], activeSince: ['Aktif sejak {0}', 'Active since {0}'],
    triggerLevel: ['Tingkat pemicu', 'Trigger level'], triggerNote: ['Aktif di atas {0}, berakhir di bawah {1}.', 'Switches on above {0}, off below {1}.'],
    causes: ['Penyebab', 'Causes'], effects: ['Dampak saat aktif', 'Effects while active'], requires: ['Hanya bisa muncul bila {0} aktif.', 'Can only occur while {0} is active.'],
    capPerQ: ['Modal Eksekutif {0}/kuartal', 'Executive Capital {0}/quarter'],
    finRev: ['Pendapatan {0}', 'Revenue {0}'], finCogs: ['Biaya per unit {0}', 'Unit cost {0}'], finCost: ['Biaya tunai {0} penjualan/kuartal', 'Cash cost {0} of sales/quarter'],
    finInterest: ['Bunga {0}', 'Interest {0}'], finPs: ['Valuasi {0}', 'Valuation {0}'],
    reportTitle: ['Laporan {0}', 'Report for {0}'], continue: ['Lanjut', 'Continue'],
    toRups: ['Lanjut ke RUPS', 'Go to the AGM'], toCase: ['Lanjut ke kasus', 'Go to the case'], toEnd: ['Lihat hasil akhir', 'See final results'],
    startQ: ['Mulai {0}', 'Start {0}'],
    newSits: ['Situasi baru', 'New situations'], endedSits: ['Situasi berakhir', 'Situations ended'],
    movers: ['Pergerakan terbesar', 'Biggest moves'], capGain: ['Modal Eksekutif +{0} (total {1})', 'Executive Capital +{0} (total {1})'],
    yourChanges: ['Keputusan yang dijalankan', 'Decisions carried out'], noChanges: ['Tidak ada perubahan kebijakan kuartal ini.', 'No policy changes this quarter.'],
    tagMacro: ['Makro', 'Macro'], tagRisk: ['Risiko', 'Risk'], tagGood: ['Kabar baik', 'Good news'], tagConseq: ['Konsekuensi', 'Consequence'], tagFin: ['Keuangan', 'Finance'],
    borrowNews: ['Kas habis. Bank mencairkan pinjaman darurat {0}.', 'Cash ran out. The bank extended emergency credit of {0}.'],
    rupsTitle: ['RUPS Tahunan {0}', 'Annual General Meeting {0}'],
    rupsPass: ['Mandat diperpanjang', 'Mandate renewed'], rupsFail: ['Anda diberhentikan', 'You are dismissed'],
    rupsPassD: ['Mayoritas suara tertimbang mendukung Anda untuk tahun berikutnya.', 'A weighted majority backs you for another year.'],
    rupsFailD: ['Pemegang saham dan pemangku kepentingan tidak lagi percaya pada kepemimpinan Anda.', 'Shareholders and stakeholders no longer trust your leadership.'],
    voteShare: ['Bobot', 'Weight'], contrib: ['Suara', 'Votes'],
    caseOf: ['Kasus {0} · {1}', 'Case {0} · {1}'], concept: ['Konsep', 'Concept'], lesson: ['Pelajaran', 'Lesson'],
    riskLater: ['Keputusan ini mungkin punya konsekuensi di kuartal mendatang.', 'This decision may have consequences in coming quarters.'],
    endTitle: ['Akhir masa jabatan', 'End of term'], firedTitle: ['Masa jabatan berakhir lebih cepat', 'Your term ended early'],
    endTerm: ['Anda menyelesaikan masa jabatan {0} kuartal.', 'You completed your {0}-quarter term.'],
    endRups: ['Diberhentikan di RUPS {0}.', 'Dismissed at the {0} AGM.'],
    endRupslb: ['Diberhentikan lewat RUPS Luar Biasa di {0}.', 'Removed by an extraordinary meeting in {0}.'],
    endBankrupt: ['Perusahaan masuk PKPU (penundaan kewajiban pembayaran utang) di {0}. Bank menolak memberi kredit baru.', 'The company entered court-supervised debt restructuring (PKPU) in {0}. Banks refused new credit.'],
    score: ['Skor', 'Score'], grade: ['Nilai', 'Grade'], style: ['Gaya kepemimpinan', 'Leadership style'],
    sFin: ['Keuangan (TSR & rating)', 'Financial (TSR & rating)'], sCust: ['Pelanggan', 'Customer'], sProc: ['Proses internal', 'Internal process'],
    sLearn: ['Pembelajaran & pertumbuhan', 'Learning & growth'], sEsg: ['ESG', 'ESG'], sStake: ['Kepercayaan pemangku kepentingan', 'Stakeholder confidence'], sObj: ['Sasaran dewan', 'Board targets'],
    penalty: ['Penalti karena masa jabatan tidak selesai: ×{0}', 'Penalty for an unfinished term: ×{0}'],
    summary: ['Ringkasan untuk dikirim ke dosen', 'Summary to send to your instructor'], copy: ['Salin ringkasan', 'Copy summary'], copied: ['Ringkasan disalin', 'Summary copied'],
    copyFail: ['Teks sudah dipilih. Tekan Ctrl+C / Cmd+C untuk menyalin.', 'Text selected. Press Ctrl+C / Cmd+C to copy.'],
    debrief: ['Pertanyaan diskusi', 'Discussion questions'], playAgain: ['Main lagi', 'Play again'], viewMap: ['Lihat peta akhir', 'Inspect the final map'],
    viewResults: ['Lihat hasil', 'View results'], gameOver: ['Permainan selesai', 'Game over'],
    confirmNew: ['Mulai permainan baru?', 'Start a new game?'], confirmNewD: ['Permainan yang sedang berjalan akan dihapus dari perangkat ini.', 'The game in progress will be removed from this device.'],
    cancel: ['Batal', 'Cancel'], yesNew: ['Ya, mulai baru', 'Yes, start over'],
    processing: ['Mensimulasikan kuartal…', 'Simulating the quarter…'],
    explBase: ['Nilai dasar industri', 'Industry baseline'], explStruct: ['Kondisi struktural perusahaan', 'Company structure'],
    explStart: ['Kondisi awal', 'Starting conditions'], explHoney: ['Bulan madu CEO baru', 'New-CEO honeymoon'],
    sigTsr: ['Return saham 4 kuartal', '4-quarter share return'], sigProfit: ['Margin laba bersih', 'Net margin'], sigGrowth: ['Pertumbuhan vs ekspektasi pasar', 'Growth vs market expectations'],
    sigRating: ['Peringkat kredit', 'Credit rating'], sigCash: ['Posisi kas', 'Cash position'], sigComp: ['Intensitas persaingan', 'Competitive intensity'], sigInput: ['Biaya bahan baku', 'Input costs'],
    riskRadar: ['Radar krisis & peluang', 'Crisis & opportunity radar'], riskRadarD: ['Tingkat pemicu setiap situasi. Garis menandai ambang aktif.', 'Trigger level of every situation. The tick marks the switch-on threshold.'],
    stylecapital: ['Shareholder Primacy', 'Shareholder Primacy'],
    stylecapitalD: ['Pemilik modal paling puas. Anda dekat dengan doktrin Friedman: tanggung jawab bisnis adalah meningkatkan laba.', 'Capital providers are happiest. You lean toward the Friedman doctrine: business exists to increase profit.'],
    stylepeople: ['People-First Leader', 'People-First Leader'],
    stylepeopleD: ['Karyawan dan serikat paling puas. Human capital menjadi inti strategi Anda.', 'Employees and the union are happiest. Human capital sits at the core of your strategy.'],
    stylemarket: ['Customer-Obsessed', 'Customer-Obsessed'],
    stylemarketD: ['Pelanggan dan mitra paling puas. Strategi Anda berangkat dari customer centricity.', 'Customers and partners are happiest. Your strategy starts from customer centricity.'],
    stylesociety: ['Stakeholder Capitalist', 'Stakeholder Capitalist'],
    stylesocietyD: ['Regulator, komunitas, dan aktivis paling puas. Anda menjalankan triple bottom line: people, planet, profit.', 'Regulators, communities and activists are happiest. You run a triple bottom line: people, planet, profit.'],
    stylebalanced: ['Balanced Scorecard Strategist', 'Balanced Scorecard Strategist'],
    stylebalancedD: ['Tidak ada kelompok yang tertinggal jauh. Anda menyeimbangkan semua perspektif dengan disiplin.', 'No group is left far behind. You balance every perspective with discipline.'],
    q1: ['Trade-off apa yang paling sulit Anda ambil, dan pemangku kepentingan mana yang Anda korbankan?', 'Which trade-off was hardest, and which stakeholders did you sacrifice?'],
    q2: ['Kebijakan mana yang efeknya paling lambat? Bagaimana Anda mengelola jeda itu di depan Dewan Komisaris?', 'Which policy was slowest to pay off? How did you manage that lag with the board?'],
    q3: ['Krisis apa yang muncul, dan indikator awal apa yang seharusnya Anda pantau lebih dini?', 'Which crises appeared, and which leading indicators should you have watched sooner?'],
    q4: ['Bandingkan dengan rekan yang memakai kode kelas sama. Apa perbedaan strategi utamanya?', 'Compare with classmates on the same class code. What was the key difference in strategy?'],
    q5: ['Bila mengulang dari awal, satu keputusan apa yang akan Anda ubah, dan mengapa?', 'If you started over, which one decision would you change, and why?'],
    helpTitle: ['Panduan bermain', 'How to play'],
    helpGoal: ['Tujuan', 'Goal'],
    helpGoalD: ['Bertahan sampai akhir masa jabatan dengan skor Balanced Scorecard setinggi mungkin. Skor menggabungkan TSR, peringkat kredit, pelanggan, proses internal, pembelajaran, ESG, kepercayaan pemangku kepentingan, dan sasaran dewan.', 'Survive your term with the highest Balanced Scorecard score you can. It combines TSR, credit rating, customers, internal process, learning, ESG, stakeholder confidence and board targets.'],
    helpS1: ['Setiap kuartal Anda mendapat Modal Eksekutif. Jumlahnya naik bila kepercayaan dewan tinggi dan remunerasi direksi kompetitif.', 'Each quarter you earn Executive Capital. You get more when board confidence is high and executive pay is competitive.'],
    helpS2: ['Klik kebijakan di cincin luar untuk memperkenalkan, menggeser, atau menghentikannya. Perubahan bisa dibatalkan gratis sebelum kuartal berakhir.', 'Click a policy on the outer ring to introduce, adjust or end it. Changes are free to undo until the quarter ends.'],
    helpS3: ['Biaya kebijakan langsung terasa, tetapi dampaknya pada KPI berjalan bertahap. Penghematan (PHK, outsourcing) juga butuh waktu. Perhatikan label Cepat, Sedang, Lambat.', 'Policy costs hit at once, but KPI effects build up gradually. Savings (layoffs, outsourcing) take time too. Watch the Fast, Medium and Slow labels.'],
    helpS4: ['Lingkaran tengah adalah KPI Balanced Scorecard dan hasil keuangan. Arahkan kursor untuk melihat penyebab dan akibatnya.', 'The inner circle holds Balanced Scorecard KPIs and financial results. Hover to see their causes and effects.'],
    helpS5: ['Krisis (merah) dan peluang (hijau) muncul di pusat peta. Tab Indikator & risiko menunjukkan seberapa dekat setiap situasi dengan pemicunya.', 'Crises (red) and opportunities (green) appear in the center. The Indicators & risks tab shows how close each one is to triggering.'],
    helpS6: ['Setelah tiap kuartal Anda menerima laporan dan satu kasus dilema. Di setiap akhir tahun ada RUPS. Bila Dewan Komisaris dan pemegang saham sangat kecewa dua kuartal berturut-turut, RUPS Luar Biasa bisa mencopot Anda kapan saja.', 'After every quarter you get a report and one case dilemma. Each year ends with an AGM. If the board and shareholders stay furious for two quarters, an extraordinary meeting can remove you at any time.'],
    helpS7: ['Kas di bawah nol memicu pinjaman darurat. Bila peringkat sudah CCC, bank menolak dan perusahaan masuk PKPU: permainan berakhir.', 'Negative cash triggers emergency borrowing. If the rating is already CCC, banks refuse and the company enters debt restructuring: game over.'],
    helpMapping: ['Untuk pemain Democracy 3', 'For Democracy 3 players'],
    helpTerm: ['Istilah', 'Term'], helpHere: ['Di game ini', 'In this game'],
    dPolicy: ['Kebijakan pemerintah', 'Government policies'], dCapital: ['Political capital', 'Political capital'], dVoters: ['Kelompok pemilih', 'Voter groups'],
    dElection: ['Pemilu', 'Election'], dSituations: ['Situations', 'Situations'], dDilemmas: ['Dilemmas', 'Dilemmas'], dBudget: ['Anggaran, utang, credit rating', 'Budget, debt, credit rating'], dAssassin: ['Pembunuhan politik', 'Assassination'],
    hPolicy: ['35 kebijakan strategis di 6 departemen', '35 strategic policies across 6 departments'], hCapital: ['Modal Eksekutif', 'Executive Capital'],
    hVoters: ['10 pemangku kepentingan dengan bobot suara dinamis', '10 stakeholders with shifting vote weights'], hElection: ['RUPS tahunan (ambang 50%)', 'Annual AGM (50% threshold)'],
    hSituations: ['17 krisis & peluang', '17 crises & opportunities'], hDilemmas: ['21 kasus dilema MBA', '21 MBA case dilemmas'], hBudget: ['Laporan laba rugi, kas, utang, peringkat kredit', 'Income statement, cash, debt, credit rating'], hAssassin: ['RUPS Luar Biasa', 'Extraordinary general meeting'],
    keys: ['Pintasan: Esc menutup jendela. Tab dan Enter bekerja di peta.', 'Shortcuts: Esc closes a dialog. Tab and Enter work on the map.'],
    regimeNames: ['', ''],
    continueGame: ['Lanjutkan', 'Continue'],
    finished: ['selesai', 'finished'],
    marketShareActual: ['Pangsa pasar aktual {0}', 'Actual market share {0}'],
    elasticity: ['Elastisitas harga ×{0} (merek & kualitas menurunkannya)', 'Price elasticity ×{0} (brand and quality lower it)'],
    priceVsMarket: ['Harga vs pasar', 'Price vs market'],
    psMultiple: ['Kelipatan P/S', 'P/S multiple'],
    ratingTable: ['Ambang peringkat (utang bersih/EBITDA)', 'Rating thresholds (net debt/EBITDA)'],
    runwayNote: ['Saat EBITDA negatif, peringkat ditentukan runway kas: ≥12 kuartal BBB, ≥8 BB, ≥4 B, selain itu CCC.', 'With negative EBITDA, the rating follows cash runway: ≥12 quarters BBB, ≥8 BB, ≥4 B, otherwise CCC.'],
    noneActive: ['Tidak ada', 'None'],
    pendingCap: ['{0} terpakai kuartal ini', '{0} committed this quarter'],
    story: ['Cerita perusahaan', 'Company story'], prolog: ['Prolog', 'Prologue'], chapter: ['Bab {0}', 'Chapter {0}'], epilogue: ['Epilog', 'Epilogue'],
    yearEnd: ['Akhir tahun {0}', 'End of year {0}'], readProlog: ['Baca prolog', 'Read the prologue'], begin: ['Mulai {0}', 'Begin {0}'],
    yourTargets: ['Sasaran dari Dewan Komisaris', 'Targets from the board'], newTag: ['Baru', 'New'],
    theoryTitle: ['Teori di balik panah ini', 'The theory behind these arrows'],
    theoryHelp: ['Kamus teori bisnis', 'Business theory glossary'],
    theoryHelpD: ['Teori yang menjelaskan hubungan sebab-akibat penting di peta strategi. Teori yang sama juga muncul saat Anda mengarahkan kursor ke node dan di setiap jendela detail.', 'The theories behind the key cause-and-effect links on the strategy map. They also appear when you hover a node and in every detail dialog.'],
    whyLinked: ['Mengapa terhubung?', 'Why are these linked?'], link: ['Hubungan', 'Link'], theory: ['Teori', 'Theory'],
  };
  const tr = (k, ...a) => {
    const v = STR[k];
    let s = v ? v[U.lang === 'id' ? 0 : 1] : k;
    a.forEach((x, i) => { s = s.replace(`{${i}}`, x); });
    return s;
  };
  const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[U.lang] ?? o.en);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const canHover = () => !(window.matchMedia && window.matchMedia('(hover: none)').matches);

  /* ---------------------------------------------------------- formatting */

  const nfCache = {};
  const nf = (d = 0) => {
    const k = U.lang + d;
    return nfCache[k] || (nfCache[k] = new Intl.NumberFormat(U.lang === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
  };
  function money(v) {
    const a = Math.abs(v), neg = v < -0.5;
    let s;
    if (U.lang === 'id') s = a >= 1000 ? `Rp ${nf(a >= 10000 ? 1 : 2).format(a / 1000)} T` : `Rp ${nf(0).format(a)} M`;
    else s = a >= 1000 ? `IDR ${nf(a >= 10000 ? 1 : 2).format(a / 1000)} tn` : `IDR ${nf(0).format(a)} bn`;
    return (neg ? '−' : '') + s;
  }
  function moneyShort(v) {
    const a = Math.abs(v), neg = v < -0.5;
    if (a < 0.5) return '0';
    const s = a >= 1000 ? nf(1).format(a / 1000) + (U.lang === 'id' ? 'T' : 'tn') : nf(0).format(a) + (U.lang === 'id' ? 'M' : 'bn');
    return (neg ? '−' : '') + s;
  }
  const pct = (v, d = 0) => nf(d).format(v * 100) + '%';
  const spct = (v, d = 0) => (v >= 0 ? '+' : '−') + nf(d).format(Math.abs(v * 100)) + '%';
  const pts = (v, d = 1) => (v >= 0 ? '+' : '−') + nf(d).format(Math.abs(v * 100));
  const priceStr = (v) => (U.lang === 'id' ? 'Rp ' : 'IDR ') + nf(0).format(v);
  const qLabel = (t) => `Q${((t - 1) % 4) + 1} ${S.year0 + Math.floor((t - 1) / 4)}`;
  const curQ = () => S.t + 1;
  const signCls = (v, eps = 1e-4) => (v > eps ? 'pos' : v < -eps ? 'neg' : 'muted');
  const arrow = (v, eps = 1e-4) => (v > eps ? '▲' : v < -eps ? '▼' : '•');
  const ctxFmt = () => ({ L: (id, en) => (U.lang === 'id' ? id : en), pct, money, vol: E.volume(S) });

  function policyLabel(p, x) {
    if (p.fmt) return p.fmt(x, ctxFmt());
    const vol = E.volume(S);
    if (p.cost > 0) return U.lang === 'id' ? `${money(p.cost * x * vol)} per kuartal (${pct(p.cost * x, 1)} penjualan)` : `${money(p.cost * x * vol)} per quarter (${pct(p.cost * x, 1)} of sales)`;
    if (p.cost < 0) return U.lang === 'id' ? `Hemat ${money(-p.cost * x * vol)} per kuartal saat efek penuh` : `Saves ${money(-p.cost * x * vol)} per quarter at full effect`;
    return pct(x);
  }
  function speedInfo(speed) {
    const n = Math.max(1, Math.round(Math.log(0.25) / Math.log(1 - speed)));
    const label = speed >= 0.6 ? tr('speedFast') : speed >= 0.35 ? tr('speedMid') : tr('speedSlow');
    return { label, n, note: tr('speedNote', n) };
  }

  // Names for any id that can appear as a cause.
  function nameOf(id, short) {
    if (!id) return '';
    if (id === 'start') return tr('explStart');
    if (id === 'honeymoon') return tr('explHoney');
    if (id.startsWith('flag:')) return L(E.MEV[id.slice(5)].name);
    if (id.startsWith('f:')) return tr({ tsr: 'sigTsr', profit: 'sigProfit', growth: 'sigGrowth', rating: 'sigRating', cash: 'sigCash', competition: 'sigComp', inputcost: 'sigInput' }[id.slice(2)]);
    if (id.startsWith('g:')) return L(G(id.slice(2)).name);
    const o = V(id) || P(id) || E.SIT[id] || FIN[id] || G(id) || E.DIL[id] || E.MEV[id] || REV[id];
    if (!o) return id;
    if (E.DIL[id]) return L(o.title);
    return L(short && o.short ? o.short : o.name);
  }

  /* --------------------------------------------------------- persistence */

  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ lang: U.lang, scenario: U.scenario, seed: U.seed, length: U.length })); } catch (e) { /* storage unavailable */ }
  }
  function loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
      if (p) Object.assign(U, { lang: p.lang || U.lang, scenario: p.scenario || U.scenario, seed: p.seed || U.seed, length: p.length || U.length });
    } catch (e) { /* storage unavailable */ }
  }
  function saveGame() {
    if (!S) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S, queue: U.queue, lastReport: U.lastReport })); } catch (e) { /* storage unavailable */ }
  }
  function loadSave() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (d && d.S && d.S.v === 1 && E.SCEN[d.S.scenario]) return d;
    } catch (e) { /* storage unavailable */ }
    return null;
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage unavailable */ }
  }

  /* ---------------------------------------------------------------- start */

  function heroArt() {
    const cx = 200, cy = 200, out = [], depts = C.departments;
    const slots = [];
    for (const d of depts) {
      for (const p of C.policies.filter((x) => x.dept === d.id)) slots.push(d.id);
      slots.push(null);
    }
    const n = slots.length;
    const pos = (i, r) => { const a = -Math.PI / 2 + ((i - 2) / n) * Math.PI * 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    out.push(`<circle cx="${cx}" cy="${cy}" r="172" class="map-ring"/><circle cx="${cx}" cy="${cy}" r="104" class="map-ring inner"/>`);
    const inner = [];
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI * 2; inner.push([cx + 104 * Math.cos(a), cy + 104 * Math.sin(a)]); }
    const curve = (a, b, cls) => {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, qx = mx + (cx - mx) * 0.4, qy = my + (cy - my) * 0.4;
      return `<path class="edge flow ${cls}" stroke-width="2" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}"/>`;
    };
    out.push(curve(pos(31, 172), inner[11], 'pos'), curve(pos(31, 172), inner[13], 'pos'), curve(pos(31, 172), inner[4], 'neg'), curve(inner[11], inner[5], 'pos'), curve(inner[5], inner[0], 'pos'));
    slots.forEach((d, i) => {
      if (!d) return;
      const [x, y] = pos(i, 172);
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 31 ? 11 : 8}" style="fill:var(--d-${d})" class="disc"/>`);
    });
    inner.forEach(([x, y], i) => out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" class="${i < 4 ? 'fin-bg' : 'kpi-bg'}"/>`));
    out.push(`<circle cx="${cx - 20}" cy="${cy + 6}" r="15" class="sit-bad"/><circle cx="${cx + 24}" cy="${cy - 10}" r="12" class="sit-good"/>`);
    return `<svg class="hero-art" viewBox="0 0 400 400" aria-hidden="true">${out.join('')}</svg>`;
  }

  function scenarioStats(sc) {
    const g = E.newGame({ scenario: sc.id, seed: 'preview', length: 12 });
    return { rev: g.fin.last.revenue, rating: E.RATINGS[g.fin.ratingIdx], share: g.vars.share * E.SHARE_SCALE };
  }
  const statCache = {};

  function renderStart() {
    const saved = U.saved;
    const cards = C.scenarios.map((sc) => {
      const st = statCache[sc.id] || (statCache[sc.id] = scenarioStats(sc));
      const dots = [1, 2, 3].map((i) => `<i class="${i <= sc.difficulty ? 'on' : ''}"></i>`).join('');
      const fresh = sc.id === 'ai' || sc.id === 'palmoil';
      return `<button class="scen" data-act="scenario" data-id="${sc.id}" aria-pressed="${U.scenario === sc.id}" style="--tone:var(--d-${sc.tone || 'inn'})">
        <div class="scen-head"><span class="scen-ico">${ico(sc.icon)}</span><h3>${esc(L(sc.name))}</h3>${fresh ? `<span class="new-tag">${tr('newTag')}</span>` : ''}<span class="dots" title="${tr('difficulty')}" aria-label="${tr('difficulty')} ${sc.difficulty}/3">${dots}</span></div>
        <div><div class="company">${esc(sc.company)}</div><div class="eyebrow">${esc(L(sc.industry))}</div></div>
        <p class="brief">${esc(L(sc.brief))}</p>
        <div class="scen-stats">
          <div><span class="eyebrow">${tr('revenueQ')}</span><b>${money(st.rev)}</b></div>
          <div><span class="eyebrow">${tr('rating')}</span><b>${st.rating}</b></div>
          <div><span class="eyebrow">${tr('marketShare')}</span><b>${pct(st.share, 1)}</b></div>
        </div>
      </button>`;
    }).join('');
    const map = [['mapPolicies', 'mapPoliciesD'], ['mapCapital', 'mapCapitalD'], ['mapStake', 'mapStakeD'], ['mapRups', 'mapRupsD'], ['mapSit', 'mapSitD'], ['mapCase', 'mapCaseD']]
      .map(([a, b]) => `<div><b>${tr(a)}</b><span>${tr(b)}</span></div>`).join('');
    let resume = '';
    if (saved) {
      const done = saved.S.status !== 'playing', q = done ? saved.S.t - 1 : saved.S.t;
      resume = `<button class="btn" data-act="resume">${tr('resume', esc(`${L(E.SCEN[saved.S.scenario].name)} · Q${(q % 4) + 1} ${saved.S.year0 + Math.floor(q / 4)}${done ? ' · ' + tr('finished') : ''}`))}</button>`;
    }
    return `<div class="start"><div class="start-inner">
      <div class="start-top">
        <div class="wordmark">${logo()}<span>CEO Mandate · ${tr('tagline')}</span></div>
        <div class="seg" role="group" aria-label="${tr('language')}">
          <button data-act="lang" data-id="id" aria-pressed="${U.lang === 'id'}">ID</button><button data-act="lang" data-id="en" aria-pressed="${U.lang === 'en'}">EN</button>
        </div>
      </div>
      <section class="hero">
        <div>
          <h1>${tr('heroA')}<span>${tr('heroB')}</span></h1>
          <p class="lede">${tr('lede')}</p>
          <div class="mapping">${map}</div>
        </div>
        ${heroArt()}
      </section>
      <section>
        <div class="section-title"><h2>${tr('chooseScenario')}</h2></div>
        <div class="scen-grid">${cards}</div>
      </section>
      <section class="setup">
        <div class="setup-fields">
          <div class="field"><label for="seed">${tr('classCode')}</label><input id="seed" type="text" maxlength="24" value="${esc(U.seed)}" autocomplete="off" spellcheck="false"><span class="help">${tr('classCodeHelp')}</span></div>
          <div class="field"><span class="label">${tr('duration')}</span><div class="seg" role="group" aria-label="${tr('duration')}">
            <button data-act="length" data-id="8" aria-pressed="${U.length === 8}">${tr('q8')}</button><button data-act="length" data-id="12" aria-pressed="${U.length === 12}">${tr('q12')}</button></div></div>
        </div>
        <div class="setup-actions">${resume}<button class="btn primary" data-act="start">${tr('startGame')} →</button></div>
      </section>
      <section>
        <div class="section-title"><h2>${tr('howTitle')}</h2></div>
        <div class="howto">
          <div><b>${tr('how1')}</b><p>${tr('how1d')}</p></div><div><b>${tr('how2')}</b><p>${tr('how2d')}</p></div>
          <div><b>${tr('how3')}</b><p>${tr('how3d')}</p></div><div><b>${tr('how4')}</b><p>${tr('how4d')}</p></div>
        </div>
      </section>
      <p class="credit">${tr('credit')}</p>
    </div></div>`;
  }
  function logo() {
    return `<svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="13" r="5" style="fill:var(--accent)"/><circle cx="13" cy="1.5" r="2.5" style="fill:var(--d-fin)"/><circle cx="23" cy="18.5" r="2.5" style="fill:var(--d-ops)"/><circle cx="3" cy="18.5" r="2.5" style="fill:var(--d-hr)"/></svg>`;
  }

  /* ----------------------------------------------------------------- game */

  function nextRupsQ() { return Math.ceil(curQ() / 4) * 4; }

  function renderTop() {
    const ap = E.approval(S), left = E.capitalLeft(S), spent = E.capitalSpent(S);
    const prev = S.finHist.length > 1 ? S.finHist[S.finHist.length - 2].price : S.fin.price;
    const dPrice = S.fin.price / prev - 1;
    const nr = nextRupsQ() - S.t;
    const playing = S.status === 'playing';
    return `<header class="topbar">
      <div class="co"><span class="co-ico" style="--tone:var(--d-${E.SCEN[S.scenario].tone || 'inn'})">${ico(E.SCEN[S.scenario].icon)}</span><b>${esc(E.SCEN[S.scenario].company)}</b><span>${playing ? `${qLabel(curQ())} · ${tr('quarterOf', curQ(), S.length)} · ${tr('nextRups')} ${nr <= 1 ? tr('thisQ') : tr('inQ', nr)}` : tr('gameOver')}</span></div>
      <div class="meters">
        <button class="meter big" data-act="rail" data-id="stake" title="${tr('confidence')}"><span class="k">${tr('confShort')}</span><span class="v ${ap < 0.5 ? 'neg' : ''}">${pct(ap)}</span><span class="conf-bar"><i style="width:${(ap * 100).toFixed(1)}%"></i><b></b></span></button>
        <div class="meter" title="${tr('capital')}"><span class="k">${tr('capShort')}</span><span class="v">${left}<small class="muted">${spent ? `/ ${S.capital}` : ''}</small></span></div>
        <button class="meter m-cash" data-act="rail" data-id="fin"><span class="k">${tr('cash')}</span><span class="v">${money(S.fin.cash)}</span></button>
        <button class="meter" data-act="detail" data-type="fin" data-id="f_price"><span class="k">${tr('sharePrice')}</span><span class="v">${priceStr(S.fin.price)}<small class="${signCls(dPrice)}">${spct(dPrice, 1)}</small></span></button>
        <button class="meter" data-act="detail" data-type="fin" data-id="f_rating"><span class="k">${tr('ratingS')}</span><span class="v ${S.fin.ratingIdx >= 5 ? 'neg' : ''}">${E.RATINGS[S.fin.ratingIdx]}</span></button>
      </div>
      <div class="top-actions">
        <button class="btn ghost small" data-act="help" aria-label="${tr('help')}"><span class="hide-sm">${tr('help')}</span><span class="show-sm" aria-hidden="true">?</span></button>
        <div class="seg" role="group" aria-label="${tr('language')}"><button data-act="lang" data-id="id" aria-pressed="${U.lang === 'id'}">ID</button><button data-act="lang" data-id="en" aria-pressed="${U.lang === 'en'}">EN</button></div>
        <button class="btn ghost small hide-sm hide-md" data-act="new">${tr('newGame')}</button>
        ${playing ? `<button class="btn primary" data-act="end-quarter">${tr('endQuarter')} →</button>` : `<button class="btn primary" data-act="results">${tr('viewResults')}</button>`}
      </div>
    </header>`;
  }

  function renderGame() {
    const tabs = [['map', 'tabMap'], ['list', 'tabList'], ['kpi', 'tabKpi']]
      .map(([id, k]) => `<button class="tab" role="tab" data-act="main" data-id="${id}" aria-selected="${U.mainTab === id}">${tr(k)}</button>`).join('');
    const legend = `<div class="legend"><span><i class="p"></i>${tr('legRaise')}</span><span><i class="n"></i>${tr('legLower')}</span><span><i class="o"></i>${tr('legOff')}</span></div>`;
    let body;
    if (U.mainTab === 'map') body = `<div class="depts">${C.departments.map((d) => `<span><i style="background:var(--d-${d.id})"></i>${esc(L(d.name))}</span>`).join('')}</div><div class="mapbox" id="mapbox" aria-label="${tr('tabMap')}"></div>`;
    else if (U.mainTab === 'list') body = `<div class="listview">${renderPolicyList()}</div>`;
    else body = `<div class="listview">${renderKpiList()}</div>`;
    const railTabs = [['stake', 'tabStake'], ['fin', 'tabFin'], ['mandate', 'tabMandate']]
      .map(([id, k]) => `<button class="tab" role="tab" data-act="rail" data-id="${id}" aria-selected="${U.railTab === id}">${tr(k)}</button>`).join('');
    return `<div class="game">
      ${renderTop()}
      <main class="main">
        <div class="tabs" role="tablist">${tabs}<span class="spacer"></span>${U.mainTab === 'map' ? legend : ''}</div>
        ${body}
        ${renderTicker()}
      </main>
      <aside class="rail">
        <div class="tabs" role="tablist">${railTabs}</div>
        <div class="rail-body">${U.railTab === 'stake' ? renderStake() : U.railTab === 'fin' ? renderFinance() : renderMandate()}</div>
      </aside>
    </div>`;
  }

  function newsText(n) {
    if (n.type === 'macro') return { tag: 'info', label: tr('tagMacro'), text: L(E.MEV[n.id].text) };
    if (n.type === 'risk') { const r = REV[n.id]; return { tag: r.kind === 'good' ? 'good' : 'bad', label: r.kind === 'good' ? tr('tagGood') : tr('tagRisk'), text: L(r.text) }; }
    if (n.type === 'consequence') return { tag: 'bad', label: tr('tagConseq'), text: L(n.text) };
    if (n.type === 'borrow') return { tag: 'bad', label: tr('tagFin'), text: tr('borrowNews', money(n.amount)) };
    return { tag: 'info', label: '', text: '' };
  }
  function allNews() {
    const out = [];
    for (const e of S.log) if (e.type === 'news') for (const n of e.items) out.push({ t: e.t, ...newsText(n) });
    return out.reverse();
  }
  function renderTicker() {
    const items = allNews().slice(0, 6);
    return `<div class="ticker"><span class="eyebrow">${tr('news')}</span><div class="ticker-items">${items.length
      ? items.map((n) => `<span><span class="tag ${n.tag}">${qLabel(n.t)}</span>${esc(n.text)}</span>`).join('')
      : `<span class="muted">${tr('noNews')}</span>`}</div></div>`;
  }

  /* ------------------------------------------------------- policy list */

  function changed(id) {
    const a = S.polStart[id], b = S.pol[id];
    return a.on !== b.on || Math.abs(a.x - b.x) > 1e-3;
  }
  function renderPolicyList() {
    return `<div class="dept-grid">${C.departments.map((d) => `<div class="dept"><h3><i style="background:var(--d-${d.id})"></i>${esc(L(d.name))}</h3>
      ${PL().filter((p) => p.dept === d.id).map((p) => {
        const st = S.pol[p.id];
        return `<button class="prow ${st.on ? '' : 'off'}" data-act="detail" data-type="pol" data-id="${p.id}">
          <span class="chip" style="background:var(--d-${d.id});color:var(--di-${d.id})">${ico(iconName('pol', p.id))}</span>
          <span class="nm">${esc(L(p.name))}${changed(p.id) ? '<span class="dot-changed" title="' + tr('changedThisQ') + '"></span>' : ''}<small>${st.on ? esc(policyLabel(p, st.x)) : tr('inactive')}</small></span>
          <span class="bar">${st.on ? `<i style="width:${(st.x * 100).toFixed(0)}%"></i>` : ''}</span>
        </button>`;
      }).join('')}</div>`).join('')}</div>`;
  }

  function spark(vals, w = 200, h = 34) {
    if (vals.length < 2) return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"></svg>`;
    const mid = (Math.min(...vals) + Math.max(...vals)) / 2, half = Math.max(0.05, (Math.max(...vals) - Math.min(...vals)) / 2 + 0.01);
    const lo = mid - half, hi = mid + half;
    const x = (i) => 2 + (i * (w - 6)) / (vals.length - 1);
    const y = (v) => 3 + ((hi - clamp(v, lo, hi)) / (hi - lo || 1)) * (h - 6);
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const last = vals.length - 1;
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" aria-hidden="true"><path class="area" d="${d}L${x(last)},${h}L${x(0)},${h}Z"/><path class="line" d="${d}"/><circle class="dot" r="3.5" cx="${x(last).toFixed(1)}" cy="${y(vals[last]).toFixed(1)}"/></svg>`;
  }
  function kpiValueText(id) {
    return id === 'share' ? pct(S.vars.share * E.SHARE_SCALE, 1) : nf(0).format(S.vars[id] * 100);
  }
  function renderKpiList() {
    const out = [];
    for (const p of C.perspectives) {
      if (p.id === 'fin') continue;
      out.push(`<div class="persp-h eyebrow">${esc(L(p.name))}</div>`);
      for (const v of VL().filter((x) => x.persp === p.id)) {
        const hist = S.hist.vars.map((h) => h[v.id]);
        const d = hist.length > 1 ? hist[hist.length - 1] - hist[hist.length - 2] : 0;
        const tgt = E.explainVar(S, v.id).target;
        out.push(`<button class="kcard" data-act="detail" data-type="var" data-id="${v.id}">
          <div class="top"><b>${ico(iconName('var', v.id), 'k-ico')}${esc(L(v.name))}</b><span class="mono ${signCls(d, 0.002)}">${hist.length > 1 ? pts(d) : ''}</span></div>
          <div class="top"><span class="v">${kpiValueText(v.id)}</span><span class="muted mono" style="font-size:11px">${tr('heading', nf(0).format(tgt * 100))} ${arrow(tgt - S.vars[v.id], 0.005)}</span></div>
          ${spark(hist)}
        </button>`);
      }
    }
    out.push(`<div class="persp-h"><div class="eyebrow">${tr('riskRadar')}</div><p class="muted" style="font-size:12px;margin-top:4px">${tr('riskRadarD')}</p></div>`);
    for (const si of SL()) {
      const st = S.sit[si.id], on = E.sitOn(si);
      const sc = E.sitScore(S, si.id);
      const bad = si.kind === 'bad';
      out.push(`<button class="kcard" data-act="detail" data-type="sit" data-id="${si.id}">
        <div class="top"><b>${ico(iconName('sit', si.id), bad ? 'k-ico neg' : 'k-ico pos')}${esc(L(si.name))}</b><span class="tag ${bad ? 'bad' : 'good'}">${st.on ? tr('active') : bad ? tr('crisis') : tr('opportunity')}</span></div>
        <div class="meter-trig" aria-label="${tr('triggerLevel')} ${pct(sc)}"><i style="width:${(sc * 100).toFixed(1)}%;background:${st.on ? (bad ? 'var(--neg)' : 'var(--pos)') : 'var(--ink-3)'}"></i><b style="left:${(on * 100).toFixed(1)}%"></b></div>
        <span class="mono muted" style="font-size:11px">${pct(sc)} / ${pct(on)}</span>
      </button>`);
    }
    return `<div class="kpi-grid">${out.join('')}</div>`;
  }

  /* ---------------------------------------------------------------- rail */

  function renderStake() {
    const ap = E.approval(S);
    const prevAp = S.hist.approval.length > 1 ? S.hist.approval[S.hist.approval.length - 2] : ap;
    const votes = Object.fromEntries(E.votes(S).map((v) => [v.id, v]));
    const rows = GL().slice().sort((a, b) => votes[b.id].share - votes[a.id].share).map((g) => {
      const h = S.groups[g.id].h;
      const hist = S.hist.groups;
      const d = hist.length > 1 ? h - hist[hist.length - 2][g.id] : 0;
      const col = h < 0.35 ? 'var(--neg)' : h < 0.5 ? 'var(--warn)' : 'var(--pos)';
      return `<button class="grp" data-act="detail" data-type="grp" data-id="${g.id}">
        <span class="g-ico">${ico(iconName('grp', g.id))}</span><span class="nm">${esc(L(g.name))}<span class="react" data-g="${g.id}"></span><small>${tr('voteWeight', pct(votes[g.id].share, 0))}</small></span>
        <span class="hbar"><i style="width:${(h * 100).toFixed(1)}%;background:${col}"></i><span class="mid"></span></span>
        <span class="v">${nf(0).format(h * 100)}<small class="${signCls(d, 0.002)}">${hist.length > 1 ? pts(d) : ''}</small></span>
      </button>`;
    }).join('');
    const nr = nextRupsQ();
    return `<div class="conf">
        <div class="conf-top"><span class="eyebrow">${tr('confidence')}</span><span class="mono ${signCls(ap - prevAp, 0.002)}">${S.hist.approval.length > 1 ? pts(ap - prevAp) : ''}</span></div>
        <div class="conf-v ${ap < 0.5 ? 'neg' : ''}">${pct(ap, 1)}</div>
        <div class="conf-scale"><i style="width:${(ap * 100).toFixed(1)}%"></i><b></b></div>
        <p class="conf-note">${S.status === 'playing' ? tr('nextRupsNote', qLabel(nr)) : tr('gameOver')}</p>
      </div>
      <div><p class="preview-note" id="react-note">${tr(canHover() ? 'hoverHint' : 'tapHint')}</p></div>
      <div>${rows}</div>`;
  }

  function niceTicks(lo, hi, n = 3) {
    const span = hi - lo || 1;
    const step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) || mag * 10;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  // Small, single-series charts (no legend needed; the heading names the series).
  function chartSvg(points, o = {}) {
    const w = o.w || 320, h = o.h || 120, pl = o.pl ?? 46, pr = 10, pt = 10, pb = 20;
    if (!points.length) return '';
    const vs = points.map((p) => p.v);
    let lo = Math.min(...vs), hi = Math.max(...vs);
    if (o.zero || o.kind === 'bar') { lo = Math.min(0, lo); hi = Math.max(0, hi); }
    if (o.threshold != null) { lo = Math.min(lo, o.threshold); hi = Math.max(hi, o.threshold); }
    if (o.lo != null) lo = Math.min(lo, o.lo);
    if (o.hi != null) hi = Math.max(hi, o.hi);
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    const ticks = niceTicks(lo, hi, 3);
    lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    const iw = w - pl - pr, ih = h - pt - pb;
    const y = (v) => pt + ((hi - v) / (hi - lo)) * ih;
    const n = points.length;
    const band = iw / Math.max(n, 1);
    const xc = (i) => (o.kind === 'bar' ? pl + band * (i + 0.5) : pl + (n === 1 ? iw / 2 : (i * iw) / (n - 1)));
    const out = [];
    for (const tk of ticks) out.push(`<line class="grid" x1="${pl}" x2="${w - pr}" y1="${y(tk).toFixed(1)}" y2="${y(tk).toFixed(1)}"/><text x="${pl - 6}" y="${(y(tk) + 3).toFixed(1)}" text-anchor="end">${esc(o.tick ? o.tick(tk) : tk)}</text>`);
    if (o.threshold != null) out.push(`<line class="thresh" x1="${pl}" x2="${w - pr}" y1="${y(o.threshold).toFixed(1)}" y2="${y(o.threshold).toFixed(1)}"/>`);
    const every = Math.ceil(n / 6);
    points.forEach((p, i) => { if (i % every === 0 || i === n - 1) out.push(`<text x="${xc(i).toFixed(1)}" y="${h - 5}" text-anchor="middle">${esc(p.label)}</text>`); });
    if (o.kind === 'bar') {
      const bw = Math.min(18, band * 0.62);
      points.forEach((p, i) => {
        const y0 = y(0), y1 = y(p.v), top = Math.min(y0, y1), hh = Math.max(1, Math.abs(y1 - y0));
        const r = Math.min(4, hh / 2, bw / 2);
        const x0 = xc(i) - bw / 2;
        const path = p.v >= 0
          ? `M${x0},${y0}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + bw - r}Q${x0 + bw},${top} ${x0 + bw},${top + r}V${y0}Z`
          : `M${x0},${y0}V${top + hh - r}Q${x0},${top + hh} ${x0 + r},${top + hh}H${x0 + bw - r}Q${x0 + bw},${top + hh} ${x0 + bw},${top + hh - r}V${y0}Z`;
        out.push(`<path class="${p.v >= 0 ? 'bar-pos' : 'bar-neg'}" d="${path}"><title>${esc(p.label)}: ${esc(o.fmt(p.v))}</title></path>`);
      });
      out.push(`<line class="axis" x1="${pl}" x2="${w - pr}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`);
    } else {
      const d = points.map((p, i) => `${i ? 'L' : 'M'}${xc(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
      out.push(`<path class="area" d="${d}L${xc(n - 1).toFixed(1)},${y(lo).toFixed(1)}L${xc(0).toFixed(1)},${y(lo).toFixed(1)}Z"/><path class="line" d="${d}"/>`);
      points.forEach((p, i) => out.push(`<circle class="hit" r="${Math.max(6, band / 2).toFixed(1)}" cx="${xc(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}"><title>${esc(p.label)}: ${esc(o.fmt(p.v))}</title></circle>`));
      out.push(`<circle class="dot" r="4" cx="${xc(n - 1).toFixed(1)}" cy="${y(points[n - 1].v).toFixed(1)}"/>`);
      out.push(`<text x="${Math.min(w - pr, xc(n - 1) + 6).toFixed(1)}" y="${(y(points[n - 1].v) - 8).toFixed(1)}" text-anchor="end" style="fill:var(--ink)">${esc(o.fmt(points[n - 1].v))}</text>`);
    }
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.title || '')}">${out.join('')}</svg>`;
  }
  const histPoints = (key, fmtLabel = true) => S.finHist.filter((q) => q.t >= 0).map((q) => ({ v: q[key], label: q.t === 0 ? (U.lang === 'id' ? 'Awal' : 'Start') : qLabel(q.t).replace(' 20', "'") }));

  function plTable() {
    const pl = S.fin.last;
    const rows = [
      ['plRevenue', pl.revenue, 'sum'], ['plCogs', -pl.cogs], ['plGross', pl.revenue - pl.cogs, 'sum'], ['plOpex', -pl.opex],
      ...(pl.carbon ? [['plCarbon', -pl.carbon]] : []), ['plPolicies', -pl.polCost], ['ebitda', pl.ebitda, 'sum'], ['plDa', -pl.da],
      ['plInterest', -pl.interest], ...(pl.extraordinary ? [['plExtra', -pl.extraordinary]] : []), ['plTax', -pl.tax], ['netIncome', pl.ni, 'sum'],
      ...(pl.div ? [['plDiv', -pl.div, 'sub']] : []), ...(pl.buyback ? [['plBuyback', -pl.buyback, 'sub']] : []), ...(pl.capex ? [['plCapex', -pl.capex, 'sub']] : []),
      ...(pl.repay ? [['plRepay', -pl.repay, 'sub']] : []), ...(pl.borrowed ? [['plBorrow', pl.borrowed, 'sub']] : []),
    ];
    return `<table class="pl">${rows.map(([k, v, cls]) => `<tr class="${cls || ''}"><td>${tr(k)}</td><td class="${v < -0.5 && cls === 'sum' ? 'neg' : ''}">${money(v)}</td></tr>`).join('')}</table>`;
  }

  function renderFinance() {
    const pl = S.fin.last, f = S.fin;
    const prev = S.finHist.length > 1 ? S.finHist[S.finHist.length - 2] : null;
    const dRev = prev ? pl.revenue / prev.rev - 1 : 0;
    const stat = (k, v, d = '', cls = '') => `<div class="stat"><span class="eyebrow">${k}</span><span class="v ${cls}">${v}</span>${d ? `<span class="d">${d}</span>` : ''}</div>`;
    const top = pl.items.filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const tsr = E.tsr(S);
    return `<div class="stat-grid">
        ${stat(tr('revenue'), money(pl.revenue), prev ? `<span class="${signCls(dRev)}">${spct(dRev, 1)}</span> ${tr('qoq')}` : '')}
        ${stat(tr('netIncome'), money(pl.ni), `${tr('netMargin')} ${pct(pl.ni / pl.revenue, 1)}`, pl.ni < 0 ? 'neg' : '')}
        ${stat(tr('ebitda'), money(pl.ebitda), `${tr('ebitdaMargin')} ${pct(pl.ebitda / pl.revenue, 1)}`, pl.ebitda < 0 ? 'neg' : '')}
        ${stat(tr('cash'), money(f.cash))}
        ${stat(tr('debt'), money(f.debt), f.netDebtEbitda != null ? `${tr('netDebtEbitda')} ${nf(1).format(f.netDebtEbitda)}×` : '')}
        ${stat(tr('ratingS'), E.RATINGS[f.ratingIdx], `${tr('interestRate')} ${pct(pl.rate, 1)}`, f.ratingIdx >= 5 ? 'neg' : '')}
        ${stat(tr('sharePrice'), priceStr(f.price), `${tr('mcap')} ${money(f.mcap)}`)}
        ${stat(tr('tsr'), spct(tsr, 0), '', signCls(tsr))}
      </div>
      <div class="chart"><h4>${tr('chartRev')}</h4>${chartSvg(histPoints('rev'), { kind: 'bar', fmt: money, tick: moneyShort, title: tr('chartRev') })}</div>
      <div class="chart"><h4>${tr('chartNi')}</h4>${chartSvg(histPoints('ni'), { kind: 'bar', fmt: money, tick: moneyShort, title: tr('chartNi') })}</div>
      <div class="chart"><h4>${tr('chartPrice')}</h4>${chartSvg(histPoints('price'), { fmt: priceStr, tick: (v) => nf(0).format(v), title: tr('chartPrice') })}</div>
      <div class="block"><h3>${tr('plTitle')}<span class="eyebrow">${S.t ? qLabel(S.t) : ''}</span></h3>
        ${plTable()}</div>
      <div class="block"><h3>${tr('topCosts')}</h3>
        <table class="pl">${top.map(([id, c]) => `<tr><td><button class="btn ghost small" style="padding:0;min-height:0" data-act="detail" data-type="pol" data-id="${id}">${esc(L(P(id).name))}</button></td><td>${money(c)}</td></tr>`).join('')}</table></div>`;
  }

  function renderMandate() {
    const sc = E.SCEN[S.scenario], H = E.helpers(S);
    H.money = money;
    H.pct = pct;
    H.signedPct = (v) => spct(v, 0);
    const objs = sc.objectives.map((o) => {
      const r = o.check(S, H);
      return `<div class="obj"><span class="ic ${r.ok ? 'ok' : ''}">${r.ok ? '✓' : ''}</span><span>${esc(L(o.text))}</span><span class="now">${esc(r.now)}</span></div>`;
    }).join('');
    const m = S.macro, mh = S.hist.macro, m0 = mh.length > 1 ? mh[mh.length - 2] : m;
    const mstat = (k, v, d) => `<div class="stat"><span class="eyebrow">${k}</span><span class="v">${v}</span><span class="d ${signCls(d, 1e-3)}">${Math.abs(d) > 1e-3 ? arrow(d) : ''}</span></div>`;
    const regimes = C.macroEvents.filter((e) => e.regime && S.flags[e.id]).map((e) => `<span class="flag">${esc(L(e.name))}</span>`).join('');
    const news = allNews();
    const logRows = S.log.filter((e) => e.type === 'policy' || e.type === 'case').slice().reverse().map((e) => {
      if (e.type === 'case') {
        const d = E.DIL[e.id];
        return `<div><span class="q">${qLabel(e.t)}</span><span><span class="tag info">${tr('concept')}</span>${esc(L(d.title))}: <b>${esc(L(d.options[e.choice].label))}</b></span></div>`;
      }
      return `<div><span class="q">${qLabel(e.t)}</span><span>${e.changes.map(changeText).join('; ')}</span></div>`;
    }).join('');
    return `${storyBlock()}
      <div class="block"><h3>${tr('objectives')}</h3>${objs}</div>
      <div class="block"><h3>${tr('economy')}</h3><div class="macro">
        ${mstat(tr('gdp'), nf(1).format(m.gdp) + '%', m.gdp - m0.gdp)}
        ${mstat(tr('bi'), nf(2).format(m.bi) + '%', m.bi - m0.bi)}
        ${mstat(tr('fx'), nf(0).format(m.fx), m.fx - m0.fx)}
        ${mstat(tr('inputIdx'), nf(2).format(m.input), m.input - m0.input)}
        ${mstat(tr('competition'), pct(m.comp), m.comp - m0.comp)}
        ${mstat(tr('marketSize'), money(S.fin.M), 0)}
      </div></div>
      <div class="block"><h3>${tr('regimes')}</h3><div class="flags">${regimes || `<span class="muted">${tr('noRegimes')}</span>`}</div></div>
      <div class="block"><h3>${tr('news')}</h3><div class="news">${news.length ? news.map((n) => `<div class="news-item"><span class="q">${qLabel(n.t)}</span><span><span class="tag ${n.tag}">${esc(n.label)}</span>${esc(n.text)}</span></div>`).join('') : `<span class="muted">${tr('noNews')}</span>`}</div></div>
      <div class="block"><h3>${tr('decisions')}</h3><div class="log">${logRows || `<span class="muted">${tr('noDecisions')}</span>`}</div></div>
      <div><button class="btn" data-act="new">${tr('newGame')}</button></div>`;
  }
  // Story chapters reached so far: prologue, year-end chapters (by board mood) and epilogue.
  function storyBeats() {
    const st = E.SCEN[S.scenario].story;
    if (!st) return [];
    const beats = [{ label: tr('prolog'), text: L(st.prolog) }];
    [['y1', 4], ['y2', 8]].forEach(([k, q], i) => {
      if (S.t >= q && q < S.length && st[k]) beats.push({ label: `${tr('chapter', i + 2)} · ${tr('yearEnd', i + 1)}`, text: L(st[k][S.hist.approval[q] >= 0.55 ? 'good' : 'bad']) });
    });
    if (S.status !== 'playing' && st.end) beats.push({ label: tr('epilogue'), text: L(st.end[epilogueKey()]) });
    return beats;
  }
  function epilogueKey() {
    if (S.status === 'fired' || S.status === 'bankrupt') return 'bad';
    return E.finalScore(S).total >= 640 ? 'good' : 'mid';
  }
  function storyBlock() {
    const beats = storyBeats();
    if (!beats.length) return '';
    const last = beats[beats.length - 1];
    return `<div class="story-card"><div class="story-head">${ico(E.SCEN[S.scenario].icon)}<span class="eyebrow">${tr('story')} · ${esc(last.label)}</span></div>
      <p>${esc(last.text)}</p><button class="btn small" data-act="prolog">${tr('readProlog')}</button></div>`;
  }
  function changeText(c) {
    const p = P(c.id), n = L(p.name);
    if (c.from == null) return U.lang === 'id' ? `memperkenalkan ${n} (${pct(c.to)})` : `introduced ${n} (${pct(c.to)})`;
    if (c.to == null) return U.lang === 'id' ? `menghentikan ${n}` : `ended ${n}`;
    return `${n} ${pct(c.from)} → ${pct(c.to)}`;
  }

  /* ----------------------------------------------------------------- map */

  const M = { W: 0, H: 0, cx: 0, cy: 0, pos: {}, ro: null };

  function sampleEllipse(cx, cy, ax, ay) {
    const N = 720, pts = [], cum = [0];
    for (let i = 0; i <= N; i++) {
      const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
      pts.push([cx + ax * Math.cos(a), cy + ay * Math.sin(a)]);
      if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const total = cum[N];
    return (s) => {
      s = ((s % total) + total) % total;
      let lo = 0, hi = N;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] < s) lo = mid; else hi = mid; }
      const f = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
      return { x: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, y: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f, total };
    };
  }
  // Places ring items at equal arc length, with the first group centered at the top.
  function placeRing(at, groups) {
    const slots = [];
    groups.forEach((g) => { g.items.forEach((id) => slots.push({ id, g: g.key })); slots.push(null); });
    const total = at(0).total, step = total / slots.length;
    const firstLen = groups[0].items.length;
    const out = {}, groupMid = {};
    slots.forEach((sl, i) => {
      if (!sl) return;
      const p = at((i - (firstLen - 1) / 2) * step);
      out[sl.id] = p;
    });
    let i0 = 0;
    groups.forEach((g) => {
      const mid = i0 + (g.items.length - 1) / 2;
      groupMid[g.key] = at((mid - (firstLen - 1) / 2) * step);
      i0 += g.items.length + 1;
    });
    return { pos: out, mid: groupMid, step };
  }

  const perimeter = (a, b) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  // Node sizes and labels adapt to the room available, so the map stays legible on phones.
  function computeLayout(W, H) {
    const cx = W / 2, cy = H / 2, m = Math.min(W, H);
    const nP = PL().length + C.departments.length, nK = VL().length + C.finNodes.length + 5;
    const stepP0 = perimeter(W / 2 - 50, H / 2 - 40) / nP;
    const rP = clamp(Math.min(m * 0.038, stepP0 * 0.4), 9, 25);
    const showPL = stepP0 >= 54;
    const ax = W / 2 - rP - 10, ay = H / 2 - rP - 10;
    const outer = sampleEllipse(cx, cy, ax, ay);
    const pr = placeRing(outer, C.departments.map((d) => ({ key: d.id, items: PL().filter((p) => p.dept === d.id).map((p) => p.id) })));
    const ix = ax * 0.6, iy = ay * 0.58;
    const stepK = perimeter(ix, iy) / nK;
    const rK = clamp(Math.min(m * 0.054, stepK * 0.4), 10, 34);
    const showKL = stepK >= 50;
    const inner = sampleEllipse(cx, cy, ix, iy);
    const kr = placeRing(inner, [
      { key: 'fin', items: C.finNodes.map((f) => f.id) },
      ...['cust', 'proc', 'learn', 'esg'].map((k) => ({ key: k, items: VL().filter((v) => v.persp === k).map((v) => v.id) })),
    ]);
    const finW = Math.min(rK * 2.6, stepK * 0.92), finH = rK * 1.6;
    const pos = {};
    for (const p of PL()) pos['pol:' + p.id] = { ...pr.pos[p.id], r: rP, type: 'pol', id: p.id };
    for (const f of C.finNodes) pos['fin:' + f.id] = { ...kr.pos[f.id], r: finH / 2 + 2, type: 'fin', id: f.id };
    for (const v of VL()) pos['var:' + v.id] = { ...kr.pos[v.id], r: rK, type: 'var', id: v.id };
    const act = SL().filter((s) => S.sit[s.id].on);
    const rS = clamp(Math.min(m * 0.04, rK * 0.95), 10, 24);
    const sr = Math.min(ix, iy) * (act.length > 6 ? 0.55 : 0.42);
    act.forEach((s, i) => {
      const n = act.length;
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + (n === 2 ? Math.PI / 2 : 0);
      const p = n === 1 ? { x: cx, y: cy - rS * 0.4 } : { x: cx + sr * Math.cos(a) * 1.3, y: cy + sr * Math.sin(a) * 0.9 };
      pos['sit:' + s.id] = { ...p, r: rS, type: 'sit', id: s.id };
    });
    Object.assign(M, { W, H, cx, cy, ax, ay, ix, iy, rP, rK, rS, finW, finH, pos, deptMid: pr.mid, perspMid: kr.mid, showPL, showKL, small: m < 520 });
  }

  function arcPath(r, frac) {
    frac = clamp(frac, 0, 0.9999);
    const a0 = -Math.PI / 2, a1 = a0 + frac * Math.PI * 2;
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  function splitLabel(s, max = 12) {
    if (s.length <= max || !s.includes(' ')) return [s];
    const words = s.split(' ');
    let a = '', i = 0;
    while (i < words.length && (a + ' ' + words[i]).trim().length <= max) { a = (a + ' ' + words[i]).trim(); i++; }
    if (!a) { a = words[0]; i = 1; }
    return [a, words.slice(i).join(' ')];
  }
  function labelSvg(lines, y) {
    return `<text class="lbl" text-anchor="middle" y="${y}">${lines.map((l, i) => `<tspan x="0" dy="${i ? 14 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  }
  // Label spots, in order of preference. Outer-ring labels hang off the side of the node that
  // faces the center (one line further in when the first spot is taken). Inner-ring labels sit
  // beside the node on the sides and toward the center at top and bottom.
  const LH = 14;
  function ringCands(q, r, text) {
    let ux = (M.cx - q.x) / M.ax, uy = (M.cy - q.y) / M.ay;
    const n = Math.hypot(ux, uy) || 1;
    ux /= n; uy /= n;
    const anchor = ux > 0.45 ? 'start' : ux < -0.45 ? 'end' : 'middle';
    // Side labels have room to run toward the center, so they stay on one line.
    const lines = splitLabel(text, anchor === 'middle' ? 10 : 16), k = lines.length;
    const spot = (extra, sh = 0) => {
      const d = r + 6 + extra, yb = uy * d;
      if (anchor !== 'middle') return { anchor, x: ux * d, y0: yb + 4 - ((k - 1) * LH) / 2 + sh * 7 };
      return { anchor: ['end', 'middle', 'start'][sh + 1], x: ux * d - sh * r * 0.5, y0: uy > 0 ? yb + 11 : yb - (k - 1) * LH - 1 };
    };
    return { lines, cands: [spot(0), spot(0, 1), spot(0, -1), spot(LH + 1), spot(LH + 1, 1), spot(LH + 1, -1)] };
  }
  function innerCands(q, r, k) {
    let ux = (M.cx - q.x) / M.ix, uy = (M.cy - q.y) / M.iy;
    const n = Math.hypot(ux, uy) || 1;
    ux /= n; uy /= n;
    const side = (sg) => ({ anchor: sg > 0 ? 'start' : 'end', x: sg * (r + 6), y0: 4 - ((k - 1) * LH) / 2 });
    // sh nudges a label above/below the node to its right (1) or left (-1) to dodge a neighbor.
    const vert = (sg, sh = 0) => ({ anchor: ['end', 'middle', 'start'][sh + 1], x: -sh * r * 0.5, y0: sg > 0 ? r + 15 : -(r + 8) - (k - 1) * LH });
    const sx = ux >= 0 ? 1 : -1, sy = uy >= 0 ? 1 : -1;
    // Spots facing away from the center cross the perspective captions, so they cost extra.
    return Math.abs(ux) > 0.6 ? [side(sx), vert(sy), vert(sy, 1), vert(sy, -1), vert(-sy), { ...side(-sx), away: 1 }]
      : [vert(sy), vert(sy, 1), vert(sy, -1), side(sx), { ...side(-sx), away: 1 }, { ...vert(-sy), away: 1 }];
  }
  // Greedy placement: each label takes its first spot that clears every node and every label
  // placed before it, or else the spot with the least overlap.
  function placeLabels(items, obstacles) {
    const ctx = M.ctx || (M.ctx = document.createElement('canvas').getContext('2d'));
    ctx.font = `650 12.5px ${getComputedStyle(document.body).fontFamily}`;
    const taken = [], out = {};
    const hit = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    for (const it of items) {
      const { q, lines } = it;
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)), h = (lines.length - 1) * LH + 13;
      let best = null;
      for (const c of it.cands) {
        const x0 = c.anchor === 'start' ? c.x : c.anchor === 'end' ? c.x - w : -w / 2;
        const b = { x: q.x + x0 - 2, y: q.y + c.y0 - 11, w: w + 4, h: h + 1 };
        let cost = (b.x < 0 || b.y < 0 || b.x + b.w > M.W || b.y + b.h > M.H ? 1e5 : 0) + (c.away ? 80 : 0);
        for (const o of obstacles) if (o.key !== it.key) cost += hit(b, o);
        for (const o of taken) cost += hit(b, o);
        if (!best || cost < best.cost) best = { ...c, cost, b };
        if (!cost) break;
      }
      taken.push(best.b);
      out[it.key] = best;
    }
    return out;
  }
  function spotLabel(lines, c) {
    return `<text class="lbl" text-anchor="${c.anchor}" y="${c.y0.toFixed(1)}">${lines.map((l, i) => `<tspan x="${c.x.toFixed(1)}" dy="${i ? LH : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  }
  // Balanced Scorecard perspective names, written along the outside of the inner ring.
  function perspArcs() {
    const groups = [['fin', C.finNodes.map((f) => 'fin:' + f.id)], ...['cust', 'proc', 'learn', 'esg'].map((k) => [k, VL().filter((v) => v.persp === k).map((v) => 'var:' + v.id)])];
    const param = (q) => Math.atan2((q.y - M.cy) / M.iy, (q.x - M.cx) / M.ix);
    return groups.map(([key, ids]) => {
      const ts = ids.map((id) => param(M.pos[id]));
      for (let i = 1; i < ts.length; i++) while (ts[i] < ts[i - 1]) ts[i] += Math.PI * 2;
      const t1 = ts[0] - 0.16, t2 = ts[ts.length - 1] + 0.16, mid = (t1 + t2) / 2;
      const bottom = Math.sin(mid) > 0.3;
      const off = M.rK + (bottom ? 24 : 12), rx = M.ix + off, ry = M.iy + off;
      const pt = (t) => `${(M.cx + rx * Math.cos(t)).toFixed(1)},${(M.cy + ry * Math.sin(t)).toFixed(1)}`;
      const d = bottom ? `M${pt(t2)} A${rx.toFixed(1)},${ry.toFixed(1)} 0 0 0 ${pt(t1)}` : `M${pt(t1)} A${rx.toFixed(1)},${ry.toFixed(1)} 0 0 1 ${pt(t2)}`;
      return `<path id="pa-${key}" d="${d}" fill="none"/><text class="map-persp-label"><textPath href="#pa-${key}" startOffset="50%" text-anchor="middle">${esc(L(PERSP[key].name))}</textPath></text>`;
    }).join('');
  }

  function finValue(id) {
    const f = S.fin;
    if (id === 'f_revenue') return { v: moneyShort(f.last.revenue), sub: '/Q' };
    if (id === 'f_profit') return { v: moneyShort(f.last.ni), sub: pct(f.last.ni / f.last.revenue, 1) };
    if (id === 'f_price') return { v: nf(0).format(f.price), sub: U.lang === 'id' ? 'Rp' : 'IDR' };
    return { v: E.RATINGS[f.ratingIdx], sub: pct(f.last.rate, 1) };
  }

  function mapSvg() {
    const out = [];
    out.push(`<defs><marker id="ah-pos" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--pos)"/></marker><marker id="ah-neg" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--neg)"/></marker></defs>`);
    out.push(`<ellipse class="map-ring" cx="${M.cx}" cy="${M.cy}" rx="${M.ax.toFixed(1)}" ry="${M.ay.toFixed(1)}"/><ellipse class="map-ring inner" cx="${M.cx}" cy="${M.cy}" rx="${M.ix.toFixed(1)}" ry="${M.iy.toFixed(1)}"/>`);
    if (!M.small) out.push(perspArcs());
    const act = SL().filter((s) => S.sit[s.id].on);
    if (!act.length) {
      out.push(`<text class="center-q" style="font-size:${M.small ? 20 : 38}px" x="${M.cx}" y="${M.cy + 4}" text-anchor="middle">${S.status === 'playing' ? qLabel(curQ()) : qLabel(S.t)}</text><text class="center-note" x="${M.cx}" y="${M.cy + 24}" text-anchor="middle">${tr('noCrisis')}</text>`);
    }
    out.push('<g id="edges"></g>');
    // Policies.
    const polItems = PL().map((p) => ({ key: p.id, q: M.pos['pol:' + p.id], ...ringCands(M.pos['pol:' + p.id], M.rP, L(p.short)) }));
    const polLines = Object.fromEntries(polItems.map((it) => [it.key, it.lines]));
    const polLab = M.showPL ? placeLabels(polItems, PL().map((p) => { const q = M.pos['pol:' + p.id], r = M.rP + 3; return { key: p.id, x: q.x - r, y: q.y - r, w: r * 2, h: r * 2 }; })) : {};
    for (const p of PL()) {
      const q = M.pos['pol:' + p.id], st = S.pol[p.id], r = M.rP;
      const pLab = M.showPL ? spotLabel(polLines[p.id], polLab[p.id]) : '';
      out.push(`<g class="node pol ${st.on ? 'on' : 'off'} ${changed(p.id) ? 'changed' : ''}" data-key="pol:${p.id}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(L(p.name))}">
        <circle class="node-focus" r="${r + 6}"/>
        <circle class="disc" r="${r}" style="fill:var(--d-${p.dept})"/>
        ${st.on ? `<path class="ring-mark" d="${arcPath(r + 3.5, st.x)}" fill="none" stroke-width="2.2" style="stroke:${changed(p.id) ? 'var(--accent)' : 'var(--ink)'}"/>` : ''}
        ${icoG(iconName('pol', p.id), r * 1.08, 0, `var(--di-${p.dept})`)}${pLab}</g>`);
    }
    // KPI and financial-result labels are placed together so they never collide.
    const hist = S.hist.vars, items = [], obstacles = [];
    for (const f of C.finNodes) {
      const q = M.pos['fin:' + f.id];
      const lines = splitLabel(L(f.short), 8);
      items.push({ key: 'fin:' + f.id, q, lines, cands: innerCands(q, M.finH / 2, lines.length) });
      obstacles.push({ key: 'fin:' + f.id, x: q.x - M.finW / 2 - 2, y: q.y - M.finH / 2 - 2, w: M.finW + 4, h: M.finH + 4 });
    }
    for (const v of VL()) {
      const q = M.pos['var:' + v.id], d = hist.length > 1 ? S.vars[v.id] - hist[hist.length - 2][v.id] : 0;
      const lines = splitLabel(L(v.short), 10);
      if (Math.abs(d) >= 0.005) lines[lines.length - 1] += d > 0 ? ' ▲' : ' ▼';
      items.push({ key: 'var:' + v.id, q, lines, cands: innerCands(q, M.rK, lines.length) });
      obstacles.push({ key: 'var:' + v.id, x: q.x - M.rK - 2, y: q.y - M.rK - 2, w: M.rK * 2 + 4, h: M.rK * 2 + 4 });
    }
    for (const si of act) {
      const q = M.pos['sit:' + si.id], r = M.rS + 5;
      obstacles.push({ key: 'sit:' + si.id, x: q.x - r, y: q.y - r, w: r * 2, h: r * 2 + 30 });
    }
    const lab = M.showKL ? placeLabels(items, obstacles) : {};
    const linesOf = Object.fromEntries(items.map((it) => [it.key, it.lines]));
    // KPIs.
    for (const v of VL()) {
      const q = M.pos['var:' + v.id], r = M.rK, val = S.vars[v.id];
      out.push(`<g class="node kpi" data-key="var:${v.id}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(L(v.name))} ${nf(0).format(val * 100)}">
        <circle class="node-focus" r="${r + 5}"/><circle class="kpi-bg" r="${r}"/><circle class="kpi-track" r="${r - 4}"/>
        <path class="kpi-arc" d="${arcPath(r - 4, val)}"/>
        ${r >= 22 ? `${icoG(iconName('var', v.id), r * 0.62, -r * 0.3, 'var(--ink-2)')}<text class="val" text-anchor="middle" y="${(r * 0.5).toFixed(1)}" style="font-size:${(r * 0.52).toFixed(1)}px">${nf(0).format(val * 100)}</text>`
          : `<text class="val" text-anchor="middle" dy="0.35em" style="font-size:${r < 14 ? 9.5 : 12}px">${nf(0).format(val * 100)}</text>`}
        ${M.showKL ? spotLabel(linesOf['var:' + v.id], lab['var:' + v.id]) : ''}</g>`);
    }
    // Financial results.
    for (const f of C.finNodes) {
      const q = M.pos['fin:' + f.id], r = M.rK, fv = finValue(f.id);
      const w = M.finW, h = M.finH;
      out.push(`<g class="node fin" data-key="fin:${f.id}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(L(f.name))} ${esc(fv.v)}">
        <rect class="node-focus" x="${-w / 2 - 5}" y="${-h / 2 - 5}" width="${w + 10}" height="${h + 10}" rx="10"/>
        <rect class="fin-bg" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="7"/>
        <text class="val" text-anchor="middle" y="${r < 14 ? 3 : r < 22 ? 1 : 0}" style="font-size:${r < 14 ? 9 : r < 22 ? 11.5 : 14}px">${esc(fv.v)}</text>
        ${r >= 14 ? `<text class="sub" text-anchor="middle" y="${r < 22 ? 12 : 15}">${esc(fv.sub)}</text>` : ''}
        ${M.showKL ? spotLabel(linesOf['fin:' + f.id], lab['fin:' + f.id]) : ''}</g>`);
    }
    // Situations.
    for (const si of act) {
      const q = M.pos['sit:' + si.id], r = M.rS, bad = si.kind === 'bad';
      out.push(`<g class="node sit" data-key="sit:${si.id}" transform="translate(${q.x.toFixed(1)},${q.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(L(si.name))}">
        <circle class="node-focus" r="${r + 7}"/><circle class="sit-halo ${bad ? 'bad' : 'good'}" r="${r + 5}"/>
        <circle class="${bad ? 'sit-bad' : 'sit-good'}" r="${r}"/>${icoG(iconName('sit', si.id), r * 1.05, 0, '#ffffff')}
        ${M.showKL ? labelSvg(splitLabel(L(si.short || si.name), 14), r + 14) : ''}</g>`);
    }
    return `<svg width="${M.W}" height="${M.H}" viewBox="0 0 ${M.W} ${M.H}"><title>${tr('tabMap')}</title>${out.join('')}</svg><div class="tip" id="tip" hidden></div><div class="theory-card" id="theory" hidden></div>`;
  }
  function mountMap() {
    const box = document.getElementById('mapbox');
    if (!box) return;
    const draw = () => {
      const r = box.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return;
      computeLayout(Math.round(r.width), Math.round(r.height));
      box.innerHTML = mapSvg();
      if (U.hover) applyHover(U.hover);
    };
    draw();
    if (M.ro) M.ro.disconnect();
    if (window.ResizeObserver) {
      let raf = 0;
      M.ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const r = box.getBoundingClientRect(); if (Math.round(r.width) !== M.W || Math.round(r.height) !== M.H) draw(); }); });
      M.ro.observe(box);
    }
  }

  // Cause-and-effect links for the hovered node. sign: +1 raises, −1 lowers.
  const FSIG = { 'f:profit': 'fin:f_profit', 'f:rating': 'fin:f_rating', 'f:tsr': 'fin:f_price', 'f:growth': 'fin:f_revenue', 'f:cash': 'fin:f_rating' };
  function keyOf(id) {
    if (FSIG[id]) return FSIG[id];
    if (V(id)) return 'var:' + id;
    if (P(id)) return 'pol:' + id;
    if (FIN[id]) return 'fin:' + id;
    if (E.SIT[id]) return 'sit:' + id;
    return null;
  }
  function relations(key) {
    const [type, id] = key.split(':');
    const out = [];
    const add = (a, b, c, potential = false) => { if (a && b && M.pos[a] && M.pos[b] && Math.abs(c) > 1e-6) out.push({ a, b, sign: Math.sign(c), w: Math.abs(c), potential }); };
    const polFin = (p, k, potential) => {
      if (p.cost) add(k, 'fin:f_profit', -p.cost * 3, potential);
      if (p.id === 'pricing' || p.id === 'expansion') add(k, 'fin:f_revenue', 0.15, potential);
      if (p.id === 'dividend') add(k, 'fin:f_rating', -0.06, potential);
      if (p.id === 'buyback') { add(k, 'fin:f_price', 0.08, potential); add(k, 'fin:f_rating', -0.06, potential); }
      if (p.id === 'debtpay') add(k, 'fin:f_rating', 0.08, potential);
    };
    const sitIn = (si) => si.inputs.forEach(([sid, w, mode]) => add(keyOf(sid), 'sit:' + si.id, (mode === 'inv' ? -1 : 1) * w * 0.04));
    const sitOut = (si) => {
      (si.fx || []).forEach(([v, c]) => add('sit:' + si.id, 'var:' + v, c));
      const f = si.fin || {};
      if (f.revMult) add('sit:' + si.id, 'fin:f_revenue', f.revMult * 2);
      if (f.cogsAdd) add('sit:' + si.id, 'fin:f_profit', -f.cogsAdd * 3);
      if (f.cost) add('sit:' + si.id, 'fin:f_profit', -f.cost * 3);
      if (f.interestAdd) add('sit:' + si.id, 'fin:f_profit', -f.interestAdd * 3);
      if (f.psAdd) add('sit:' + si.id, 'fin:f_price', f.psAdd * 0.4);
    };
    const activeSits = SL().filter((s) => S.sit[s.id].on);
    if (type === 'pol') {
      const p = P(id), off = !S.pol[id].on;
      p.fx.forEach(([v, c]) => add(key, 'var:' + v, c, off));
      polFin(p, key, off);
      activeSits.forEach((si) => si.inputs.forEach(([sid, w, mode]) => { if (sid === id) add(key, 'sit:' + si.id, (mode === 'inv' ? -1 : 1) * w * 0.04); }));
    } else if (type === 'var') {
      for (const p of PL()) for (const [v, c] of p.fx) if (v === id) add('pol:' + p.id, key, c, !S.pol[p.id].on);
      for (const v of VL()) for (const [t, c] of v.fx || []) { if (t === id) add('var:' + v.id, key, c); if (v.id === id) add(key, 'var:' + t, c); }
      for (const f of C.finNodes) for (const [s, c] of f.links) if (s === id) add(key, 'fin:' + f.id, c * 0.1);
      activeSits.forEach((si) => { (si.fx || []).forEach(([v, c]) => { if (v === id) add('sit:' + si.id, key, c); }); si.inputs.forEach(([sid, w, mode]) => { if (sid === id) add(key, 'sit:' + si.id, (mode === 'inv' ? -1 : 1) * w * 0.04); }); });
    } else if (type === 'fin') {
      for (const [s, c] of FIN[id].links) add(keyOf(s), key, c * 0.1);
      for (const f of C.finNodes) for (const [s, c] of f.links) if (s === id) add(key, 'fin:' + f.id, c * 0.1);
      if (id === 'f_profit') for (const p of PL()) if (S.pol[p.id].on || (p.cost < 0 && S.pol[p.id].eff > 0)) { if (p.cost) add('pol:' + p.id, key, -p.cost * 3); }
      activeSits.forEach((si) => { sitOut(si); });
      for (let i = out.length - 1; i >= 0; i--) if (out[i].a !== key && out[i].b !== key) out.splice(i, 1);
    } else if (type === 'sit') {
      const si = E.SIT[id];
      sitIn(si);
      sitOut(si);
    }
    return out;
  }

  function edgePath(a, b) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const qx = mx + (M.cx - mx) * 0.3, qy = my + (M.cy - my) * 0.3;
    const trim = (p, toward, r) => { const dx = toward.x - p.x, dy = toward.y - p.y, d = Math.hypot(dx, dy) || 1; return { x: p.x + (dx / d) * r, y: p.y + (dy / d) * r }; };
    const s = trim(a, { x: qx, y: qy }, a.r + 2), e = trim(b, { x: qx, y: qy }, b.r + (b.type === 'fin' ? b.r * 0.2 + 6 : 6));
    return `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
  }

  function applyHover(key) {
    const box = document.getElementById('mapbox');
    if (!box) return;
    const svg = box.querySelector('svg');
    if (!svg || !M.pos[key]) return;
    const rel = relations(key);
    const maxW = Math.max(0.05, ...rel.map((r) => r.w));
    const edges = rel.map((r) => `<path class="edge ${r.sign > 0 ? 'pos' : 'neg'} ${r.potential ? 'potential' : 'flow'}" stroke-width="${(1.2 + 3.2 * (r.w / maxW)).toFixed(2)}" marker-end="url(#ah-${r.sign > 0 ? 'pos' : 'neg'})" d="${edgePath(M.pos[r.a], M.pos[r.b])}"/>`).join('');
    svg.querySelector('#edges').innerHTML = edges;
    const related = new Set([key]);
    rel.forEach((r) => { related.add(r.a); related.add(r.b); });
    box.classList.add('focus');
    svg.querySelectorAll('.node').forEach((n) => {
      const k = n.getAttribute('data-key');
      n.classList.toggle('hl', related.has(k));
      n.classList.toggle('self', k === key);
    });
    showTip(key);
    showTheories(rel);
    previewReactions(key);
  }
  // Up to three theories behind the strongest arrows of the hovered node.
  function showTheories(rel) {
    const card = document.getElementById('theory');
    if (!card) return;
    const seen = new Set(), items = [];
    for (const r of rel.slice().sort((a, b) => (a.potential - b.potential) || (b.w - a.w))) {
      const th = theoryOf(r.a.split(':')[1], r.b.split(':')[1]);
      if (!th || seen.has(th)) continue;
      seen.add(th);
      items.push(`<div class="th-item"><span class="th-link">${esc(nameOf(r.a.split(':')[1], true))} → ${esc(nameOf(r.b.split(':')[1], true))}</span><b>${esc(L(th.name))}</b><span>${esc(L(th.text))}</span></div>`);
      if (items.length >= 3) break;
    }
    card.hidden = !items.length;
    card.innerHTML = items.length ? `<div class="th-head">${ico('book-open')}<span>${tr('theoryTitle')}</span></div>${items.join('')}` : '';
  }
  function clearHover() {
    U.hover = null;
    const box = document.getElementById('mapbox');
    if (box) {
      box.classList.remove('focus');
      const e = box.querySelector('#edges');
      if (e) e.innerHTML = '';
      const tip = box.querySelector('#tip');
      if (tip) tip.hidden = true;
      const th = box.querySelector('#theory');
      if (th) th.hidden = true;
    }
    previewReactions(null);
  }
  function showTip(key) {
    const tip = document.getElementById('tip'), q = M.pos[key];
    if (!tip || !q) return;
    const [type, id] = key.split(':');
    let title = '', line = '';
    if (type === 'pol') { const p = P(id), st = S.pol[id]; title = L(p.name); line = st.on ? policyLabel(p, st.x) : tr('inactive'); }
    if (type === 'var') { const v = V(id); title = L(v.name); line = `${kpiValueText(id)} · ${tr('heading', nf(0).format(E.explainVar(S, id).target * 100))}`; }
    if (type === 'fin') { title = L(FIN[id].name); line = finValue(id).v; }
    if (type === 'sit') { const si = E.SIT[id]; title = L(si.name); line = L(si.desc); }
    tip.innerHTML = `<b>${esc(title)}</b><span class="num">${esc(line)}</span><br><span style="opacity:.7">${tr('clickDetail')}</span>`;
    tip.hidden = false;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = q.x - tw / 2, y = q.y - q.r - th - 10;
    if (y < 4) y = q.y + q.r + 26;
    x = clamp(x, 4, M.W - tw - 4);
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  const strength = (c) => (c > 0 ? '▲' : '▼').repeat(Math.abs(c) >= 0.2 ? 3 : Math.abs(c) >= 0.08 ? 2 : 1);
  // While a policy is hovered, the stakeholder list shows who would cheer or object.
  function previewReactions(key) {
    const note = document.getElementById('react-note');
    document.querySelectorAll('.react').forEach((el) => { el.textContent = ''; el.className = 'react'; });
    if (!note) return;
    if (!key || !key.startsWith('pol:')) { note.textContent = tr(canHover() ? 'hoverHint' : 'tapHint'); return; }
    const p = P(key.slice(4));
    note.textContent = tr('reactOf', L(p.name));
    for (const [g, c] of p.gx) {
      const el = document.querySelector(`.react[data-g="${g}"]`);
      if (!el) continue;
      el.textContent = strength(c);
      el.className = 'react ' + (c > 0 ? 'pos' : 'neg');
    }
  }

  /* --------------------------------------------------------------- modals */

  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);

  // Detail dialogs opened from another dialog stack on top of it and return to it on close.
  function openModal(m, stack) {
    if (stack && U.modal) U.stack.push(U.modal);
    else U.stack = [];
    if (m.type === 'pol') {
      const st = S.pol[m.id], p = P(m.id);
      m.draft = { x: st.on ? st.x : p.x0 || 0.5 };
    }
    U.modal = m;
    renderModal(true);
  }
  function closeModal() {
    const m = U.modal;
    if (!m) return;
    if (m.type === 'case' && !m.done) return; // a case needs an answer
    if (U.stack.length) { U.modal = U.stack.pop(); renderModal(true); return; }
    if (m.type === 'report' || m.type === 'rups' || (m.type === 'case' && m.done)) { advanceQueue(); render(); return; }
    U.modal = null;
    renderModal();
    if (m.focus) { const el = document.querySelector(m.focus); if (el) el.focus(); }
  }
  function renderModal(focusFirst) {
    if (!U.modal) { modalRoot.innerHTML = ''; return; }
    const m = U.modal;
    const html = {
      pol: modalPolicy, var: modalVar, fin: modalFin, sit: modalSit, grp: modalGroup, report: modalReport, rups: modalRups,
      case: modalCase, end: modalEnd, help: modalHelp, confirm: modalConfirm, prolog: modalProlog,
    }[m.type](m);
    const closable = !(m.type === 'case' && !m.done);
    modalRoot.innerHTML = `<div class="scrim" data-act="scrim"><div class="modal ${m.type === 'end' || m.type === 'help' ? 'wide' : m.type === 'confirm' ? 'narrow' : ''} m-${m.type}" role="dialog" aria-modal="true" aria-labelledby="m-title">${html}</div></div>`;
    modalRoot.querySelector('.scrim').dataset.closable = closable ? '1' : '';
    if (focusFirst) {
      const el = modalRoot.querySelector('[data-autofocus]') || modalRoot.querySelector('.m-foot .btn.primary') || modalRoot.querySelector('button');
      if (el) el.focus({ preventScroll: true });
    }
  }
  const head = (eyebrow, title, closeBtn = true, dot) => `<div class="m-head"><div><div class="eyebrow">${dot ? `<i style="background:${dot}"></i>` : ''}${eyebrow}</div><h2 id="m-title">${title}</h2></div>${closeBtn ? `<button class="close-x" data-act="close" aria-label="${tr('close')}">×</button>` : ''}</div>`;

  function fxRow(name, val, max, right, act, note = '') {
    const w = clamp(Math.abs(val) / (max || 1), 0, 1) * 50;
    const bar = `<span class="fx-bar"><span class="c"></span><i style="${val >= 0 ? `left:50%;width:${w}%` : `right:50%;width:${w}%`};background:${val >= 0 ? 'var(--pos)' : 'var(--neg)'}"></i></span>`;
    const tag = act ? 'button' : 'div';
    const row = `<${tag} class="fx" ${act || ''}><span class="fx-n">${name}</span>${bar}<span class="fx-v ${signCls(val)}">${right}</span></${tag}>`;
    return note ? `<div class="fx-wrap">${row}${note}</div>` : row;
  }

  function modalPolicy(m) {
    const p = P(m.id), st = S.pol[m.id], d = m.draft, dept = DEPT[p.dept];
    const sp = speedInfo(p.speed);
    const bip = p.kind === 'bipolar';
    const minX = bip ? 0 : 0.1;
    const status = p.core ? `<span class="status on">${tr('core')}</span>` : `<span class="status ${st.on ? 'on' : ''}">${st.on ? tr('active') : tr('inactive')}</span>`;
    const chg = changed(m.id) ? `<span class="status chg">${tr('changedThisQ')}</span>` : '';
    const mag = (c) => (bip ? c * (2 * d.x - 1) : c * d.x);
    const curMag = (c) => (bip ? c * (2 * st.eff - 1) : c * st.eff);
    const maxFx = Math.max(0.05, ...p.fx.map(([, c]) => Math.abs(c)));
    const fxRows = p.fx.map(([v, c]) => fxRow(`${esc(L(V(v).name))}`, c, maxFx,
      st.on || bip ? `${pts(curMag(c))} <small class="muted">${tr('nowContrib')}</small>` : `${pts(mag(c))} <small class="muted">${tr('potential')}</small>`,
      `data-act="detail" data-type="var" data-id="${v}"`, theoryNote(theoryOf(p.id, v)))).join('');
    const finTh = C.finNodes.map((f) => theoryOf(p.id, f.id)).filter(Boolean).map(theoryNote).join('');
    const maxGx = Math.max(0.05, ...p.gx.map(([, c]) => Math.abs(c)));
    const gxRows = p.gx.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([g, c]) => fxRow(esc(L(G(g).name)), c, maxGx,
      strength(c), `data-act="detail" data-type="grp" data-id="${g}"`)).join('');
    const vol = E.volume(S);
    const extra = [];
    if (p.capex) extra.push(`<span>${tr('capexOnce')}: <b>${money(p.capex * vol * Math.max(0, d.x - (S.polStart[m.id].on ? S.polStart[m.id].x : 0)))}</b></span>`);
    if (p.id === 'layoffs') extra.push(`<span>${tr('severanceOnce')}: <b>${money(0.06 * vol * Math.max(0, d.x - (S.polStart[m.id].on ? S.polStart[m.id].x : 0)))}</b></span>`);
    const elastic = p.id === 'pricing' ? `<span>${tr('elasticity', nf(2).format(E.elasticity(S)))}</span>` : '';
    return `${head(`${esc(L(dept.name))}`, `<span class="h-ico" style="background:var(--d-${p.dept});color:var(--di-${p.dept})">${ico(iconName('pol', p.id))}</span>${esc(L(p.name))}`, true, `var(--d-${p.dept})`)}
      <div class="m-body">
        <div style="display:flex;gap:8px;flex-wrap:wrap">${status}${chg}<span class="status">${sp.label} · ${sp.note}</span></div>
        <p class="lead">${esc(L(p.desc))}</p>
        <div class="control">
          <div class="control-top"><span class="eyebrow">${tr('intensity')}</span><span class="control-val" id="pv-label">${esc(policyLabel(p, d.x))}</span></div>
          <input class="range" id="pv-range" type="range" min="${minX}" max="1" step="0.05" value="${d.x}" aria-label="${tr('intensity')}">
          ${bip ? `<div class="range-ends"><span>${esc(L(p.lo))}</span><span>${esc(L(p.hi))}</span></div>` : ''}
          <div class="costline" id="pv-cost">${costLine(p, d)}${extra.join('')}${elastic}</div>
        </div>
        ${bip ? `<p class="muted" style="font-size:12.5px">${tr('bipolarNote', esc(L(p.hi)))}</p>` : ''}
        <div class="two">
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('effectsOnKpi')}</h3><div class="fx-list">${fxRows || `<span class="muted">${tr('noneActive')}</span>`}${finTh}</div></div>
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('effectsOnGroups')}</h3><div class="fx-list">${gxRows}</div></div>
        </div>
      </div>
      <div class="m-foot" id="pv-foot">${policyFoot(p, st, d)}</div>`;
  }
  function costLine(p, d) {
    const vol = E.volume(S);
    const parts = [];
    if (p.cost > 0 && !(p.kind === 'bipolar')) parts.push(`<span>${tr('costPerQ')}: <b>${money(p.cost * d.x * vol)}</b></span>`);
    if (p.kind === 'bipolar' && p.cost) parts.push(`<span>${tr('costPerQ')}: <b class="${signCls(-p.cost * (2 * d.x - 1))}">${money(p.cost * (2 * d.x - 1) * vol)}</b></span>`);
    if (p.cost < 0) parts.push(`<span>${tr('savingPerQ')}: <b class="pos">${money(-p.cost * d.x * vol)}</b></span>`);
    return parts.join('');
  }
  function policyFoot(p, st, d) {
    if (S.status !== 'playing') return `<button class="btn" data-act="close">${tr('close')}</button>`;
    const othersLeft = E.capitalLeft(S) + E.changeCost(S, p.id);
    const costApply = E.changeCost(S, p.id, true, d.x);
    const costCancel = E.changeCost(S, p.id, false, st.x);
    const differs = !st.on || Math.abs(d.x - st.x) > 1e-3;
    const btns = [];
    if (changed(p.id)) btns.push(`<button class="btn ghost" data-act="pol-revert">${tr('revert')}</button>`);
    if (st.on && !p.core) btns.push(`<button class="btn danger" data-act="pol-cancel" ${costCancel > othersLeft ? 'disabled' : ''}>${tr('cancelPolicy')} · ${costCancel}</button>`);
    btns.push(`<button class="btn primary" data-act="pol-apply" ${!differs || costApply > othersLeft ? 'disabled' : ''}>${st.on ? tr('apply') : tr('introduce')} · ${costApply}</button>`);
    const short = costApply > othersLeft && differs;
    return `<div class="left">${tr('capCost')}: <b class="mono">${costApply}</b> · ${tr('capLeft', othersLeft)}${short ? ` · <span class="neg">${tr('notEnough')}</span>` : ''}</div>${btns.join('')}`;
  }
  function updatePolicyModal() {
    const m = U.modal;
    if (!m || m.type !== 'pol') return;
    const p = P(m.id), st = S.pol[m.id], d = m.draft;
    const lab = document.getElementById('pv-label'), cost = document.getElementById('pv-cost'), foot = document.getElementById('pv-foot');
    if (lab) lab.textContent = policyLabel(p, d.x);
    if (cost) {
      const vol = E.volume(S), x0 = S.polStart[m.id].on ? S.polStart[m.id].x : 0;
      const extra = [];
      if (p.capex) extra.push(`<span>${tr('capexOnce')}: <b>${money(p.capex * vol * Math.max(0, d.x - x0))}</b></span>`);
      if (p.id === 'layoffs') extra.push(`<span>${tr('severanceOnce')}: <b>${money(0.06 * vol * Math.max(0, d.x - x0))}</b></span>`);
      cost.innerHTML = costLine(p, d) + extra.join('') + (p.id === 'pricing' ? `<span>${tr('elasticity', nf(2).format(E.elasticity(S)))}</span>` : '');
    }
    if (foot) foot.innerHTML = policyFoot(p, st, d);
  }

  function explainRows(parts, max, target) {
    return parts.map((pt) => {
      let name;
      if (pt.kind === 'base') name = tr('explBase');
      else if (pt.kind === 'struct') name = tr('explStruct');
      else if (pt.kind === 'flag') name = L(E.MEV[pt.ref].name);
      else name = nameOf(pt.ref);
      const act = pt.kind === 'pol' ? `data-act="detail" data-type="pol" data-id="${pt.ref}"` : pt.kind === 'var' ? `data-act="detail" data-type="var" data-id="${pt.ref}"`
        : pt.kind === 'sit' ? `data-act="detail" data-type="sit" data-id="${pt.ref}"` : pt.kind === 'in' && keyOf(pt.ref) && !pt.ref.startsWith('f:') ? `data-act="detail" data-type="${keyOf(pt.ref).split(':')[0]}" data-id="${pt.ref}"` : '';
      const val = pt.kind === 'base' ? `<span class="muted">${nf(0).format(pt.val * 100)}</span>` : `${pts(pt.val)}`;
      return pt.kind === 'base'
        ? `<div class="fx"><span class="fx-n muted">${esc(name)}</span><span></span><span class="fx-v muted">${nf(0).format(pt.val * 100)}</span></div>`
        : fxRow(esc(name), pt.val, max, val, act, (pt.kind === 'pol' || pt.kind === 'var') && target ? theoryNote(theoryOf(pt.ref, target)) : '');
    }).join('');
  }

  function modalVar(m) {
    const v = V(m.id), val = S.vars[m.id];
    const ex = E.explainVar(S, m.id);
    const parts = ex.parts.slice().sort((a, b) => (a.kind === 'base' ? -1 : b.kind === 'base' ? 1 : Math.abs(b.val) - Math.abs(a.val)));
    const max = Math.max(0.03, ...parts.filter((p) => p.kind !== 'base').map((p) => Math.abs(p.val)));
    const hist = S.hist.vars.map((h, i) => ({ v: h[m.id] * 100, label: i === 0 ? (U.lang === 'id' ? 'Awal' : 'Start') : qLabel(i).replace(' 20', "'") }));
    const outs = [];
    for (const [t, c] of v.fx || []) outs.push(fxRow(esc(L(V(t).name)), c, 0.25, pts(c * (2 * val - 1)), `data-act="detail" data-type="var" data-id="${t}"`, theoryNote(theoryOf(m.id, t))));
    for (const g of GL()) for (const [sid, c] of g.inputs) if (sid === m.id) outs.push(fxRow(esc(L(g.name)), c, 0.25, pts(c * (2 * val - 1)), `data-act="detail" data-type="grp" data-id="${g.id}"`));
    for (const f of C.finNodes) for (const [sid] of f.links) if (sid === m.id) outs.push(fxRow(esc(L(f.name)), 0.1, 0.25, '▲', `data-act="detail" data-type="fin" data-id="${f.id}"`, theoryNote(theoryOf(m.id, f.id))));
    for (const si of SL()) for (const [sid, w, mode] of si.inputs) if (sid === m.id) outs.push(fxRow(`${esc(L(si.name))} <small>${si.kind === 'bad' ? tr('crisis') : tr('opportunity')}</small>`, mode === 'inv' ? -0.1 : 0.1, 0.25, mode === 'inv' ? '▼' : '▲', `data-act="detail" data-type="sit" data-id="${si.id}"`));
    const extra = m.id === 'share' ? `<span class="mono muted">${tr('marketShareActual', pct(val * E.SHARE_SCALE, 1))}</span>` : '';
    const elastic = m.id === 'share' ? `<p class="muted" style="font-size:12.5px">${tr('elasticity', nf(2).format(E.elasticity(S)))}</p>` : '';
    return `${head(esc(L(PERSP[v.persp].name)), `<span class="h-ico plain">${ico(iconName('var', v.id))}</span>${esc(L(v.name))}`)}
      <div class="m-body">
        <div class="kv-row"><div><span class="big-v">${nf(0).format(val * 100)}</span></div><div><span class="eyebrow">${tr('heading', '')}</span><span class="mono ${signCls(ex.target - val, 0.004)}">${nf(0).format(ex.target * 100)} ${arrow(ex.target - val, 0.004)}</span></div>${extra}</div>
        <p class="lead">${esc(L(v.desc))}</p>${elastic}
        <div class="chart"><h4>${tr('history')}</h4>${chartSvg(hist, { w: 680, h: 140, fmt: (x) => nf(0).format(x), tick: (x) => nf(0).format(x), lo: 0, hi: 100, title: L(v.name) })}</div>
        <div class="two">
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('drivers')}</h3><div class="fx-list">${explainRows(parts, max, m.id)}</div></div>
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('influences')}</h3><div class="fx-list">${outs.join('')}</div></div>
        </div>
      </div>`;
  }

  function modalFin(m) {
    const f = FIN[m.id], fin = S.fin, pl = fin.last;
    let body = '';
    if (m.id === 'f_revenue') {
      body = `<div class="stat-grid">
        <div class="stat"><span class="eyebrow">${tr('marketSize')}</span><span class="v">${money(fin.M)}</span></div>
        <div class="stat"><span class="eyebrow">${tr('marketShare')}</span><span class="v">${pct(S.vars.share * E.SHARE_SCALE, 1)}</span></div>
        <div class="stat"><span class="eyebrow">${tr('priceVsMarket')}</span><span class="v">${spct(pl.priceFactor - 1, 1)}</span></div>
        <div class="stat"><span class="eyebrow">YoY</span><span class="v ${signCls(fin.yoy)}">${spct(fin.yoy, 1)}</span></div></div>
        <div class="chart"><h4>${tr('chartRev')}</h4>${chartSvg(histPoints('rev'), { w: 680, h: 150, kind: 'bar', fmt: money, tick: moneyShort, title: tr('chartRev') })}</div>`;
    } else if (m.id === 'f_profit') {
      body = `<div class="chart"><h4>${tr('chartNi')}</h4>${chartSvg(histPoints('ni'), { w: 680, h: 150, kind: 'bar', fmt: money, tick: moneyShort, title: tr('chartNi') })}</div>
        <div class="block"><h3>${tr('plTitle')}</h3>${plTable()}</div>`;
    } else if (m.id === 'f_price') {
      const ps = Math.exp(fin.logPS);
      body = `<div class="stat-grid">
        <div class="stat"><span class="eyebrow">${tr('sharePrice')}</span><span class="v">${priceStr(fin.price)}</span></div>
        <div class="stat"><span class="eyebrow">${tr('mcap')}</span><span class="v">${money(fin.mcap)}</span></div>
        <div class="stat"><span class="eyebrow">${tr('psMultiple')}</span><span class="v">${nf(2).format(ps)}×</span></div>
        <div class="stat"><span class="eyebrow">${tr('tsr')}</span><span class="v ${signCls(E.tsr(S))}">${spct(E.tsr(S), 0)}</span></div></div>
        <div class="chart"><h4>${tr('chartPrice')}</h4>${chartSvg(histPoints('price'), { w: 680, h: 150, fmt: priceStr, tick: (v) => nf(0).format(v), title: tr('chartPrice') })}</div>`;
    } else {
      const th = [['AAA', '< 1,25×'], ['AA', '< 2×'], ['A', '< 3×'], ['BBB', '< 4×'], ['BB', '< 5×'], ['B', '< 6,5×'], ['CCC', '≥ 6,5×']];
      body = `<div class="stat-grid">
        <div class="stat"><span class="eyebrow">${tr('ratingS')}</span><span class="v">${E.RATINGS[fin.ratingIdx]}</span></div>
        <div class="stat"><span class="eyebrow">${tr('interestRate')}</span><span class="v">${pct(pl.rate, 1)}</span></div>
        <div class="stat"><span class="eyebrow">${tr('netDebtEbitda')}</span><span class="v">${fin.netDebtEbitda != null ? nf(1).format(fin.netDebtEbitda) + '×' : '—'}</span></div>
        <div class="stat"><span class="eyebrow">${tr('cash')} / ${tr('debt')}</span><span class="v">${money(fin.cash)} / ${money(fin.debt)}</span></div></div>
        <div class="block"><h3>${tr('ratingTable')}</h3><div class="tbl-wrap"><table class="tbl"><tr>${th.map(([r]) => `<th>${r}</th>`).join('')}</tr><tr>${th.map(([r, v]) => `<td class="mono ${E.RATINGS[fin.ratingIdx] === r ? 'pos' : ''}">${U.lang === 'en' ? v.replace(',', '.') : v}</td>`).join('')}</tr></table></div>
        <p class="muted" style="font-size:12.5px;margin-top:8px">${tr('runwayNote')}</p></div>`;
    }
    const links = [...f.links.map(([sid]) => [sid, m.id]), ...C.finNodes.filter((x) => x.links.some(([sid]) => sid === m.id)).map((x) => [m.id, x.id])];
    const why = links.map(([a, b]) => ({ a, b, th: theoryOf(a, b) })).filter((x) => x.th)
      .map((x) => `<div class="th-item"><span class="th-link">${esc(nameOf(x.a, true))} → ${esc(nameOf(x.b, true))}</span><b>${esc(L(x.th.name))}</b><span>${esc(L(x.th.text))}</span></div>`).join('');
    return `${head(esc(L(PERSP.fin.name)), `<span class="h-ico plain">${ico(iconName('fin', m.id))}</span>${esc(L(f.name))}`)}<div class="m-body"><p class="lead">${esc(L(f.desc))}</p>${body}
      ${why ? `<div class="block"><h3>${tr('whyLinked')}</h3><div class="th-list">${why}</div></div>` : ''}</div>`;
  }

  function modalSit(m) {
    const si = E.SIT[m.id], st = S.sit[m.id], bad = si.kind === 'bad';
    const sc = E.sitScore(S, m.id), on = E.sitOn(si), off = E.sitOff(si);
    const wsum = si.inputs.reduce((a, [, w]) => a + w, 0);
    const causes = si.inputs.map(([sid, w, mode]) => {
      let v = E.src(S, sid);
      if (mode === 'inv') v = 1 - v;
      const k = keyOf(sid);
      const act = k && !sid.startsWith('f:') ? `data-act="detail" data-type="${k.split(':')[0]}" data-id="${sid}"` : '';
      return fxRow(`${esc(nameOf(sid))} <small>${mode === 'inv' ? (U.lang === 'id' ? '(rendah = risiko)' : '(low = risk)') : ''}</small>`, (bad ? 1 : 1) * v * w / wsum, 0.5, pct(v * w / wsum, 0), act);
    }).join('');
    const effects = [];
    (si.fx || []).forEach(([v, c]) => effects.push(fxRow(esc(L(V(v).name)), c, 0.2, pts(c), `data-act="detail" data-type="var" data-id="${v}"`)));
    (si.gx || []).forEach(([g, c]) => effects.push(fxRow(esc(L(G(g).name)), c, 0.2, pts(c), `data-act="detail" data-type="grp" data-id="${g}"`)));
    const f = si.fin || {};
    if (f.revMult) effects.push(fxRow(tr('finRev', spct(f.revMult, 0)), f.revMult, 0.1, spct(f.revMult, 0)));
    if (f.cogsAdd) effects.push(fxRow(tr('finCogs', spct(f.cogsAdd, 1)), -f.cogsAdd, 0.1, spct(f.cogsAdd, 1)));
    if (f.cost) effects.push(fxRow(tr('finCost', pct(f.cost, 1)), -f.cost, 0.05, '−' + pct(f.cost, 1)));
    if (f.interestAdd) effects.push(fxRow(tr('finInterest', spct(f.interestAdd, 1)), -f.interestAdd, 0.05, spct(f.interestAdd, 1)));
    if (f.psAdd) effects.push(fxRow(tr('finPs', spct(f.psAdd, 0)), f.psAdd, 0.3, spct(f.psAdd, 0)));
    if (si.cap) effects.push(fxRow(tr('capPerQ', (si.cap > 0 ? '+' : '−') + Math.abs(si.cap)), si.cap / 10, 0.2, (si.cap > 0 ? '+' : '−') + Math.abs(si.cap)));
    const col = st.on ? (bad ? 'var(--neg)' : 'var(--pos)') : 'var(--ink-3)';
    return `${head(`<span class="tag ${bad ? 'bad' : 'good'}">${bad ? tr('crisis') : tr('opportunity')}</span>${st.on ? tr('activeSince', qLabel(Math.max(1, st.since || 1))) : tr('inactive')}`, esc(L(si.name)))}
      <div class="m-body">
        <p class="lead">${esc(L(si.desc))}</p>
        ${si.requires ? `<p class="muted" style="font-size:12.5px">${tr('requires', esc(L(P(si.requires).name)))}</p>` : ''}
        <div class="control"><div class="control-top"><span class="eyebrow">${tr('triggerLevel')}</span><span class="control-val">${pct(sc)}</span></div>
          <div class="meter-trig"><i style="width:${(sc * 100).toFixed(1)}%;background:${col}"></i><b style="left:${(on * 100).toFixed(1)}%"></b><em style="left:${(off * 100).toFixed(1)}%"></em></div>
          <span class="muted" style="font-size:12.5px">${tr('triggerNote', pct(on), pct(off))}</span></div>
        <div class="two">
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('causes')}</h3><div class="fx-list">${causes}</div></div>
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('effects')}</h3><div class="fx-list">${effects.join('')}</div></div>
        </div>
      </div>`;
  }

  function modalGroup(m) {
    const g = G(m.id), h = S.groups[m.id].h;
    const ex = E.explainGroup(S, m.id);
    const parts = ex.parts.slice().sort((a, b) => (a.kind === 'base' ? -1 : b.kind === 'base' ? 1 : Math.abs(b.val) - Math.abs(a.val)));
    const max = Math.max(0.03, ...parts.filter((p) => p.kind !== 'base').map((p) => Math.abs(p.val)));
    const share = E.votes(S).find((v) => v.id === m.id).share;
    const hist = S.hist.groups.map((x, i) => ({ v: x[m.id] * 100, label: i === 0 ? (U.lang === 'id' ? 'Awal' : 'Start') : qLabel(i).replace(' 20', "'") }));
    const cares = PL().flatMap((p) => p.gx.filter(([gid]) => gid === m.id).map(([, c]) => ({ p, c }))).sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
    const careRows = cares.map(({ p, c }) => fxRow(`${esc(L(p.name))} <small>${S.pol[p.id].on ? tr('active') : tr('inactive')}</small>`, c, 0.4, c > 0 ? tr('likes') : tr('dislikes'), `data-act="detail" data-type="pol" data-id="${p.id}"`)).join('');
    return `${head(tr('tabStake'), esc(L(g.name)))}
      <div class="m-body">
        <div class="kv-row"><div><span class="eyebrow">${tr('happiness')}</span><span class="big-v ${h < 0.35 ? 'neg' : ''}">${nf(0).format(h * 100)}</span></div><div><span class="eyebrow">${tr('weight')}</span><span class="mono">${pct(share, 1)}</span></div><div><span class="eyebrow">${tr('heading', '')}</span><span class="mono ${signCls(ex.target - h, 0.004)}">${nf(0).format(ex.target * 100)} ${arrow(ex.target - h, 0.004)}</span></div></div>
        <p class="lead">${esc(L(g.desc))}</p>
        <div class="chart"><h4>${tr('history')}</h4>${chartSvg(hist, { w: 680, h: 130, fmt: (x) => nf(0).format(x), tick: (x) => nf(0).format(x), lo: 0, hi: 100, threshold: 50, title: L(g.name) })}</div>
        <div class="two">
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('drivers')}</h3><div class="fx-list">${explainRows(parts, max)}</div></div>
          <div><h3 class="eyebrow" style="margin-bottom:8px">${tr('policiesTheyCare')}</h3><div class="fx-list">${careRows}</div></div>
        </div>
      </div>`;
  }

  function modalReport(m) {
    const rep = m.rep, b = rep.before, pl = S.fin.last;
    const prevPl = b.last;
    const dRev = pl.revenue / prevPl.revenue - 1, dPrice = S.fin.price / b.price - 1, dAp = rep.approval - b.approval;
    const rstat = (k, v, d, cls = '') => `<div class="rstat"><span class="eyebrow">${k}</span><span class="v ${cls}">${v}</span><span class="d">${d}</span></div>`;
    const news = rep.news.map((n) => { const x = newsText(n); return `<div class="news-item"><span class="q"><span class="tag ${x.tag}">${esc(x.label)}</span></span><span>${esc(x.text)}</span></div>`; }).join('');
    const sits = [...rep.started.map((id) => ({ id, s: 1 })), ...rep.ended.map((id) => ({ id, s: 0 }))].map(({ id, s }) => {
      const si = E.SIT[id], bad = si.kind === 'bad';
      return `<div class="news-item"><span class="q"><span class="tag ${s ? (bad ? 'bad' : 'good') : 'info'}">${s ? (bad ? tr('crisis') : tr('opportunity')) : (U.lang === 'id' ? 'Selesai' : 'Over')}</span></span><span><button class="btn ghost small" style="padding:0;min-height:0" data-act="detail" data-type="sit" data-id="${id}">${esc(L(si.name))}</button></span></div>`;
    }).join('');
    const vm = VL().map((v) => ({ n: L(v.name), d: S.vars[v.id] - b.vars[v.id], type: 'var', id: v.id }));
    const gm = GL().map((g) => ({ n: L(g.name), d: S.groups[g.id].h - b.groups[g.id], type: 'grp', id: g.id }));
    const movers = [...vm, ...gm].sort((a, b2) => Math.abs(b2.d) - Math.abs(a.d)).slice(0, 8).filter((x) => Math.abs(x.d) > 0.004);
    const maxM = Math.max(0.02, ...movers.map((x) => Math.abs(x.d)));
    const next = U.queue[0];
    const nextLabel = next === 'rups' ? tr('toRups') : next === 'case' ? tr('toCase') : next === 'end' ? tr('toEnd') : tr('startQ', qLabel(curQ()));
    const st = E.SCEN[S.scenario].story;
    const ch = st && S.status === 'playing' && rep.t < S.length ? ({ 4: ['y1', 2, 1], 8: ['y2', 3, 2] }[rep.t] || null) : null;
    const chapter = ch && st[ch[0]] ? `<div class="story-card big"><div class="story-head">${ico(E.SCEN[S.scenario].icon)}<span class="eyebrow">${tr('chapter', ch[1])} · ${tr('yearEnd', ch[2])}</span></div><p>${esc(L(st[ch[0]][rep.approval >= 0.55 ? 'good' : 'bad']))}</p></div>` : '';
    return `${head(tr('quarterOf', rep.t, S.length), tr('reportTitle', qLabel(rep.t)), false)}
      <div class="m-body">
        ${chapter}
        <div class="report-grid">
          ${rstat(tr('revenue'), money(pl.revenue), `<span class="${signCls(dRev)}">${spct(dRev, 1)}</span> ${tr('qoq')}`)}
          ${rstat(tr('netIncome'), money(pl.ni), `${tr('netMargin')} ${pct(pl.ni / pl.revenue, 1)}`, pl.ni < 0 ? 'neg' : '')}
          ${rstat(tr('ebitda'), money(pl.ebitda), `${tr('ebitdaMargin')} ${pct(pl.ebitda / pl.revenue, 1)}`, pl.ebitda < 0 ? 'neg' : '')}
          ${rstat(tr('sharePrice'), priceStr(S.fin.price), `<span class="${signCls(dPrice)}">${spct(dPrice, 1)}</span>`)}
          ${rstat(tr('confidence'), pct(rep.approval, 1), `<span class="${signCls(dAp, 0.001)}">${pts(dAp)} ${tr('points')}</span>`, rep.approval < 0.5 ? 'neg' : '')}
          ${rstat(tr('cash'), money(S.fin.cash), `${tr('ratingS')} ${E.RATINGS[S.fin.ratingIdx]}`)}
        </div>
        ${news ? `<div class="block"><h3>${tr('news')}</h3><div class="news">${news}</div></div>` : ''}
        ${sits ? `<div class="block"><h3>${tr('newSits')} / ${tr('endedSits')}</h3><div class="news">${sits}</div></div>` : ''}
        <div class="two">
          <div class="block"><h3>${tr('movers')}</h3><div class="fx-list">${movers.map((x) => fxRow(esc(x.n), x.d, maxM, pts(x.d), `data-act="detail" data-type="${x.type}" data-id="${x.id}"`)).join('') || `<span class="muted">—</span>`}</div></div>
          <div class="block"><h3>${tr('yourChanges')}</h3>${rep.changes.length ? `<ul class="changes">${rep.changes.map((c) => `<li>${esc(changeText(c))}</li>`).join('')}</ul>` : `<span class="muted">${tr('noChanges')}</span>`}
            <p class="mono" style="font-size:12px;margin-top:10px">${tr('capGain', rep.capitalGain, S.capital)}</p></div>
        </div>
      </div>
      <div class="m-foot"><button class="btn primary" data-act="next">${nextLabel} →</button></div>`;
  }

  function modalRups(m) {
    const r = m.rups;
    const rows = r.votes.slice().sort((a, b) => b.share - a.share).map((v) => `<div class="vote-row"><span>${esc(L(G(v.id).name))}</span><span class="num muted">${pct(v.share, 0)}</span>
      <span class="hbar"><i style="width:${(v.h * 100).toFixed(1)}%;background:${v.h < 0.5 ? 'var(--neg)' : 'var(--pos)'}"></i><span class="mid"></span></span><span class="num">${nf(1).format(v.contrib * 100)}</span></div>`).join('');
    const next = U.queue[0];
    return `${head(tr('nextRups'), tr('rupsTitle', r.year), false)}
      <div class="m-body">
        <div class="verdict ${r.pass ? 'pass' : 'fail'}"><span class="big-v ${r.pass ? 'pos' : 'neg'}">${pct(r.approval, 1)}</span><div><b style="font-size:17px">${r.pass ? tr('rupsPass') : tr('rupsFail')}</b><p class="muted">${r.pass ? tr('rupsPassD') : tr('rupsFailD')}</p></div></div>
        <div><div class="vote-row eyebrow"><span></span><span class="num">${tr('voteShare')}</span><span>${tr('happiness')}</span><span class="num">${tr('contrib')}</span></div>${rows}</div>
      </div>
      <div class="m-foot"><button class="btn primary" data-act="next">${next === 'case' ? tr('toCase') : next === 'end' ? tr('toEnd') : tr('startQ', qLabel(curQ()))} →</button></div>`;
  }

  function modalCase(m) {
    const d = E.DIL[m.id];
    const n = S.log.filter((e) => e.type === 'case').length + (m.done ? 0 : 1);
    if (m.done) {
      const opt = d.options[m.choice];
      return `${head(tr('caseOf', n, esc(L(d.concept))), esc(L(d.title)), false)}
        <div class="m-body">
          <p class="lead">${esc(L(d.text))}</p>
          <div class="opt" style="min-height:0"><span class="k">${U.lang === 'id' ? 'Pilihan Anda' : 'Your choice'}</span><b>${esc(L(opt.label))}</b></div>
          <div class="lesson"><span class="eyebrow">${tr('lesson')} · ${esc(L(d.concept))}</span><b>${esc(L(opt.lesson))}</b>${m.risk ? `<span class="muted" style="font-size:12.5px">${tr('riskLater')}</span>` : ''}</div>
        </div>
        <div class="m-foot"><button class="btn primary" data-act="next">${tr('startQ', qLabel(curQ()))} →</button></div>`;
    }
    return `${head(tr('caseOf', n, esc(L(d.concept))), esc(L(d.title)), false)}
      <div class="m-body">
        <p class="lead">${esc(L(d.text))}</p>
        <div class="options">${d.options.map((o, i) => `<button class="opt" data-act="choose" data-id="${i}" ${i === 0 ? 'data-autofocus' : ''}><span class="k">${String.fromCharCode(65 + i)}</span><b>${esc(L(o.label))}</b><span>${esc(L(o.hint))}</span></button>`).join('')}</div>
      </div>`;
  }

  function summaryText(fs) {
    const sc = E.SCEN[S.scenario];
    const reason = S.endReason === 'term' ? (U.lang === 'id' ? 'Menyelesaikan masa jabatan' : 'Completed the term')
      : S.endReason === 'bankrupt' ? 'PKPU' : (U.lang === 'id' ? `Diberhentikan di ${qLabel(S.t)}` : `Dismissed in ${qLabel(S.t)}`);
    return [
      `CEO Mandate · ${tr('classCode')} ${S.seed}`,
      `${L(sc.name)} (${sc.company}) · ${S.length} ${U.lang === 'id' ? 'kuartal' : 'quarters'}`,
      `${reason} · ${tr('score')} ${fs.total}/1000 (${fs.grade})`,
      `TSR ${spct(fs.tsr, 0)} · ${tr('ratingS')} ${E.RATINGS[S.fin.ratingIdx]} · ${tr('confidence')} ${pct(fs.approval)}`,
      `${tr('style')}: ${tr('style' + fs.style)}`,
      `${tr('sObj')}: ${fs.objectives.filter((o) => o.ok).length}/${fs.objectives.length}`,
    ].join('\n');
  }

  function modalEnd() {
    const fs = E.finalScore(S), sc = E.SCEN[S.scenario];
    const reason = S.endReason === 'term' ? tr('endTerm', S.length) : S.endReason === 'rups' ? tr('endRups', S.year0 + S.t / 4 - 1)
      : S.endReason === 'rupslb' ? tr('endRupslb', qLabel(S.t)) : tr('endBankrupt', qLabel(S.t));
    const bars = [['sFin', fs.parts.fin, 250], ['sCust', fs.parts.cust, 150], ['sProc', fs.parts.proc, 120], ['sLearn', fs.parts.learn, 120], ['sEsg', fs.parts.esg, 100], ['sStake', fs.parts.stake, 110], ['sObj', fs.parts.obj, 150]]
      .map(([k, v, max]) => `<div class="sbar"><span>${tr(k)}</span><span class="hbar"><i style="width:${(clamp(v / max) * 100).toFixed(1)}%"></i></span><span class="mono">${Math.round(v)}/${max}</span></div>`).join('');
    const H = E.helpers(S);
    H.money = money; H.pct = pct; H.signedPct = (v) => spct(v, 0);
    const objs = sc.objectives.map((o) => { const r = o.check(S, H); return `<div class="obj"><span class="ic ${r.ok ? 'ok' : ''}">${r.ok ? '✓' : ''}</span><span>${esc(L(o.text))}</span><span class="now">${esc(r.now)}</span></div>`; }).join('');
    const conf = S.hist.approval.map((v, i) => ({ v: v * 100, label: i === 0 ? (U.lang === 'id' ? 'Awal' : 'Start') : qLabel(i).replace(' 20', "'") }));
    const logRows = S.log.filter((e) => e.type === 'policy' || e.type === 'case').map((e) => e.type === 'case'
      ? `<div><span class="q">${qLabel(e.t)}</span><span><span class="tag info">${esc(L(E.DIL[e.id].concept))}</span>${esc(L(E.DIL[e.id].title))}: <b>${esc(L(E.DIL[e.id].options[e.choice].label))}</b></span></div>`
      : `<div><span class="q">${qLabel(e.t)}</span><span>${esc(e.changes.map(changeText).join('; '))}</span></div>`).join('');
    return `${head(`${esc(sc.company)} · ${tr('classCode')} ${esc(S.seed)}`, S.endReason === 'term' ? tr('endTitle') : tr('firedTitle'))}
      <div class="m-body">
        <p class="lead">${reason}</p>
        ${sc.story && sc.story.end ? `<div class="story-card big"><div class="story-head">${ico(sc.icon)}<span class="eyebrow">${tr('epilogue')}</span></div><p>${esc(L(sc.story.end[epilogueKey()]))}</p></div>` : ''}
        <div class="score-hero"><div class="grade">${fs.grade}</div>
          <div><span class="eyebrow">${tr('score')}</span><div class="big-v">${fs.total}<span class="muted" style="font-size:20px"> / 1000</span></div>
          <p style="margin-top:6px"><b>${tr('style')}: ${tr('style' + fs.style)}.</b> <span class="muted">${tr('style' + fs.style + 'D')}</span></p>
          ${fs.factor < 1 ? `<p class="neg mono" style="font-size:12px;margin-top:4px">${tr('penalty', nf(2).format(fs.factor))}</p>` : ''}</div></div>
        <div class="two">
          <div class="score-bars">${bars}</div>
          <div class="block"><h3>${tr('objectives')}</h3>${objs}</div>
        </div>
        <div class="two">
          <div class="chart"><h4>${tr('chartPrice')}</h4>${chartSvg(histPoints('price'), { w: 440, h: 150, fmt: priceStr, tick: (v) => nf(0).format(v), title: tr('chartPrice') })}</div>
          <div class="chart"><h4>${tr('chartConf')}</h4>${chartSvg(conf, { w: 440, h: 150, fmt: (x) => nf(0).format(x) + '%', tick: (x) => nf(0).format(x), threshold: 50, title: tr('chartConf') })}</div>
        </div>
        <div class="copybox"><h3 class="eyebrow">${tr('summary')}</h3><textarea id="summary" readonly>${esc(summaryText(fs))}</textarea><div><button class="btn" data-act="copy">${tr('copy')}</button></div></div>
        <div class="block"><h3>${tr('debrief')}</h3><ol class="qs">${['q1', 'q2', 'q3', 'q4', 'q5'].map((k) => `<li>${tr(k)}</li>`).join('')}</ol></div>
        <div class="block"><h3>${tr('decisions')}</h3><div class="log">${logRows || `<span class="muted">${tr('noDecisions')}</span>`}</div></div>
      </div>
      <div class="m-foot"><button class="btn" data-act="close">${tr('viewMap')}</button><button class="btn primary" data-act="restart">${tr('playAgain')}</button></div>`;
  }

  function modalHelp() {
    const rows = [['dPolicy', 'hPolicy'], ['dCapital', 'hCapital'], ['dVoters', 'hVoters'], ['dElection', 'hElection'], ['dSituations', 'hSituations'], ['dDilemmas', 'hDilemmas'], ['dBudget', 'hBudget'], ['dAssassin', 'hAssassin']]
      .map(([a, b]) => `<tr><td>${tr(a)}</td><td>${tr(b)}</td></tr>`).join('');
    return `${head('CEO Mandate', tr('helpTitle'))}
      <div class="m-body">
        <div class="block"><h3>${tr('helpGoal')}</h3><p class="lead">${tr('helpGoalD')}</p></div>
        <div class="help-steps">${['helpS1', 'helpS2', 'helpS3', 'helpS4', 'helpS5', 'helpS6', 'helpS7'].map((k) => `<div><p>${tr(k)}</p></div>`).join('')}</div>
        <div class="block"><h3>${tr('helpMapping')}</h3><div class="tbl-wrap"><table class="tbl"><tr><th>Democracy 3</th><th>${tr('helpHere')}</th></tr>${rows}</table></div></div>
        ${S ? `<div class="block"><h3>${tr('theoryHelp')}</h3><p class="muted" style="margin-bottom:10px">${tr('theoryHelpD')}</p><div class="tbl-wrap"><table class="tbl"><tr><th>${tr('link')}</th><th>${tr('theory')}</th></tr>${D().theories.filter((th) => !th.only || th.only.includes(S.scenario)).map((th) => `<tr><td class="nowrap">${esc(nameOf(th.from, true))} → ${esc(nameOf(th.to, true))}</td><td><b>${esc(L(th.name))}.</b> ${esc(L(th.text))}</td></tr>`).join('')}</table></div></div>` : ''}
        <p class="muted" style="font-size:12.5px">${tr('keys')}</p>
        <p class="credit">${tr('credit')}</p>
      </div>
      <div class="m-foot"><button class="btn primary" data-act="close">${tr('close')}</button></div>`;
  }

  function modalProlog() {
    const sc = E.SCEN[S.scenario], H = E.helpers(S);
    H.money = money; H.pct = pct; H.signedPct = (v) => spct(v, 0);
    const objs = sc.objectives.map((o) => `<div class="obj"><span class="ic"></span><span>${esc(L(o.text))}</span><span></span></div>`).join('');
    return `${head(`${tr('prolog')} · ${esc(L(sc.industry))}`, `<span class="h-ico" style="background:var(--d-${sc.tone || 'inn'});color:var(--di-${sc.tone || 'inn'})">${ico(sc.icon)}</span>${esc(sc.company)}`, S.t > 0)}
      <div class="m-body">
        <p class="story-text">${esc(L(sc.story ? sc.story.prolog : sc.brief))}</p>
        <div class="block"><h3>${tr('yourTargets')}</h3>${objs}</div>
      </div>
      <div class="m-foot">${S.t > 0 ? `<button class="btn primary" data-act="close">${tr('close')}</button>` : `<button class="btn primary" data-act="close" data-autofocus>${tr('begin', qLabel(curQ()))} →</button>`}</div>`;
  }

  function modalConfirm() {
    return `${head(tr('newGame'), tr('confirmNew'))}<div class="m-body"><p class="lead">${tr('confirmNewD')}</p></div>
      <div class="m-foot"><button class="btn" data-act="close">${tr('cancel')}</button><button class="btn primary danger" style="color:var(--on-accent)" data-act="restart">${tr('yesNew')}</button></div>`;
  }

  /* ------------------------------------------------------------- flow */

  function startGame() {
    const input = document.getElementById('seed');
    if (input) U.seed = (input.value || 'MBA').trim().toUpperCase().slice(0, 24) || 'MBA';
    savePrefs();
    S = E.newGame({ scenario: U.scenario, seed: U.seed, length: U.length });
    U.queue = [];
    U.mainTab = 'map';
    U.railTab = 'stake';
    U.modal = null;
    saveGame();
    render();
    window.scrollTo(0, 0);
    openModal({ type: 'prolog' });
  }

  function endQuarter() {
    if (!S || S.status !== 'playing' || U.busy) return;
    U.busy = true;
    clearHover();
    const box = document.querySelector('.main');
    if (box) box.insertAdjacentHTML('beforeend', `<div class="busy"><span>${tr('processing')}</span></div>`);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      const rep = E.endQuarter(S);
      if (rep.news.length) S.log.push({ t: rep.t, type: 'news', items: rep.news });
      U.queue = ['report'];
      if (rep.rups) U.queue.push('rups');
      if (S.status !== 'playing') U.queue.push('end');
      else if (S.dilemma) U.queue.push('case');
      U.lastReport = rep;
      U.busy = false;
      saveGame();
      render();
      advanceQueue(true);
    }, reduce ? 0 : 420);
  }

  function advanceQueue(first) {
    if (!first && U.queue.length) U.queue.shift();
    const next = U.queue[0];
    if (!next) { U.modal = null; renderModal(); saveGame(); return; }
    if (next === 'report') openModal({ type: 'report', rep: U.lastReport });
    else if (next === 'rups') openModal({ type: 'rups', rups: U.lastReport.rups });
    else if (next === 'case') openModal({ type: 'case', id: S.dilemma });
    else if (next === 'end') openModal({ type: 'end' });
    saveGame();
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  /* ------------------------------------------------------------- events */

  function onClick(e) {
    const node = e.target.closest && e.target.closest('#mapbox .node');
    if (node) {
      const [type, id] = node.getAttribute('data-key').split(':');
      openModal({ type, id, focus: `[data-key="${type}:${id}"]` });
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    if (act === 'scrim') {
      if (e.target === el && el.dataset.closable) closeModal();
      return;
    }
    switch (act) {
      case 'lang': U.lang = id; savePrefs(); render(); if (U.modal) renderModal(); break;
      case 'scenario': U.scenario = id; savePrefs(); { const v = document.getElementById('seed'); if (v) U.seed = v.value; } render(); break;
      case 'length': U.length = Number(id); savePrefs(); { const v = document.getElementById('seed'); if (v) U.seed = v.value; } render(); break;
      case 'start': startGame(); break;
      case 'resume': {
        const d = U.saved;
        if (!d) break;
        S = d.S; U.queue = d.queue || []; U.lastReport = d.lastReport || null;
        render();
        window.scrollTo(0, 0);
        if (U.queue.length && U.lastReport) advanceQueue(true);
        else if (S.status !== 'playing') openModal({ type: 'end' });
        break;
      }
      case 'main': U.mainTab = id; clearHover(); render(); break;
      case 'rail': U.railTab = id; render(); break;
      case 'detail': {
        const type = el.dataset.type;
        if (U.modal && U.modal.type === 'case' && !U.modal.done) break;
        openModal({ type, id, focus: el.closest('#mapbox') ? `[data-key="${type}:${id}"]` : null }, !!U.modal);
        break;
      }
      case 'close': closeModal(); break;
      case 'next': U.stack = []; advanceQueue(); render(); break;
      case 'end-quarter': endQuarter(); break;
      case 'results': openModal({ type: 'end' }); break;
      case 'help': openModal({ type: 'help' }); break;
      case 'prolog': openModal({ type: 'prolog' }, !!U.modal); break;
      case 'new': openModal({ type: 'confirm' }); break;
      case 'restart': clearSave(); S = null; U.modal = null; U.stack = []; U.queue = []; U.saved = null; render(); renderModal(); window.scrollTo(0, 0); break;
      case 'choose': {
        const m = U.modal;
        const d = E.DIL[m.id];
        const opt = d.options[Number(id)];
        const fx = typeof opt.fx === 'function' ? opt.fx(S, E.helpers(S)) : opt.fx;
        E.chooseDilemma(S, Number(id));
        U.modal = { type: 'case', id: m.id, done: true, choice: Number(id), risk: !!(fx && fx.risk) };
        saveGame();
        render();
        renderModal(true);
        break;
      }
      case 'pol-apply': {
        const m = U.modal;
        if (E.setPolicy(S, m.id, true, m.draft.x)) { m.draft.x = S.pol[m.id].x; saveGame(); render(); renderModal(); }
        else toast(tr('notEnough'));
        break;
      }
      case 'pol-cancel': {
        const m = U.modal;
        if (E.setPolicy(S, m.id, false, S.pol[m.id].x)) { saveGame(); render(); renderModal(); }
        else toast(tr('notEnough'));
        break;
      }
      case 'pol-revert': {
        const m = U.modal;
        E.revertPolicy(S, m.id);
        const st = S.pol[m.id];
        m.draft.x = st.on ? st.x : P(m.id).x0 || 0.5;
        saveGame(); render(); renderModal();
        break;
      }
      case 'copy': {
        const ta = document.getElementById('summary');
        const text = ta ? ta.value : '';
        const fallback = () => { if (ta) { ta.focus(); ta.select(); } toast(tr('copyFail')); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(tr('copied')), fallback);
          else fallback();
        } catch (err) { fallback(); }
        break;
      }
      default: break;
    }
  }

  function onInput(e) {
    if (e.target.id === 'pv-range' && U.modal && U.modal.draft) {
      U.modal.draft.x = Number(e.target.value);
      updatePolicyModal();
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' && U.modal) { closeModal(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('node')) {
      e.preventDefault();
      const [type, id] = e.target.getAttribute('data-key').split(':');
      openModal({ type, id, focus: `[data-key="${type}:${id}"]` });
    }
  }

  function nodeFrom(e) { const n = e.target.closest && e.target.closest('.node'); return n && n.closest('#mapbox') ? n : null; }
  function onOver(e) {
    const n = nodeFrom(e);
    if (!n) return;
    const key = n.getAttribute('data-key');
    if (U.hover === key) return;
    U.hover = key;
    applyHover(key);
  }
  function onOut(e) {
    const n = nodeFrom(e);
    if (!n) return;
    const to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.node') : null;
    if (to === n) return;
    if (!to) clearHover();
  }

  /* ------------------------------------------------------------- render */

  function render() {
    document.documentElement.lang = U.lang;
    document.title = 'CEO Mandate';
    if (M.ro) { M.ro.disconnect(); M.ro = null; }
    if (!S) {
      U.saved = loadSave();
      app.innerHTML = renderStart();
    } else {
      app.innerHTML = renderGame();
      if (U.mainTab === 'map') mountMap();
    }
  }

  const app = document.getElementById('app');
  function boot(data) {
    loadPrefs();
    if (data && data.S) {
      S = data.S;
      Object.assign(U, data.U || {});
    }
    for (const root of [app, modalRoot]) {
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
    }
    app.addEventListener('pointerover', onOver);
    app.addEventListener('pointerout', onOut);
    app.addEventListener('focusin', onOver);
    app.addEventListener('focusout', onOut);
    document.addEventListener('keydown', onKey);
    render();
    if (S && U.modal) renderModal();
  }

  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ S, U: { lang: U.lang, mainTab: U.mainTab, railTab: U.railTab, queue: U.queue, lastReport: U.lastReport, modal: U.modal, stack: U.stack } }));
  if (hot && hot.ready) hot.ready(boot);
  else boot(hot && hot.data ? hot.data : {});
})();
