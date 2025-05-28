import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
  verifyMobileToken, 
  validateCollectionId, 
  checkCollectionAccess,
  AuthenticationError,
  AuthorizationError 
} from "@/lib/mobile-auth-middleware";

// GET /api/mobile/vocabulary/[id]
// Fetch specific vocabulary collection with items
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📖 Starting specific collection fetch for ID: ${params.id}`);
    
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

    // Validate collection ID
    let collectionId;
    try {
      collectionId = validateCollectionId(params.id);
    } catch (validationError) {
      const statusCode = validationError instanceof AuthenticationError ? validationError.statusCode : 400;
      return NextResponse.json(
        { success: false, error: 'Invalid collection ID' },
        { status: statusCode }
      );
    }

    // Fetch collection with items
    const collection = await db.vocabularyCollection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          select: {
            id: true,
            korean: true,
            indonesian: true,
            isChecked: true,
            type: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!collection) {
      console.warn(`❌ Collection not found: ${collectionId}`);
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this collection
    // Public collections are accessible to everyone
    // Private collections are only accessible to their owners
    if (!collection.isPublic && collection.userId !== user.sub) {
      console.warn(`🚫 Access denied to collection: ${collectionId} for user: ${user.sub}`);
      return NextResponse.json(
        { success: false, error: 'Access denied to this collection' },
        { status: 403 }
      );
    }

    console.log(`✅ Retrieved collection: ${collection.title} with ${collection.items.length} items`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        isPublic: collection.isPublic,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        items: collection.items
      }
    });

  } catch (error) {
    console.error("[API_VOCABULARY_GET_ID]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vocabulary collection" },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/vocabulary/[id]
// Update vocabulary collection metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`✏️ Starting collection update for ID: ${params.id}`);
    
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

    // Validate collection ID
    let collectionId;
    try {
      collectionId = validateCollectionId(params.id);
    } catch (validationError) {
      const statusCode = validationError instanceof AuthenticationError ? validationError.statusCode : 400;
      return NextResponse.json(
        { success: false, error: 'Invalid collection ID' },
        { status: statusCode }
      );
    }

    // Check if collection exists and user owns it
    const existingCollection = await db.vocabularyCollection.findUnique({
      where: { id: collectionId },
      select: { id: true, userId: true, title: true, isPublic: true }
    });

    if (!existingCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    try {
      checkCollectionAccess(existingCollection, user, true); // requireOwnership = true for updates
    } catch (accessError: any) {
      const statusCode = accessError instanceof AuthorizationError ? accessError.statusCode : 403;
      return NextResponse.json(
        { success: false, error: accessError.message || 'Access denied' },
        { status: statusCode }
      );
    }

    const body = await req.json();
    const { title, description, isPublic } = body;

    // Validate updates
    const updates: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Description must be a string' },
          { status: 400 }
        );
      }
      updates.description = description.trim() || null;
    }

    if (isPublic !== undefined) {
      if (typeof isPublic !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isPublic must be a boolean' },
          { status: 400 }
        );
      }
      updates.isPublic = isPublic;
    }

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    console.log(`📊 Updating collection ${collectionId} with:`, updates);

    // Update the collection
    const updatedCollection = await db.vocabularyCollection.update({
      where: { id: collectionId },
      data: updates
    });

    console.log(`✅ Successfully updated collection: ${updatedCollection.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedCollection.id,
        title: updatedCollection.title,
        description: updatedCollection.description,
        isPublic: updatedCollection.isPublic,
        updatedAt: updatedCollection.updatedAt,
        message: 'Collection updated successfully'
      }
    });

  } catch (error) {
    console.error("[API_VOCABULARY_PATCH_ID]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vocabulary collection" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/vocabulary/[id]
// Delete vocabulary collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Starting collection deletion for ID: ${params.id}`);
    
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

    // Validate collection ID
    let collectionId;
    try {
      collectionId = validateCollectionId(params.id);
    } catch (validationError) {
      const statusCode = validationError instanceof AuthenticationError ? validationError.statusCode : 400;
      return NextResponse.json(
        { success: false, error: 'Invalid collection ID' },
        { status: statusCode }
      );
    }

    // Check if collection exists and user owns it
    const existingCollection = await db.vocabularyCollection.findUnique({
      where: { id: collectionId },
      select: { 
        id: true, 
        userId: true, 
        title: true,
        isPublic: true,
        _count: {
          select: { items: true }
        }
      }
    });

    if (!existingCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    try {
      checkCollectionAccess(existingCollection, user, true); // requireOwnership = true for deletion
    } catch (accessError: any) {
      const statusCode = accessError instanceof AuthorizationError ? accessError.statusCode : 403;
      return NextResponse.json(
        { success: false, error: accessError.message || 'Access denied' },
        { status: statusCode }
      );
    }

    console.log(`📊 Deleting collection: ${existingCollection.title} with ${existingCollection._count.items} items`);

    // Delete the collection (this will cascade delete all items due to foreign key constraint)
    await db.vocabularyCollection.delete({
      where: { id: collectionId }
    });

    console.log(`✅ Successfully deleted collection: ${existingCollection.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Collection deleted successfully'
      }
    });

  } catch (error) {
    console.error("[API_VOCABULARY_DELETE_ID]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete vocabulary collection" },
      { status: 500 }
    );
  }
}
