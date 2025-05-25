"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function saveDrawing(name: string, elements: string, appState?: string, files?: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  return db.excalidrawDrawing.upsert({
    where: {
      id: `${name}-${user.id}`,
    },
    update: {
      elements,
      appState,
      files,
      updatedAt: new Date(),
    },
    create: {
      id: `${name}-${user.id}`,
      name,
      elements,
      appState,
      files,
      userId: user.id,
    },
  });
}

export async function loadDrawing(id: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  return db.excalidrawDrawing.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function getUserDrawings() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  return db.excalidrawDrawing.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
