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

export async function deleteDrawing(id: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  return db.excalidrawDrawing.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function renameDrawing(id: string, newName: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if new name would conflict with existing drawing
  const existingDrawing = await db.excalidrawDrawing.findFirst({
    where: {
      id: `${newName}-${user.id}`,
      userId: user.id,
    },
  });

  if (existingDrawing && existingDrawing.id !== id) {
    throw new Error("A drawing with this name already exists");
  }

  // Get the current drawing
  const currentDrawing = await db.excalidrawDrawing.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!currentDrawing) {
    throw new Error("Drawing not found");
  }

  // Delete the old record and create a new one with the new name
  await db.excalidrawDrawing.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  return db.excalidrawDrawing.create({
    data: {
      id: `${newName}-${user.id}`,
      name: newName,
      elements: currentDrawing.elements,
      appState: currentDrawing.appState,
      files: currentDrawing.files,
      userId: user.id,
    },
  });
}

export async function duplicateDrawing(id: string, newName: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if new name would conflict with existing drawing
  const existingDrawing = await db.excalidrawDrawing.findFirst({
    where: {
      id: `${newName}-${user.id}`,
      userId: user.id,
    },
  });

  if (existingDrawing) {
    throw new Error("A drawing with this name already exists");
  }

  // Get the source drawing
  const sourceDrawing = await db.excalidrawDrawing.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!sourceDrawing) {
    throw new Error("Source drawing not found");
  }

  // Create the duplicate
  return db.excalidrawDrawing.create({
    data: {
      id: `${newName}-${user.id}`,
      name: newName,
      elements: sourceDrawing.elements,
      appState: sourceDrawing.appState,
      files: sourceDrawing.files,
      userId: user.id,
    },
  });
}
