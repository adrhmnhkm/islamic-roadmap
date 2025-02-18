export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  category?: 'feature' | 'improvement' | 'fix';
  version?: string;
}

export const changelog: ChangelogEntry[] = [
  {
    date: '04 Feb, 2024',
    title: 'Penambahan Fitur Baru: Kuis Interaktif',
    description: 'Sekarang tersedia kuis interaktif untuk menguji pemahaman Anda',
    category: 'feature',
    version: '1.2.0'
  },
  {
    date: '21 Jan, 2024',
    title: 'Pembaruan Konten Tajwid',
    description: 'Penambahan materi dan contoh audio untuk pembelajaran tajwid',
    category: 'improvement',
    version: '1.1.2'
  },
  {
    date: '18 Jan, 2024',
    title: 'Peluncuran Fitur Pelacakan Progres',
    description: 'Pantau kemajuan belajar Anda dengan fitur pelacakan baru',
    category: 'feature',
    version: '1.1.0'
  },
  {
    date: '16 Jan, 2024',
    title: 'Penambahan Sumber Belajar Video',
    description: 'Koleksi video pembelajaran baru telah ditambahkan',
    category: 'improvement',
    version: '1.0.2'
  },
  {
    date: '04 Jan, 2024',
    title: 'Perbaikan UI/UX',
    description: 'Peningkatan tampilan dan pengalaman pengguna',
    category: 'improvement',
    version: '1.0.1'
  }
];