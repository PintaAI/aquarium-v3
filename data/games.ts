import { Languages, BookOpen, GraduationCap, Mic, BookText } from "lucide-react";
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
    id: "hangeul",
    title: "Belajar Hangeul",
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
    id: "eps-topik",
    title: "EPS-TOPIK Practice",
    description: "Latihan soal untuk persiapan ujian EPS-TOPIK",
    icon: GraduationCap,
    route: "/game/eps-topik"
  },
  {
    id: "pronounce", 
    title: "Pronunciation Master",
    description: "Latihan pengucapan kata-kata Korea dengan benar",
    icon: Mic,
    route: "/game/pronounce"
  },
  {
    id: "advanced-translate",
    title: "Advanced Translate",
    description: "Latihan menerjemahkan kalimat kompleks Korea-Indonesia",
    icon: BookText,
    route: "/game/advanced-translate"
  }
];
