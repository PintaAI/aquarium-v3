import { Languages, BookOpen, GraduationCap, BookText, ScrollText } from "lucide-react";
import { TbAlphabetKorean } from "react-icons/tb";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { FaKeyboard } from "react-icons/fa";
import { VscTable } from "react-icons/vsc";

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon | IconType;
  route: string;
  type: string;
}

export const games: Game[] = [
  {
    id: "tryout",
    title: "Tryout",
    description: "Ujian percobaan dengan sistem real-time dan leaderboard",
    icon: GraduationCap,
    route: "/tryout",
    type: "App"
  },
  {
    id: "Soal",
    title: "Soal",
    description: "Latihan ujian bahasa Korea dengan format standar",
    icon: ScrollText,
    type: "App",
    route: "/soal"
  },
  {
    id: "TTS",
    title: "TTS",
    description: "Carilah kata-kata dalam papan permainan TTS",
    icon: VscTable,
    route: "/game/tts",
    type: "App"
  },
  {
    id: "hangeul",
    title: "HanRush",
    description: "Pelajari dasar-dasar huruf Korea (Hangeul)",
    icon: TbAlphabetKorean,
    route: "/game/hangeul",
    type: "Game"
  },
  {
    id: "toro-toro",
    title: "Toro",
    description: "Permainan tebak kata Korea dengan sistem point",
    icon: FaKeyboard,
    route: "/game/toro-toro",
    type: "Game"
  },
  {
    id: "advanced-translate",
    title: "Translate",
    description: "Latihan menerjemahkan kalimat kompleks Korea-Indonesia",
    icon: Languages,
    route: "/game/advanced-translate",
    type: "App"
  },
  {
    id: "e-book",
    title: "E-Book",
    description: "Baca buku digital bahasa Korea untuk meningkatkan pemahaman",
    icon: BookText,
    route: "/game/e-book",
    type: "Resource"
  }
];
