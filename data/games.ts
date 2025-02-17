import { Languages, BookOpen, GraduationCap, BookText, ScrollText } from "lucide-react";
import { TbAlphabetKorean } from "react-icons/tb";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { FaKeyboard } from "react-icons/fa";

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon | IconType;
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
    title: "HanRush",
    description: "Pelajari dasar-dasar huruf Korea (Hangeul) dengan cara yang menyenangkan",
    icon: TbAlphabetKorean,
    route: "/game/hangeul"
  },
  {
    id: "toro-toro",
    title: "Toro-Toro",
    description: "Permainan tebak kata Korea dengan sistem point",
    icon: FaKeyboard,
    route: "/game/toro-toro"
  },
  {
    id: "advanced-translate",
    title: "Translate",
    description: "Latihan menerjemahkan kalimat kompleks Korea-Indonesia",
    icon: Languages,
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
