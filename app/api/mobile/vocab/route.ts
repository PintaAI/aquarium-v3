import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get("collectionId");
    const type = searchParams.get("type") as "WORD" | "SENTENCE" | null;
    const search = searchParams.get("search");

    // If collectionId is provided, get items from that collection
    if (collectionId) {
      // Query items from the collection
      const items = await db.vocabularyItem.findMany({
        where: {
          collectionId: parseInt(collectionId),
          ...(type ? { type } : {})
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json({ success: true, data: items });
    }

    // If search query is provided
    if (search) {
      const items = await db.vocabularyItem.findMany({
        where: {
          OR: [
            { korean: { contains: search, mode: 'insensitive' } },
            { indonesian: { contains: search, mode: 'insensitive' } },
          ]
        },
        include: {
          collection: {
            select: {
              title: true
            }
          }
        },
        take: 50
      });

      return NextResponse.json({ success: true, data: items });
    }

    // Get vocabulary type from query params (WORD or SENTENCE)
    const vocabType = searchParams.get("type") as "WORD" | "SENTENCE" | null;

    // Get collections with filtered items based on type
    const collections = await db.vocabularyCollection.findMany({
      where: {
        // Only include collections that have items of the requested type
        items: vocabType ? {
          some: {
            type: vocabType
          }
        } : undefined
      },
      include: {
        items: {
          where: {
            // Filter items by type if specified
            ...(vocabType ? { type: vocabType } : {})
          },
          select: {
            id: true,
            korean: true,
            indonesian: true,
            isChecked: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            collectionId: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out collections with no items

    
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error("[API_VOCABULARY_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vocabulary data" },
      { status: 500 }
    );
  }
}
