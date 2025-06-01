import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";
import { Difficulty } from "@prisma/client";

// GET /api/mobile/soal/[id]
// Get specific question with options
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📚 Starting soal fetch for ID: ${params.id}...`);
    
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

    // Validate ID
    const soalId = parseInt(params.id);
    if (isNaN(soalId) || soalId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeOpsis = searchParams.get("includeOpsis") !== "false"; // Default to true

    // Find the soal
    const soal = await db.soal.findUnique({
      where: { id: soalId },
      select: {
        id: true,
        koleksiId: true,
        pertanyaan: true,
        attachmentUrl: true,
        attachmentType: true,
        difficulty: true,
        explanation: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        koleksiSoal: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
            isPrivate: true
          }
        },
        opsis: includeOpsis ? {
          select: {
            id: true,
            opsiText: true,
            isCorrect: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            id: 'asc'
          }
        } : false,
        _count: {
          select: {
            opsis: true
          }
        }
      }
    });

    if (!soal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      );
    }

    // Check access permissions (private collections can only be accessed by authorized users)
    if (soal.koleksiSoal.isPrivate) {
      // For now, we'll allow access to private collections since we don't have authorId in KoleksiSoal
      // You might want to add authorId to KoleksiSoal schema or implement different access logic
      console.log('⚠️ Private collection access - implement proper authorization');
    }

    console.log(`✅ Retrieved soal: ${soal.pertanyaan.substring(0, 50)}...`);
    
    return NextResponse.json({ 
      success: true, 
      data: soal 
    });

  } catch (error) {
    console.error("[API_SOAL_ID_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch soal" },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/soal/[id]
// Update question
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 Starting soal update for ID: ${params.id}...`);
    
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

    // Validate ID
    const soalId = parseInt(params.id);
    if (isNaN(soalId) || soalId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { 
      pertanyaan, 
      attachmentUrl, 
      attachmentType, 
      difficulty, 
      explanation, 
      isActive 
    } = body;

    // Validate fields
    if (pertanyaan !== undefined && (typeof pertanyaan !== 'string' || pertanyaan.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Pertanyaan must be a non-empty string' },
        { status: 400 }
      );
    }

    if (attachmentUrl !== undefined && typeof attachmentUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'attachmentUrl must be a string' },
        { status: 400 }
      );
    }

    if (attachmentType !== undefined && typeof attachmentType !== 'string') {
      return NextResponse.json(
        { success: false, error: 'attachmentType must be a string' },
        { status: 400 }
      );
    }

    if (difficulty !== undefined) {
      const upperDifficulty = difficulty.toUpperCase();
      if (upperDifficulty !== 'BEGINNER' && upperDifficulty !== 'INTERMEDIATE' && upperDifficulty !== 'ADVANCED') {
        return NextResponse.json(
          { success: false, error: 'difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED' },
          { status: 400 }
        );
      }
    }

    if (explanation !== undefined && typeof explanation !== 'string') {
      return NextResponse.json(
        { success: false, error: 'explanation must be a string' },
        { status: 400 }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // Check if soal exists and user has permission
    const existingSoal = await db.soal.findUnique({
      where: { id: soalId },
      include: {
        author: true
      }
    });

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      );
    }

    // Check if user is the author of the soal
    if (existingSoal.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only modify your own soals' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (pertanyaan !== undefined) updateData.pertanyaan = pertanyaan.trim();
    if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl?.trim() || null;
    if (attachmentType !== undefined) updateData.attachmentType = attachmentType?.trim() || null;
    if (difficulty !== undefined) updateData.difficulty = difficulty ? (difficulty.toUpperCase() as Difficulty) : null;
    if (explanation !== undefined) updateData.explanation = explanation?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update the soal
    const updatedSoal = await db.soal.update({
      where: { id: soalId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        opsis: {
          select: {
            id: true,
            opsiText: true,
            isCorrect: true
          }
        }
      }
    });

    console.log(`✅ Updated soal: ${updatedSoal.pertanyaan.substring(0, 50)}...`);
    
    return NextResponse.json({
      success: true,
      data: updatedSoal,
      message: 'Soal updated successfully'
    });

  } catch (error) {
    console.error("[API_SOAL_ID_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update soal" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/soal/[id]
// Delete question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Starting soal deletion for ID: ${params.id}...`);
    
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

    // Validate ID
    const soalId = parseInt(params.id);
    if (isNaN(soalId) || soalId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      );
    }

    // Check if soal exists and user has permission
    const existingSoal = await db.soal.findUnique({
      where: { id: soalId },
      include: {
        author: true,
        _count: {
          select: {
            opsis: true
          }
        }
      }
    });

    if (!existingSoal) {
      return NextResponse.json(
        { success: false, error: 'Soal not found' },
        { status: 404 }
      );
    }

    // Check if user is the author of the soal
    if (existingSoal.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own soals' },
        { status: 403 }
      );
    }

    // Delete the soal (this will cascade delete opsis due to foreign key constraints)
    await db.soal.delete({
      where: { id: soalId }
    });

    console.log(`✅ Deleted soal: ${existingSoal.pertanyaan.substring(0, 50)}...`);
    
    return NextResponse.json({
      success: true,
      message: 'Soal deleted successfully'
    });

  } catch (error) {
    console.error("[API_SOAL_ID_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete soal" },
      { status: 500 }
    );
  }
}
