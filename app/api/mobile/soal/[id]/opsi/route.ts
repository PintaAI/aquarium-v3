import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// POST /api/mobile/soal/[id]/opsi
// Add option to question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 Starting opsi creation for soal ID: ${id}...`);
    
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
    const soalId = parseInt(id);
    if (isNaN(soalId) || soalId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid soal ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { opsiText, isCorrect } = body;

    // Validate required fields
    if (!opsiText || typeof opsiText !== 'string' || opsiText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'opsiText is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isCorrect must be a boolean' },
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
        { success: false, error: 'You can only add options to your own soals' },
        { status: 403 }
      );
    }

    console.log(`📊 Creating opsi for soal: ${existingSoal.pertanyaan.substring(0, 50)}...`);

    // Create the opsi
    const newOpsi = await db.opsi.create({
      data: {
        soalId: soalId,
        opsiText: opsiText.trim(),
        isCorrect: isCorrect
      }
    });

    console.log(`✅ Created opsi with ID: ${newOpsi.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: newOpsi.id,
        message: 'Opsi created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API_SOAL_ID_OPSI_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create opsi" },
      { status: 500 }
    );
  }
}
