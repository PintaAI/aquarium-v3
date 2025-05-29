import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";
import { CourseLevel } from "@prisma/client";

// GET /api/mobile/courses
// Fetch courses with query parameter support

interface WhereConditions {
  members?: {
    some: {
      id: string;
    };
  };
  authorId?: string;
  isLocked?: boolean;
  level?: CourseLevel;
}

interface SelectedCourse {
  id: number;
  title: string;
  description: string | null;
  level: CourseLevel;
  thumbnail: string | null;
  icon: string | null;
  isCompleted: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  members: Array<{ id: string }>;
  _count: {
    members: number;
    modules: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    console.log('📚 Starting courses fetch...');
    
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
    const joined = searchParams.get("joined") === "true";
    const level = searchParams.get("level");
    const available = searchParams.get("available") === "true"; // Not locked courses

    console.log(`📊 Query params - mine: ${mine}, joined: ${joined}, level: ${level}, available: ${available}`);

    // Build where conditions based on query parameters
    let whereConditions: WhereConditions = {};

    if (joined) {
      // Get courses user has joined
      whereConditions = {
        members: {
          some: {
            id: user.sub
          }
        }
      };
    } else if (mine) {
      // Only user's authored courses
      whereConditions = { authorId: user.sub };
    } else if (available) {
      // Only courses that are not locked
      whereConditions = { isLocked: false };
    }

    // Add level filter
    if (level) {
      const upperLevel = level.toUpperCase();
      if (upperLevel === 'BEGINNER' || upperLevel === 'INTERMEDIATE' || upperLevel === 'ADVANCED') {
        whereConditions.level = upperLevel as CourseLevel;
      } else {
        // Optionally handle invalid level string, e.g., return a 400 error or log a warning
        console.warn(`Invalid course level provided: ${level}`);
        // Depending on desired behavior, you might want to skip filtering by level or return an error
      }
    }

    const courses = await db.course.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        thumbnail: true,
        icon: true,
        isCompleted: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          where: { id: user.sub },
          select: {
            id: true
          }
        },
        _count: {
          select: {
            members: true,
            modules: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const transformedCourses = courses.map((course: SelectedCourse) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      thumbnail: course.thumbnail,
      icon: course.icon,
      isCompleted: course.isCompleted,
      isLocked: course.isLocked,
      author: course.author,
      isJoined: course.members.length > 0,
      totalMembers: course._count.members,
      totalModules: course._count.modules,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));

    console.log(`✅ Retrieved ${transformedCourses.length} courses`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCourses 
    });

  } catch (error) {
    console.error("[API_COURSES_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/courses
// Create new course
export async function POST(req: NextRequest) {
  try {
    console.log('📝 Starting course creation...');
    
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
    const { 
      title, 
      description, 
      level, 
      thumbnail, 
      icon,
      isLocked
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!level || !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Level is required and must be BEGINNER, INTERMEDIATE, or ADVANCED' },
        { status: 400 }
      );
    }

    console.log(`📊 Creating course: ${title} (${level})`);

    // Create the course
    const newCourse = await db.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        level: level,
        thumbnail: thumbnail || null,
        icon: icon || null,
        isLocked: isLocked || false,
        authorId: user.sub
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Created course with ID: ${newCourse.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: newCourse.id,
        message: 'Course created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[API_COURSES_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}
