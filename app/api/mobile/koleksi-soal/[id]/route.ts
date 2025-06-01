import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";
import { Difficulty } from "@prisma/client";

// GET /api/mobile/koleksi-soal/[id]
// Fetch specific question collection with questions
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📚 Starting koleksi soal fetch for ID: ${params.id}...`);
    
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
    const koleksiId = parseInt(params.id);
    if (isNaN(koleksiId) || koleksiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeSoals = searchParams.get("includeSoals") !== "false"; // Default to true

    // Find the collection
    const koleksiSoal = await db.koleksiSoal.findUnique({
      where: { id: koleksiId },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        soals: includeSoals ? {
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
            opsis: {
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
            },
            _count: {
              select: {
                opsis: true
              }
            }
          },
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        } : false,
        _count: {
          select: {
            soals: true,
            tryouts: true
          }
        }
      }
    });

    if (!koleksiSoal) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      );
    }

    // Check access permissions (private collections can only be accessed by creators for now)
    // Note: This might need to be adjusted based on your business logic
    if (koleksiSoal.isPrivate) {
      // For now, we'll allow access to private collections since we don't have authorId in KoleksiSoal
      // You might want to add authorId to KoleksiSoal schema or implement different access logic
      console.log('⚠️ Private collection access - implement proper authorization');
    }

    console.log(`✅ Retrieved koleksi soal: ${koleksiSoal.nama}`);
    
    return NextResponse.json({ 
      success: true, 
      data: koleksiSoal 
    });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_ID_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch koleksi soal" },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/koleksi-soal/[id]
// Update question collection metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 Starting koleksi soal update for ID: ${params.id}...`);
    
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
    const koleksiId = parseInt(params.id);
    if (isNaN(koleksiId) || koleksiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { nama, deskripsi, isPrivate } = body;

    // Validate fields
    if (nama !== undefined && (typeof nama !== 'string' || nama.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Nama must be a non-empty string' },
        { status: 400 }
      );
    }

    if (deskripsi !== undefined && typeof deskripsi !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Deskripsi must be a string' },
        { status: 400 }
      );
    }

    if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isPrivate must be a boolean' },
        { status: 400 }
      );
    }

    // Check if collection exists
    const existingKoleksi = await db.koleksiSoal.findUnique({
      where: { id: koleksiId }
    });

    if (!existingKoleksi) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama.trim();
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() || null;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    // Update the collection
    const updatedKoleksi = await db.koleksiSoal.update({
      where: { id: koleksiId },
      data: updateData
    });

    console.log(`✅ Updated koleksi soal: ${updatedKoleksi.nama}`);
    
    return NextResponse.json({
      success: true,
      data: updatedKoleksi,
      message: 'Koleksi soal updated successfully'
    });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_ID_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update koleksi soal" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/koleksi-soal/[id]
// Delete question collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Starting koleksi soal deletion for ID: ${params.id}...`);
    
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
    const koleksiId = parseInt(params.id);
    if (isNaN(koleksiId) || koleksiId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid koleksi soal ID' },
        { status: 400 }
      );
    }

    // Check if collection exists and get related data
    const existingKoleksi = await db.koleksiSoal.findUnique({
      where: { id: koleksiId },
      include: {
        _count: {
          select: {
            soals: true,
            tryouts: true
          }
        }
      }
    });

    if (!existingKoleksi) {
      return NextResponse.json(
        { success: false, error: 'Koleksi soal not found' },
        { status: 404 }
      );
    }

    // Check if there are active tryouts using this collection
    if (existingKoleksi._count.tryouts > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete koleksi soal that is being used in tryouts' },
        { status: 400 }
      );
    }

    // Delete the collection (this will cascade delete soals and opsis due to foreign key constraints)
    await db.koleksiSoal.delete({
      where: { id: koleksiId }
    });

    console.log(`✅ Deleted koleksi soal: ${existingKoleksi.nama}`);
    
    return NextResponse.json({
      success: true,
      message: 'Koleksi soal deleted successfully'
    });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_ID_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete koleksi soal" },
      { status: 500 }
    );
  }
}
