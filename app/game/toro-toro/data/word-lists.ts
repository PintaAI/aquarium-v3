interface Word {
  id: number;
  term: string;
  definition: string;
}

interface WordList {
  name: string;
  words: Word[];
}

export const PRESET_LISTS: Record<string, WordList> = {
  basic: {
    name: "Basic Korean",
    words: [
      { id: 1, term: '안녕하세요', definition: 'hello' },
      { id: 2, term: '감사합니다', definition: 'terima kasih' },
      { id: 3, term: '잘 가요', definition: 'selamat tinggal' },
      { id: 4, term: '미안해요', definition: 'maaf' },
      { id: 5, term: '잘자요', definition: 'selamat tidur' }
    ]
  },
  epsTopik: {
    name: "EPS TOPIK",
    words: [
      { id: 1, term: '작업장', definition: 'tempat kerja' },
      { id: 2, term: '안전모', definition: 'helm' },
      { id: 3, term: '작업복', definition: 'baju kerja' },
      { id: 4, term: '안전화', definition: 'sepatu safety' },
      { id: 5, term: '보호구', definition: 'alat pelindung' }
    ]
  },
  intermediate: {
    name: "Intermediate Korean",
    words: [
      { id: 1, term: '회사원', definition: 'karyawan' },
      { id: 2, term: '주말', definition: 'akhir pekan' },
      { id: 3, term: '지하철', definition: 'kereta bawah tanah' },
      { id: 4, term: '약속', definition: 'janji' },
      { id: 5, term: '시험', definition: 'ujian' }
    ]
  }
};

export type PresetListType = keyof typeof PRESET_LISTS;
