import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/vocabulary
// Fetch vocabulary collections with query parameter support
export async function GET(req: NextRequest) {
  try {
    console.log('📚 Starting vocabulary collections fetch...');
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    let user;
    
    try {
      user = await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("publicOnly") === "true";
    const mine = searchParams.get("mine") === "true";

    console.log(`📊 Query params - publicOnly: ${publicOnly}, mine: ${mine}`);

    // Build where conditions based on query parameters
    let whereConditions: any = {};

    if (publicOnly && mine) {
      // Both publicOnly and mine - get public collections OR user's collections
      whereConditions = {
        OR: [
          { isPublic: true },
          { userId: user.sub }
        ]
      };
    } else if (publicOnly) {
      // Only public collections
      whereConditions = { isPublic: true };
    } else if (mine) {
      // Only user's collections
      whereConditions = { userId: user.sub };
    }
    // If neither publicOnly nor mine is specified, return all collections

    const collections = await db.vocabularyCollection.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const transformedCollections = collections.map(collection => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      isPublic: collection.isPublic,
      itemsCount: collection._count.items,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    }));

    console.log(`✅ Retrieved ${transformedCollections.length} vocabulary collections`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCollections 
    });

  } catch (error) {
    console.error("[API_VOCABULARY_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vocabulary collections" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/vocabulary
// Create new vocabulary collection
export async function POST(req: NextRequest) {
  try {
    console.log('📝 Starting vocabulary collection creation...');
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    let user;
    
    try {
      user = await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    const body = await req.json();
    const { title, description, isPublic } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description must be a string' },
        { status: 400 }
      );
    }

    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    console.log(`📊 Creating collection: ${title} (public: ${isPublic || false})`);

    // Create the collection
    const newCollection = await db.vocabularyCollection.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
        userId: user.sub
      }
    });

    console.log(`✅ Created vocabulary collection with ID: ${newCollection.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: newCollection.id,
        message: 'Vocabulary collection created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API_VOCABULARY_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create vocabulary collection" },
      { status: 500 }
    );
  }
}
