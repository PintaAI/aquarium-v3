import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// PATCH /api/mobile/opsi/[id]
// Update option
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📝 Starting opsi update for ID: ${id}...`);
    
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
    const opsiId = parseInt(id);
    if (isNaN(opsiId) || opsiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid opsi ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { opsiText, isCorrect } = body;

    // Validate fields
    if (opsiText !== undefined && (typeof opsiText !== 'string' || opsiText.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'opsiText must be a non-empty string' },
        { status: 400 }
      );
    }

    if (isCorrect !== undefined && typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isCorrect must be a boolean' },
        { status: 400 }
      );
    }

    // Check if opsi exists and user has permission
    const existingOpsi = await db.opsi.findUnique({
      where: { id: opsiId },
      include: {
        soal: {
          include: {
            author: true
          }
        }
      }
    });

    if (!existingOpsi) {
      return NextResponse.json(
        { success: false, error: 'Opsi not found' },
        { status: 404 }
      );
    }

    // Check if user is the author of the soal
    if (existingOpsi.soal.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only modify options of your own soals' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Record<string, string | boolean> = {};
    if (opsiText !== undefined) updateData.opsiText = opsiText.trim();
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect;

    // Update the opsi
    const updatedOpsi = await db.opsi.update({
      where: { id: opsiId },
      data: updateData
    });

    console.log(`✅ Updated opsi: ${updatedOpsi.opsiText.substring(0, 50)}...`);
    
    return NextResponse.json({
      success: true,
      data: updatedOpsi,
      message: 'Opsi updated successfully'
    });

  } catch (error) {
    console.error("[API_OPSI_ID_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update opsi" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/opsi/[id]
// Delete option
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ Starting opsi deletion for ID: ${id}...`);
    
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
    const opsiId = parseInt(id);
    if (isNaN(opsiId) || opsiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid opsi ID' },
        { status: 400 }
      );
    }

    // Check if opsi exists and user has permission
    const existingOpsi = await db.opsi.findUnique({
      where: { id: opsiId },
      include: {
        soal: {
          include: {
            author: true,
            _count: {
              select: {
                opsis: true
              }
            }
          }
        }
      }
    });

    if (!existingOpsi) {
      return NextResponse.json(
        { success: false, error: 'Opsi not found' },
        { status: 404 }
      );
    }

    // Check if user is the author of the soal
    if (existingOpsi.soal.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only delete options of your own soals' },
        { status: 403 }
      );
    }

    // Check if this is the last option (prevent deletion if it would leave the question without options)
    if (existingOpsi.soal._count.opsis <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last option of a question' },
        { status: 400 }
      );
    }

    // If this is the only correct option, prevent deletion
    if (existingOpsi.isCorrect) {
      const correctOptionsCount = await db.opsi.count({
        where: {
          soalId: existingOpsi.soalId,
          isCorrect: true
        }
      });

      if (correctOptionsCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the only correct option of a question' },
          { status: 400 }
        );
      }
    }

    // Delete the opsi
    await db.opsi.delete({
      where: { id: opsiId }
    });

    console.log(`✅ Deleted opsi: ${existingOpsi.opsiText.substring(0, 50)}...`);
    
    return NextResponse.json({
      success: true,
      message: 'Opsi deleted successfully'
    });

  } catch (error) {
    console.error("[API_OPSI_ID_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete opsi" },
      { status: 500 }
    );
  }
}
