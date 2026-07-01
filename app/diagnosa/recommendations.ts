import { type Rekomendasi } from "@/lib/sipadi/types";

export interface PenyakitDetail {
  organisme: string;
  rekomendasi: Rekomendasi;
  deskripsi: string;
}

export const PENYAKIT_DETAILS: Record<string, PenyakitDetail> = {
  P01: {
    organisme: "Nilaparvata lugens",
    deskripsi: "Wereng Batang Coklat (WBC) adalah salah satu hama tanaman padi yang paling berbahaya. Hama ini merusak tanaman dengan cara menghisap cairan batang padi hingga mengering (hopperburn) dan juga menularkan virus kerdil.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Pengendalian Hayati: Lepaskan musuh alami seperti laba-laba penenun dan kepik predator Cyrtorhinus lividipennis.",
        "Insektisida Spesifik: Semprot dengan insektisida berbahan aktif Pimetrozin atau Buprofezin sesuai dosis anjuran.",
        "Sanitasi: Keringkan sawah secara berkala (irigasi berselang/intermittent) untuk mengurangi kelembapan makro di pangkal batang."
      ],
      pencegahan_jangka_panjang: [
        "Varietas Resisten: Tanam varietas unggul tahan wereng seperti Inpari 31 atau Inpari 33 secara serentak.",
        "Jarak Tanam: Gunakan sistem tanam Jajar Legowo untuk menciptakan lorong angin dan mengurangi kelembapan mikro.",
        "Pemupukan: Batasi penggunaan pupuk Nitrogen (Urea) berlebih dan tingkatkan pupuk Kalium (K) untuk memperkuat sel tanaman."
      ]
    }
  },
  P02: {
    organisme: "Scirpophaga innotata / incertulas",
    deskripsi: "Penggerek Batang Padi menyerang tanaman pada fase vegetatif (menyebabkan anakan mati / sundep) dan fase generatif (menyebabkan malai hampa memutih / beluk). Larva merusak jaringan pembuluh di dalam batang.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Pengumpulan Kelompok Telur: Kumpulkan dan musnahkan kelompok telur penggerek batang di persemaian dan pertanaman.",
        "Insektisida Sistemik: Aplikasikan insektisida granular berbahan aktif Karbofuran atau Fipronil pada zona perakaran.",
        "Lampu Perangkap: Pasang lampu perangkap (light trap) pada malam hari untuk menangkap ngengat dewasa."
      ],
      pencegahan_jangka_panjang: [
        "Tanam Serempak: Lakukan penanaman secara serentak dalam satu hamparan untuk memutus siklus hidup hama.",
        "Rotasi Tanaman: Rotasi lahan dengan tanaman non-padi (palawija) setelah panen raya untuk membunuh pupa di tanah.",
        "Destruksi Tunggul: Lakukan pembajakan tanah sedalam 20 cm segera setelah panen untuk memusnahkan larva di tunggul padi."
      ]
    }
  },
  P03: {
    organisme: "Leptocorisa oratorius",
    deskripsi: "Walang Sangit menyerang bulir padi yang sedang mengisi (fase masak susu). Hama ini menghisap cairan bulir sehingga gabah menjadi hampa atau bercak hitam, serta mengeluarkan bau busuk yang menyengat.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Perangkap Bau: Pasang perangkap dari bangkai ketam, keong mas, atau ikan asin di sekitar pematang untuk memancing walang sangit.",
        "Penyemprotan Kontak: Semprot insektisida berbahan aktif Deltametrin atau BPMC pada pagi hari saat walang sangit aktif.",
        "Sanitasi Gulma: Bersihkan gulma dan rumput liar di pematang sawah yang menjadi inang alternatif."
      ],
      pencegahan_jangka_panjang: [
        "Tanam Serempak: Tanam serempak agar fase pembungaan merata dan membatasi penyebaran walang sangit.",
        "Pemupukan Berimbang: Berikan nutrisi tanaman yang cukup agar pengisian bulir padi berjalan cepat dan seragam.",
        "Sanitasi Lahan: Bersihkan sisa-sisa tanaman inang di sekitar areal persawahan secara berkala setelah panen."
      ]
    }
  },
  P04: {
    organisme: "Pomacea canaliculata",
    deskripsi: "Keong Mas memotong pangkal tanaman padi muda yang baru ditanam dan memakan helai daunnya hingga habis dalam waktu singkat. Kerusakan parah dapat mengharuskan petani melakukan penyulaman total.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Pengambilan Manual: Kumpulkan keong mas secara manual pada pagi atau sore hari, lalu musnahkan atau gunakan sebagai pakan ternak.",
        "Umpan Menarik: Pasang umpan dedaunan seperti daun talas atau daun pepaya untuk mempermudah pengumpulan keong.",
        "Moluskisida: Gunakan moluskisida berbahan aktif Niklosamida pada area tergenang jika populasi melebihi ambang batas."
      ],
      pencegahan_jangka_panjang: [
        "Pembuatan Parit: Buat parit kecil (cacingan) di sekeliling petakan sawah sebagai perangkap keong saat air dikeringkan.",
        "Pemasangan Saringan: Pasang saringan pada saluran masuk air sawah untuk mencegah masuknya keong mas dari irigasi luar.",
        "Pemberaian Lahan: Keringkan sawah selama fase persemaian untuk menghambat pergerakan keong mas."
      ]
    }
  },
  P05: {
    organisme: "Rattus argentiventer",
    deskripsi: "Tikus Sawah merusak pertanaman padi mulai dari persemaian, fase vegetatif, hingga generatif. Tikus memotong batang padi di bagian pangkal rumpun dan memakan titik tumbuh tanaman.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Gropyokan: Lakukan pemburuan tikus secara massal (gropyokan) pada awal musim tanam melibatkan seluruh petani.",
        "Fumigasi: Lakukan pengemposan/fumigasi menggunakan belerang pada lubang-lubang aktif tikus di pematang sawah.",
        "Umpan Beracun: Pasang umpan beracun (rodentisida) di sepanjang jalur aktif tikus secara hati-hati pada malam hari."
      ],
      pencegahan_jangka_panjang: [
        "TBS (Trap Barrier System): Terapkan sistem tanaman perangkap dengan pagar plastik dan perangkap bubu di sekelilingnya.",
        "Pematang Sempit: Jaga ukuran pematang sawah tetap kecil (lebar < 30 cm) dan bersih dari semak-semak agar tidak menjadi sarang.",
        "Predator Alami: Lestarikan burung hantu (Tyto alba) dengan mendirikan rumah burung hantu (rubuha) di area persawahan."
      ]
    }
  },
  P06: {
    organisme: "Magnaporthe oryzae (Pyricularia oryzae)",
    deskripsi: "Penyakit Blast disebabkan oleh jamur. Penyakit ini menyerang daun (blast daun dengan bercak belah ketupat) dan leher malai (blast leher / potong leher), yang menyebabkan malai patah dan gabah menjadi hampa.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Aplikasi Fungisida: Semprotkan fungisida berbahan aktif Trisiklazol, Pirikuilon, atau Kasugamisin begitu gejala awal terlihat.",
        "Pengeringan Lahan: Kurangi genangan air berlebih dan terapkan sistem macak-macak untuk menurunkan kelembapan mikro.",
        "Pembersihan Spora: Cabut dan musnahkan tanaman yang terinfeksi parah untuk meminimalkan penyebaran spora lewat angin."
      ],
      pencegahan_jangka_panjang: [
        "Varietas Tahan: Tanam varietas yang tahan terhadap penyakit Blas seperti Inpari 32, Inpari 42, atau varietas lokal unggul.",
        "Pemupukan Nitrogen Berimbang: Hindari penggunaan pupuk Nitrogen secara berlebihan; seimbangkan dengan unsur Fosfor (P) dan Kalium (K).",
        "Jarak Tanam Lebar: Gunakan sistem tanam Jajar Legowo untuk mengoptimalkan sinar matahari dan sirkulasi udara di rumpun padi."
      ]
    }
  },
  P07: {
    organisme: "Xanthomonas oryzae pv. oryzae",
    deskripsi: "Hawar Daun Bakteri (HDB / Kresek) adalah penyakit bakteri sistemik. Menimbulkan gejala garis basah kekuningan dari tepi daun yang meluas, menyebabkan daun layu mengerut (kresek) dan mati.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Bakterisida: Semprotkan bakterisida berbahan aktif Tembaga Hidroksida atau Streptomisin Sulfat pada tanaman terinfeksi.",
        "Pengeringan Lahan: Segera keringkan sawah yang tergenang untuk menghentikan penularan bakteri melalui air.",
        "Sanitasi Tanaman Sakit: Hindari pemotongan ujung daun bibit saat tanam guna mencegah luka masuknya bakteri."
      ],
      pencegahan_jangka_panjang: [
        "Benih Sehat: Gunakan benih bersertifikat bebas dari infeksi bakteri Xanthomonas oryzae.",
        "Jarak Tanam Jajar Legowo: Terapkan sistem Jajar Legowo untuk mengurangi kelembapan di sela-sela rumpun tanaman.",
        "Pemupukan Seimbang: Kurangi dosis urea dan berikan pupuk K (Kalium) yang cukup untuk mempertebal dinding sel tanaman."
      ]
    }
  },
  P08: {
    organisme: "Rice Tungro Bacilliform Virus (RTBV)",
    deskripsi: "Tungro adalah penyakit virus yang ditularkan oleh Wereng Hijau. Menyebabkan tanaman padi kerdil tegak, daun berubah warna menjadi kuning-oranye dari ujung, dan jumlah anakan sangat sedikit.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Eradikasi: Cabut dan benamkan tanaman yang menunjukkan gejala kerdil kekuningan agar tidak menjadi sumber penularan.",
        "Pengendalian Vektor: Semprot tanaman dengan insektisida berbahan aktif Pimetrozin atau Imidakloprid untuk membasmi wereng hijau.",
        "Sanitasi Lahan: Bersihkan rumput/gulma yang menjadi inang alternatif virus Tungro di pematang."
      ],
      pencegahan_jangka_panjang: [
        "Varietas Tahan: Tanam varietas tahan Tungro seperti Inpari 9, Inpari 36, atau Inpari 43.",
        "Tanam Serempak: Upayakan penanaman serempak di satu hamparan untuk membatasi ketersediaan virus dan vektornya.",
        "Siklus Bera: Lakukan masa bera (lahan tidak ditanami padi) selama minimal 1 bulan setelah panen raya untuk memotong siklus hidup."
      ]
    }
  },
  P09: {
    organisme: "Bipolaris oryzae (Helminthosporium oryzae)",
    deskripsi: "Bercak Coklat disebabkan oleh jamur yang menyerang tanah miskin unsur hara atau drainase buruk. Menimbulkan bercak oval berwarna coklat dengan lingkaran kuning di daun dan gabah.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Aplikasi Fungisida: Aplikasikan fungisida berbahan aktif Mankozeb, Karbendazim, atau Difenokonazol pada awal serangan.",
        "Pemupukan Susulan: Tambahkan pupuk nitrogen dan kalium jika tanaman menunjukkan gejala kekurangan unsur hara.",
        "Sanitasi Sisa Tanaman: Bakar atau benamkan jerami padi bekas panen yang terinfeksi secara sempurna."
      ],
      pencegahan_jangka_panjang: [
        "Perbaikan Drainase & Hara: Pastikan lahan sawah mendapat pemupukan berimbang dan sistem drainase berjalan baik.",
        "Pengolahan Tanah Maksimal: Lakukan pembajakan tanah secara intensif untuk mempercepat dekomposisi spora jamur di tanah.",
        "Gunakan Benih Bersih: Gunakan benih bermutu tinggi yang bebas dari infeksi patogen terbawa benih."
      ]
    }
  },
  P10: {
    organisme: "Rhizoctonia solani",
    deskripsi: "Busuk Batang / Hawar Pelepah menyerang pelepah daun bagian bawah, menyebar ke atas berupa bercak keabu-abuan basah oval besar. Menyebabkan tanaman rebah dan pengisian gabah terganggu.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Aplikasi Fungisida: Semprot fungisida berbahan aktif Difenokonazol atau Flutolanil menyasar pelepah daun bagian bawah.",
        "Pengurangan Kelembapan: Kurangi tinggi genangan air di sawah dan lakukan penjarangan rumpun jika terlalu rimbun.",
        "Sanitasi Pelepah: Bersihkan pelepah daun yang membusuk di bagian bawah tanaman agar tidak menyebar ke atas."
      ],
      pencegahan_jangka_panjang: [
        "Jarak Tanam Longgar: Terapkan jarak tanam sistem Jajar Legowo guna mencegah kelembapan mikro yang tinggi di antara rumpun.",
        "Pemupukan Berimbang: Seimbangkan pemupukan Urea dengan pupuk Kalium untuk meningkatkan kekuatan dinding sel tanaman.",
        "Rotasi Tanaman: Lakukan pergiliran tanaman dengan palawija untuk memutus siklus hidup jamur tanah Rhizoctonia solani."
      ]
    }
  },
  P11: {
    organisme: "Orseolia oryzae",
    deskripsi: "Ganjur disebabkan oleh lalat kecil yang bertelur di daun padi. Larvanya memicu pertumbuhan abnormal pada anakan berupa selubung daun berbentuk pipa memanjang seperti daun bawang.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Insektisida Sistemik: Taburkan insektisida granular berbahan aktif Karbofuran di sekitar pangkal rumpun padi.",
        "Pemberantasan Larva: Singkirkan anakan padi yang menyerupai pipa/daun bawang secara manual agar larva ganjur mati.",
        "Pengendalian Cahaya: Pasang perangkap lampu (light trap) untuk memantau dan menangkap lalat ganjur dewasa."
      ],
      pencegahan_jangka_panjang: [
        "Tanam Lebih Awal: Hindari penanaman terlambat karena populasi lalat ganjur memuncak di akhir musim hujan.",
        "Varietas Tahan: Gunakan benih padi yang terbukti toleran atau tahan terhadap serangan lalat ganjur.",
        "Pemupukan K: Pastikan tanaman mendapatkan kecukupan pupuk Kalium agar jaringan batang mengeras dan sulit ditembus larva."
      ]
    }
  },
  P12: {
    organisme: "Spodoptera mauritia / litura",
    deskripsi: "Ulat Grayak menyerang pertanaman padi secara berkelompok pada malam hari. Ulat memakan helai daun mulai dari tepi hingga gundul menyisakan tulang daun dalam semalam.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Penyemprotan Sore/Malam: Lakukan penyemprotan insektisida berbahan aktif Klorantraniliprol pada sore/malam hari saat ulat aktif makan.",
        "Penggenangan Sementara: Genangi sawah setinggi 10 cm selama beberapa jam untuk memaksa ulat memanjat rumpun agar mudah dimusnahkan.",
        "Pemasangan Umpan: Gunakan umpan dedak dicampur insektisida kontak yang diletakkan di sepanjang pematang sawah."
      ],
      pencegahan_jangka_panjang: [
        "Sanitasi Gulma: Bersihkan gulma di pematang sawah yang menjadi tempat persembunyian ulat di siang hari.",
        "Pengolahan Tanah: Bajak sawah setelah panen untuk mengekspos kepompong ulat grayak di dalam tanah ke sinar matahari.",
        "Musuh Alami: Jaga kelestarian tawon parasitoid (Apanteles spp.) dan burung pemakan ulat di sekitar persawahan."
      ]
    }
  },
  P13: {
    organisme: "Rice Grassy Stunt Virus (RGSV)",
    deskripsi: "Kerdil Rumput adalah penyakit virus sistemik yang ditularkan oleh Wereng Coklat. Tanaman menjadi sangat kerdil, anakan sangat banyak dan rapat menyerupai rumput liar, daun sempit kekuningan dan kaku.",
    rekomendasi: {
      penanganan_jangka_pendek: [
        "Eradikasi Total: Cabut seluruh rumpun tanaman yang terinfeksi kerdil rumput dan bakar di luar area sawah agar tidak menular.",
        "Pengendalian Wereng Coklat: Basmi populasi wereng coklat (vektor virus) menggunakan insektisida berbahan aktif Pimetrozin.",
        "Pengeringan Lahan: Keringkan sawah secara berkala untuk membatasi aktivitas wereng coklat di pangkal batang."
      ],
      pencegahan_jangka_panjang: [
        "Tanam Varietas Tahan Wereng: Tanam varietas padi yang resisten terhadap wereng coklat seperti Inpari 33.",
        "Tanam Serempak: Terapkan penanaman serempak di satu hamparan untuk memutus mata rantai perkembangbiakan wereng coklat.",
        "Bera Panjang: Biarkan lahan bera tanpa tanaman padi selama minimal 1-2 bulan setelah panen raya untuk membunuh vektor penular."
      ]
    }
  }
};
