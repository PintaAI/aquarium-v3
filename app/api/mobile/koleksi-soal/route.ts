import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";
import { Difficulty } from "@prisma/client";

// GET /api/mobile/koleksi-soal
// Fetch question collections with query parameter support

interface WhereConditions {
  authorId?: string;
  isPrivate?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    console.log('📚 Starting koleksi soal fetch...');
    
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
    const mine = searchParams.get("mine") === "true";
    const publicOnly = searchParams.get("publicOnly") === "true";

    console.log(`📊 Query params - mine: ${mine}, publicOnly: ${publicOnly}`);

    // Build where conditions based on query parameters
    let whereConditions: WhereConditions = {};

    if (publicOnly && mine) {
      // Both publicOnly and mine - get public collections OR user's collections
      whereConditions = {
        OR: [
          { isPrivate: false },
          { authorId: user.sub }
        ]
      } as any;
    } else if (publicOnly) {
      // Only public collections
      whereConditions = { isPrivate: false };
    } else if (mine) {
      // Only user's collections
      whereConditions = { authorId: user.sub };
    }
    // If neither publicOnly nor mine is specified, return all public collections + user's collections
    if (!publicOnly && !mine) {
      whereConditions = {
        OR: [
          { isPrivate: false },
          { authorId: user.sub }
        ]
      } as any;
    }

    const koleksiSoals = await db.koleksiSoal.findMany({
      where: whereConditions,
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            soals: true,
            tryouts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const transformedKoleksiSoals = koleksiSoals.map(koleksi => ({
      id: koleksi.id,
      nama: koleksi.nama,
      deskripsi: koleksi.deskripsi,
      isPrivate: koleksi.isPrivate,
      soalsCount: koleksi._count.soals,
      tryoutsCount: koleksi._count.tryouts,
      createdAt: koleksi.createdAt,
      updatedAt: koleksi.updatedAt
    }));

    console.log(`✅ Retrieved ${transformedKoleksiSoals.length} koleksi soal`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedKoleksiSoals 
    });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch koleksi soal" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/koleksi-soal
// Create new question collection
export async function POST(req: NextRequest) {
  try {
    console.log('📝 Starting koleksi soal creation...');
    
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
    const { nama, deskripsi, isPrivate } = body;

    // Validate required fields
    if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nama is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate optional fields
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

    console.log(`📊 Creating koleksi soal: ${nama} (private: ${isPrivate || false})`);

    // Create the collection
    const newKoleksiSoal = await db.koleksiSoal.create({
      data: {
        nama: nama.trim(),
        deskripsi: deskripsi?.trim() || null,
        isPrivate: isPrivate || false
      }
    });

    console.log(`✅ Created koleksi soal with ID: ${newKoleksiSoal.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: newKoleksiSoal.id,
        message: 'Koleksi soal created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API_KOLEKSI_SOAL_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create koleksi soal" },
      { status: 500 }
    );
  }
}
