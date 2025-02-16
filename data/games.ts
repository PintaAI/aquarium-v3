import { Languages, BookOpen, GraduationCap, Mic, BookText, ScrollText } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
}

export const games: Game[] = [
  {
    id: "ujian-sertifikat",
    title: "Ujian Sertifikat",
    description: "Latihan ujian sertifikasi bahasa Korea dengan format standar",
    icon: ScrollText,
    route: "/game/ujian-sertifikat"
  },
  {
    id: "soal-harian",
    title: "Soal Harian",
    description: "Latihan soal bahasa Korea harian untuk meningkatkan kemampuan",
    icon: GraduationCap,
    route: "/game/soal-harian"
  },
  {
    id: "hangeul",
    title: "Hangeul",
    description: "Pelajari dasar-dasar huruf Korea (Hangeul) dengan cara yang menyenangkan",
    icon: Languages,
    route: "/game/hangeul"
  },
  {
    id: "toro-toro",
    title: "Toro-Toro",
    description: "Permainan tebak kata Korea dengan sistem point",
    icon: BookOpen,
    route: "/game/toro-toro"
  },
  {
    id: "advanced-translate",
    title: "Translate",
    description: "Latihan menerjemahkan kalimat kompleks Korea-Indonesia",
    icon: BookText,
    route: "/game/advanced-translate"
  },
  {
    id: "e-book",
    title: "E-Book",
    description: "Baca buku digital bahasa Korea untuk meningkatkan pemahaman",
    icon: BookText,
    route: "/game/e-book"
  }
];
