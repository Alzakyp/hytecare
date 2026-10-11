// ponytail: Konten demonstrasi belum review klinis; ganti dengan materi tersunting dan tanggal review sebelum rilis.
export const articles = [
  {
    slug: 'mengenal-catatan-tekanan-darah', locale: 'id', category: 'Pencatatan',
    title: 'Mengapa mencatat tekanan darah?',
    summary: 'Catatan pribadi membantu Anda mengingat riwayat pengukuran untuk dibahas saat konsultasi.',
    content: 'Simpan waktu dan hasil pengukuran sesuai angka yang ditampilkan alat. Jika memiliki pertanyaan tentang maknanya, diskusikan dengan tenaga kesehatan. Aplikasi ini tidak menafsirkan hasil sebagai diagnosis.',
    source: 'Konten demonstrasi internal HyteCare; rujukan klinis belum ditetapkan.', reviewedAt: null,
  },
  {
    slug: 'menyiapkan-pertanyaan-konsultasi', locale: 'id', category: 'Konsultasi',
    title: 'Menyiapkan pertanyaan sebelum konsultasi',
    summary: 'Tulis hal yang ingin Anda tanyakan agar percakapan lebih terarah.',
    content: 'Anda dapat mencatat pertanyaan mengenai kebiasaan, aktivitas, atau hasil pencatatan untuk dibawa saat bertemu tenaga kesehatan. Jangan mengubah pengobatan hanya berdasarkan materi aplikasi.',
    source: 'Konten demonstrasi internal HyteCare; rujukan klinis belum ditetapkan.', reviewedAt: null,
  },
  {
    slug: 'mengenali-sumber-informasi', locale: 'id', category: 'Literasi Kesehatan',
    title: 'Memeriksa sumber informasi kesehatan',
    summary: 'Perhatikan asal, tanggal, dan konteks informasi sebelum menerapkannya.',
    content: 'Materi daring dapat berubah. Cari sumber yang dapat dipertanggungjawabkan dan tanyakan kepada tenaga kesehatan bila suatu anjuran tidak jelas atau bertentangan dengan kondisi pribadi.',
    source: 'Konten demonstrasi internal HyteCare; rujukan klinis belum ditetapkan.', reviewedAt: null,
  },
];

export function getArticle(slug) { return articles.find((article) => article.slug === slug); }
