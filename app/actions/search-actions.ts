'use server'

import { db } from "@/lib/db";

export interface SearchResult {
  id: string;
  title: string;
  type: 'article' | 'course' | 'game';
  url: string;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search articles
  const articles = await db.article.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
    }
  });

  results.push(...articles.map(article => ({
    id: article.id.toString(),
    title: article.title,
    type: 'article' as const,
    url: `/artikel/${article.id}`
  })));

  // Search courses
  const courses = await db.course.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
    }
  });

  results.push(...courses.map(course => ({
    id: course.id.toString(),
    title: course.title,
    type: 'course' as const,
    url: `/courses/${course.id}`
  })));

  // Add static game results if query matches
  const games = [
    { id: 'hangeul', title: 'Hangeul Game', url: '/game/hangeul' },
    { id: 'tts', title: 'Text to Speech', url: '/game/tts' },
    { id: 'advanced-translate', title: 'Advanced Translate', url: '/game/advanced-translate' },
    { id: 'toro-toro', title: 'Toro Toro Game', url: '/game/toro-toro' },
    { id: 'e-book', title: 'E-Book Reader', url: '/game/e-book' },
    { id: 'ujian-sertifikat', title: 'Ujian Sertifikat', url: '/game/ujian-sertifikat' },
  ];

  const matchingGames = games.filter(game => 
    game.title.toLowerCase().includes(query.toLowerCase())
  );

  results.push(...matchingGames.map(game => ({
    ...game,
    type: 'game' as const
  })));

  return results;
}
