export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  category?: 'feature' | 'improvement' | 'fix';
  version?: string;
}

export const changelog: ChangelogEntry[] = [
  {
    date: '23 Feb, 2025',
    title: 'Penyesuaian UI',
    description: 'menampilkan jumlah sumber belajar yang ada',
    category: 'feature',
    version: '1.2.1'
  },
  {
    date: '19 Feb, 2025',
    title: 'Melengkapi materi dari setiap topik',
    description: 'penambahan dummy materi untuk setiap topik',
    category: 'feature',
    version: '1.2.1'
  },
  {
    date: '21 Jan, 2025',
    title: 'Pembaruan Konten Tajwid',
    description: 'Penambahan materi dan contoh audio untuk pembelajaran tajwid',
    category: 'improvement',
    version: '1.1.2'
  }
];