import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";
import { Difficulty } from "@prisma/client";

// GET /api/mobile/koleksi-soal/[id]/soal
// Get questions in a collection
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: koleksiIdParam } = await params;
    console.log(`📚 Starting soals fetch for koleksi ID: ${koleksiIdParam}...`);
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    let _user;
    
    try {
      _user = await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    // Validate ID
    const koleksiId = parseInt(koleksiIdParam);
    if (isNaN(koleksiId) || koleksiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const includeInactive = searchParams.get("includeInactive") === "true";
    const includeOpsis = searchParams.get("includeOpsis") !== "false"; // Default to true

    // Check if collection exists
    const koleksiSoal = await db.koleksiSoal.findUnique({
      where: { id: koleksiId }
    });

    if (!koleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      );
    }

    // Build where conditions
    const whereConditions: Record<string, unknown> = {
      koleksiId: koleksiId
    };

    if (!includeInactive) {
      whereConditions.isActive = true;
    }

    if (difficulty) {
      const upperDifficulty = difficulty.toUpperCase();
      if (upperDifficulty === 'BEGINNER' || upperDifficulty === 'INTERMEDIATE' || upperDifficulty === 'ADVANCED') {
        whereConditions.difficulty = upperDifficulty as Difficulty;
      }
    }

    // Get questions
    const soals = await db.soal.findMany({
      where: whereConditions,
      select: {
        id: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Retrieved ${soals.length} soals from koleksi: ${koleksiSoal.nama}`);
    
    return NextResponse.json({ 
      success: true, 
      data: soals 
    });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_ID_SOAL_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch soals" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/koleksi-soal/[id]/soal
// Add question to collection
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: koleksiIdParam } = await params;
    console.log(`📝 Starting soal creation for koleksi ID: ${koleksiIdParam}...`);
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    let _user;
    
    try {
      _user = await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    // Validate ID
    const koleksiId = parseInt(koleksiIdParam);
    if (isNaN(koleksiId) || koleksiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
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
      opsis 
    } = body;

    // Validate required fields
    if (!pertanyaan || typeof pertanyaan !== 'string' || pertanyaan.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pertanyaan is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate optional fields
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

    // Validate opsis if provided
    if (opsis !== undefined) {
      if (!Array.isArray(opsis)) {
        return NextResponse.json(
          { success: false, error: 'opsis must be an array' },
          { status: 400 }
        );
      }

      for (let i = 0; i < opsis.length; i++) {
        const opsi = opsis[i];
        if (!opsi.opsiText || typeof opsi.opsiText !== 'string' || opsi.opsiText.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: `Option ${i + 1}: opsiText is required and must be a non-empty string` },
            { status: 400 }
          );
        }
        if (typeof opsi.isCorrect !== 'boolean') {
          return NextResponse.json(
            { success: false, error: `Option ${i + 1}: isCorrect must be a boolean` },
            { status: 400 }
          );
        }
      }

      // Check if at least one option is correct
      const hasCorrectOption = opsis.some((opsi: { isCorrect: boolean }) => opsi.isCorrect);
      if (!hasCorrectOption) {
        return NextResponse.json(
          { success: false, error: 'At least one option must be marked as correct' },
          { status: 400 }
        );
      }
    }

    // Check if collection exists
    const koleksiSoal = await db.koleksiSoal.findUnique({
      where: { id: koleksiId }
    });

    if (!koleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      );
    }

    console.log(`📊 Creating soal for koleksi: ${koleksiSoal.nama}`);

    // Create the soal with opsis in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the soal
      const newSoal = await tx.soal.create({
        data: {
          koleksiId: koleksiId,
          authorId: _user.sub,
          pertanyaan: pertanyaan.trim(),
          attachmentUrl: attachmentUrl?.trim() || null,
          attachmentType: attachmentType?.trim() || null,
          difficulty: difficulty ? (difficulty.toUpperCase() as Difficulty) : null,
          explanation: explanation?.trim() || null
        }
      });

      // Create opsis if provided
      if (opsis && opsis.length > 0) {
        await tx.opsi.createMany({
          data: opsis.map((opsi: { opsiText: string; isCorrect: boolean }) => ({
            soalId: newSoal.id,
            opsiText: opsi.opsiText.trim(),
            isCorrect: opsi.isCorrect
          }))
        });
      }

      return newSoal;
    });

    console.log(`✅ Created soal with ID: ${result.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        message: 'Soal created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_ID_SOAL_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create soal" },
      { status: 500 }
    );
  }
}
