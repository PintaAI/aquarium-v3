"use client"

import Link from "next/link"

const gameList = [
  {
    name: "Advanced Translate",
    description: "Latihan menerjemahkan kalimat bahasa Korea",
    path: "/game/advanced-translate"
  },
  {
    name: "EPS-TOPIK", 
    description: "Latihan soal EPS-TOPIK",
    path: "/game/eps-topik"
  },
  {
    name: "Hangeul",
    description: "Belajar menulis huruf Korea",
    path: "/game/hangeul"
  },
  {
    name: "Pronounce",
    description: "Latihan pengucapan bahasa Korea",
    path: "/game/pronounce"
  },
  {
    name: "Toro-toro",
    description: "Game tebak kata bahasa Korea",
    path: "/game/toro-toro"
  }
]

export function GameSidebarContent() {
  return (
    <>
      {gameList.map((game) => (
        <Link
          href={game.path}
          key={game.name}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium">{game.name}</span>
          </div>
          <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
            {game.description}
          </span>
        </Link>
      ))}
    </>
  )
}
