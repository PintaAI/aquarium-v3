export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number | null;
  isUserCorrect?: boolean | null;
  author: {
    name: string;
    avatar: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the capital of South Korea?",
    options: ["Busan", "Seoul", "Incheon", "Daegu"],
    correctAnswer: 1,
    author: {
      name: "Korean Teacher",
      avatar: "/avatars/teacher1.png"
    },
    stats: {
      likes: 1234,
      comments: 89,
      shares: 45
    }
  },
  {
    id: 2,
    question: "Which of these is a Korean alphabet?",
    options: ["汉字", "ひらがな", "한글", "注音"],
    correctAnswer: 2,
    author: {
      name: "Hangul Expert",
      avatar: "/avatars/teacher2.png"
    },
    stats: {
      likes: 2341,
      comments: 156,
      shares: 78
    }
  },
  {
    id: 3,
    question: "What is Kimchi?",
    options: ["A type of soup", "Fermented vegetables", "A dessert", "A noodle dish"],
    correctAnswer: 1,
    author: {
      name: "Food Master",
      avatar: "/avatars/teacher3.png"
    },
    stats: {
      likes: 3456,
      comments: 234,
      shares: 123
    }
  },
  {
    id: 4,
    question: "What is the traditional Korean house called?",
    options: ["Hanok", "Pagoda", "Yurt", "Villa"],
    correctAnswer: 0,
    author: {
      name: "Culture Guide",
      avatar: "/avatars/teacher4.png"
    },
    stats: {
      likes: 2789,
      comments: 167,
      shares: 89
    }
  },
  {
    id: 5,
    question: "Which of these is a popular Korean side dish?",
    options: ["Kimchi", "Sushi", "Pad Thai", "Pho"],
    correctAnswer: 0,
    author: {
      name: "Food Master",
      avatar: "/avatars/teacher3.png"
    },
    stats: {
      likes: 1987,
      comments: 145,
      shares: 67
    }
  },
  {
    id: 6,
    question: "What is the Korean currency called?",
    options: ["Yen", "Won", "Yuan", "Baht"],
    correctAnswer: 1,
    author: {
      name: "Culture Guide",
      avatar: "/avatars/teacher4.png"
    },
    stats: {
      likes: 1567,
      comments: 98,
      shares: 34
    }
  }
]
