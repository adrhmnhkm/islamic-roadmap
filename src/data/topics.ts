export interface Resource {
  title: string;
  type: 'video' | 'article' | 'book';
  description: string;
  url: string;
  subResources?: Resource[];
}

export interface Node {
  id: string;
  label: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  resources: Resource[];
}

export interface TopicData {
  id: string;
  title: string;
  description: string;
  icon?: string;
  totalLessons: number;
  nodes: Node[];
  edges?: { source: string; target: string }[];
  resources: {
    title: string;
    author: string;
    description: string;
    level: string;
    language: string;
    downloadUrl: string;
  }[];
  additionalResources: {
    title: string;
    author: string;
    type: 'video' | 'article';
    description: string;
    language: string;
    url: string;
    platform?: string;
  }[];
}

export const topicData: Record<string, TopicData> = {
  quran: {
    id: 'quran',
    title: 'Al-Quran',
    description: 'Kumpulan sumber belajar Al-Quran dan ilmu-ilmu terkait.',
    icon: '📖',
    totalLessons: 15,
    nodes: [
      {
        id: 'quran-basic',
        label: 'Dasar Al-Quran',
        description: 'Belajar membaca Al-Quran dan tajwid dasar',
        level: 'basic',
        resources: [
          {
            title: 'Pengenalan Huruf Hijaiyah',
            type: 'video',
            description: 'Video pembelajaran mengenal huruf hijaiyah dan cara membacanya',
            url: 'https://www.youtube.com/watch?v=Le5h-mjGpVI',
            subResources: [
              {
                title: 'Bentuk Huruf Hijaiyah',
                type: 'article',
                description: 'Penjelasan detail tentang bentuk-bentuk huruf hijaiyah',
                url: 'https://www.youtube.com/watch?v=Le5h-mjGpVI'
              },
              {
                title: 'Latihan Pengucapan',
                type: 'video',
                description: 'Praktik pengucapan huruf hijaiyah dengan benar + Tajwid',
                url: 'https://www.youtube.com/watch?v=VGaBBbLe0Fo'
              }
            ]
          },
          {
            title: 'Dasar-dasar Tajwid',
            type: 'video',
            description: 'Pengenalan ilmu tajwid untuk pemula',
            url: 'https://www.youtube.com/watch?v=rElPtfYamOk'
          }
        ]
      },
      {
        id: 'quran-intermediate',
        label: 'Menengah',
        description: 'Memperdalam pemahaman Al-Quran dan tajwid',
        level: 'intermediate',
        resources: [
          {
            title: 'Hukum Tajwid Lanjutan',
            type: 'video',
            description: 'Pembelajaran hukum tajwid yang lebih mendalam',
            url: 'https://www.youtube.com/watch?v=ukn3wJY5dhg'
          },
          {
            title: 'Memahami Makna Al-Quran',
            type: 'article',
            description: 'Panduan memahami arti dan tafsir Al-Quran',
            url: 'https://wiz.or.id/pentingnya-memahami-arti-bacaan-al-quran/', 
          }
        ]
      },
      {
        id: 'quran-advanced',
        label: 'Lanjutan',
        description: 'Studi mendalam tentang tafsir dan ulumul quran',
        level: 'advanced',
        resources: [
          {
            title: 'Ulumul Quran',
            type: 'book',
            description: 'Studi komprehensif tentang ilmu-ilmu Al-Quran dan pendalamannya',
            url: 'https://example.com/ulumul-quran'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'quran-basic',
        target: 'quran-intermediate'
      },
      {
        source: 'quran-intermediate',
        target: 'quran-advanced'
      }
    ],
    resources: [
      {
        title: "Mudah Belajar Tajwid",
        author: "Dr. Syed Kalimullah Qadri",
        description: "Panduan lengkap belajar Tajwid dengan contoh praktis.",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/tajwid-book"
      },
      {
        title: "Ulumul Quran untuk Pemula",
        author: "Dr. Muhammad Chirzin",
        description: "Pengantar ilmu-ilmu Al-Quran untuk tingkat dasar",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/ulumul-quran-basic"
      }
    ],
    additionalResources: [
      {
        title: "Pengantar Ilmu Tajwid",
        author: "Ustadz Nouman Ali Khan",
        type: "video",
        description: "Seri video pembelajaran dasar-dasar Tajwid",
        language: "Indonesia",
        url: "https://example.com/tajwid-intro",
        platform: "YouTube"
      },
      {
        title: "Metode Praktis Belajar Mengaji",
        author: "Ustadz Adi Hidayat",
        type: "video",
        description: "Tutorial cara cepat belajar membaca Al-Quran",
        language: "Indonesia",
        url: "https://example.com/quick-quran",
        platform: "YouTube"
      }
    ]
  },
  aqeedah: {
    id: 'aqeedah',
    title: 'Aqidah',
    description: 'Mempelajari dasar-dasar keyakinan dalam Islam.',
    icon: '☪️',
    totalLessons: 12,
    nodes: [
      {
        id: 'aqeedah-basic',
        label: 'Dasar Aqidah',
        description: 'Pengenalan dasar-dasar aqidah Islam',
        level: 'basic',
        resources: [
          {
            title: 'Rukun Iman',
            type: 'video',
            description: 'Penjelasan tentang 6 rukun iman dalam Islam',
            url: 'https://example.com/rukun-iman',
            subResources: [
              {
                title: 'Iman kepada Allah',
                type: 'article',
                description: 'Pembahasan mendalam tentang keimanan kepada Allah',
                url: 'https://example.com/iman-allah'
              }
            ]
          }
        ]
      },
      {
        id: 'aqeedah-intermediate',
        label: 'Menengah',
        description: 'Pemahaman lebih dalam tentang aqidah',
        level: 'intermediate',
        resources: [
          {
            title: 'Asmaul Husna',
            type: 'video',
            description: 'Memahami 99 nama Allah',
            url: 'https://example.com/asmaul-husna'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'aqeedah-basic',
        target: 'aqeedah-intermediate'
      }
    ],
    resources: [
      {
        title: "Kitab Tauhid",
        author: "Syaikh Muhammad bin Abdul Wahhab",
        description: "Penjelasan mendasar tentang tauhid dalam Islam",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/kitab-tauhid"
      }
    ],
    additionalResources: [
      {
        title: "Pengantar Ilmu Tauhid",
        author: "Ustadz Abdul Somad",
        type: "video",
        description: "Seri video pembelajaran dasar-dasar tauhid",
        language: "Indonesia",
        url: "https://example.com/tauhid-intro",
        platform: "YouTube"
      }
    ]
  },
  fiqh: {
    id: 'fiqh',
    title: 'Fiqih',
    description: 'Mempelajari hukum-hukum Islam dalam kehidupan sehari-hari.',
    icon: '⚖️',
    totalLessons: 20,
    nodes: [
      {
        id: 'fiqh-basic',
        label: 'Dasar Fiqih',
        description: 'Pengenalan dasar-dasar fiqih Islam',
        level: 'basic',
        resources: [
          {
            title: 'Thaharah',
            type: 'video',
            description: 'Belajar tentang bersuci dalam Islam',
            url: 'https://example.com/thaharah',
            subResources: [
              {
                title: 'Wudhu',
                type: 'video',
                description: 'Cara berwudhu yang benar',
                url: 'https://example.com/wudhu'
              },
              {
                title: 'Tayammum',
                type: 'article',
                description: 'Panduan bersuci dengan debu',
                url: 'https://example.com/tayammum'
              }
            ]
          }
        ]
      },
      {
        id: 'fiqh-intermediate',
        label: 'Menengah',
        description: 'Pemahaman lebih dalam tentang fiqih',
        level: 'intermediate',
        resources: [
          {
            title: 'Muamalah',
            type: 'video',
            description: 'Hukum-hukum transaksi dalam Islam',
            url: 'https://example.com/muamalah'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'fiqh-basic',
        target: 'fiqh-intermediate'
      }
    ],
    resources: [
      {
        title: "Fiqih Praktis",
        author: "Dr. Yusuf Al-Qaradawi",
        description: "Panduan praktis fiqih sehari-hari",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/fiqh-praktis"
      }
    ],
    additionalResources: [
      {
        title: "Belajar Fiqih Shalat",
        author: "Ustadz Khalid Basalamah",
        type: "video",
        description: "Tutorial lengkap tata cara shalat",
        language: "Indonesia",
        url: "https://example.com/fiqh-shalat",
        platform: "YouTube"
      }
    ]
  },
  hadith: {
    id: 'hadith',
    title: 'Hadits',
    description: 'Mempelajari hadits-hadits Nabi Muhammad SAW.',
    icon: '📚',
    totalLessons: 18,
    nodes: [
      {
        id: 'hadith-basic',
        label: 'Dasar Hadits',
        description: 'Pengenalan ilmu hadits',
        level: 'basic',
        resources: [
          {
            title: 'Pengantar Ilmu Hadits',
            type: 'video',
            description: 'Dasar-dasar ilmu hadits',
            url: 'https://example.com/hadith-intro',
            subResources: [
              {
                title: 'Klasifikasi Hadits',
                type: 'article',
                description: 'Memahami jenis-jenis hadits',
                url: 'https://example.com/hadith-types'
              }
            ]
          }
        ]
      },
      {
        id: 'hadith-intermediate',
        label: 'Menengah',
        description: 'Studi hadits lebih mendalam',
        level: 'intermediate',
        resources: [
          {
            title: 'Metodologi Hadits',
            type: 'video',
            description: 'Metode penelitian hadits',
            url: 'https://example.com/hadith-methodology'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'hadith-basic',
        target: 'hadith-intermediate'
      }
    ],
    resources: [
      {
        title: "40 Hadits Nawawi",
        author: "Imam An-Nawawi",
        description: "Kumpulan 40 hadits pilihan",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/40-hadits"
      }
    ],
    additionalResources: [
      {
        title: "Memahami Hadits Bukhari",
        author: "Dr. Muhammad Syafii Antonio",
        type: "video",
        description: "Kajian hadits-hadits Bukhari",
        language: "Indonesia",
        url: "https://example.com/bukhari-study",
        platform: "YouTube"
      }
    ]
  },
  sirah: {
    id: 'sirah',
    title: 'Sirah',
    description: 'Mempelajari sejarah kehidupan Nabi Muhammad SAW.',
    icon: '📜',
    totalLessons: 16,
    nodes: [
      {
        id: 'sirah-basic',
        label: 'Dasar Sirah',
        description: 'Pengenalan sejarah hebat Nabi Muhammad SAW',
        level: 'basic',
        resources: [
          {
            title: 'Periode Makkah',
            type: 'video',
            description: 'Kehidupan Nabi di Makkah',
            url: 'https://example.com/makkah-period',
            subResources: [
              {
                title: 'Masa Kecil Nabi',
                type: 'article',
                description: 'Kisah masa kecil Nabi Muhammad',
                url: 'https://example.com/prophet-childhood'
              }
            ]
          }
        ]
      },
      {
        id: 'sirah-intermediate',
        label: 'Menengah',
        description: 'Studi mendalam sejarah Nabi',
        level: 'intermediate',
        resources: [
          {
            title: 'Periode Madinah',
            type: 'video',
            description: 'Kehidupan Nabi di Madinah',
            url: 'https://example.com/madinah-period'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'sirah-basic',
        target: 'sirah-intermediate'
      }
    ],
    resources: [
      {
        title: "Sirah Nabawiyah",
        author: "Syeikh Shafiyyurrahman Al-Mubarakfuri",
        description: "Sejarah lengkap kehidupan Nabi Muhammad SAW",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/sirah-book"
      }
    ],
    additionalResources: [
      {
        title: "Pelajaran dari Sirah Nabi",
        author: "Ustadz Felix Siauw",
        type: "video",
        description: "Hikmah dari perjalanan hidup Nabi",
        language: "Indonesia",
        url: "https://example.com/sirah-lessons",
        platform: "YouTube"
      }
    ]
  },
  arabic: {
    id: 'arabic',
    title: 'Bahasa Arab',
    description: 'Belajar bahasa Arab untuk memahami Al-Quran dan hadits.',
    icon: '🔤',
    totalLessons: 25,
    nodes: [
      {
        id: 'arabic-basic',
        label: 'Dasar Bahasa Arab',
        description: 'Pengenalan dasar bahasa Arab',
        level: 'basic',
        resources: [
          {
            title: 'Huruf Arab',
            type: 'video',
            description: 'Belajar menulis huruf Arab',
            url: 'https://example.com/arabic-letters',
            subResources: [
              {
                title: 'Latihan Menulis',
                type: 'article',
                description: 'Panduan praktis menulis Arab',
                url: 'https://example.com/arabic-writing'
              }
            ]
          }
        ]
      },
      {
        id: 'arabic-intermediate',
        label: 'Menengah',
        description: 'Tata bahasa Arab',
        level: 'intermediate',
        resources: [
          {
            title: 'Nahwu Dasar',
            type: 'video',
            description: 'Pengenalan ilmu nahwu',
            url: 'https://example.com/nahwu-basic'
          }
        ]
      }
    ],
    edges: [
      {
        source: 'arabic-basic',
        target: 'arabic-intermediate'
      }
    ],
    resources: [
      {
        title: "Belajar Bahasa Arab Modern",
        author: "Dr. V. Abdur Rahim",
        description: "Metode modern belajar bahasa Arab",
        level: "Pemula",
        language: "Indonesia",
        downloadUrl: "https://example.com/modern-arabic"
      }
    ],
    additionalResources: [
      {
        title: "Kosa Kata Bahasa Arab Sehari-hari",
        author: "Ustadz Erwandi Tarmizi",
        type: "video",
        description: "Belajar kosa kata Arab praktis",
        language: "Indonesia",
        url: "https://example.com/arabic-vocabulary",
        platform: "YouTube"
      }
    ]
  }
};

export const calculateResourceCount = (topicId: string) => {
  const topic = topicData[topicId];
  if (!topic) return null;

  const counts = {
    videos: 0,
    articles: 0,
    books: 0
  };

  // Count resources from nodes
  topic.nodes?.forEach(node => {
    node.resources?.forEach(resource => {
      if (resource.type === 'video') counts.videos++;
      else if (resource.type === 'article') counts.articles++;
      else if (resource.type === 'book') counts.books++;

      // Count sub-resources
      resource.subResources?.forEach(subResource => {
        if (subResource.type === 'video') counts.videos++;
        else if (subResource.type === 'article') counts.articles++;
        else if (subResource.type === 'book') counts.books++;
      });
    });
  });

  // Count main resources (books)
  topic.resources?.forEach(() => {
    counts.books++;
  });

  // Count additional resources
  topic.additionalResources?.forEach(resource => {
    if (resource.type === 'video') counts.videos++;
    else if (resource.type === 'article') counts.articles++;
  });

  return counts;
};