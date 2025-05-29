import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/courses/[id]
// Fetch a specific course with detailed information
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseIdParam } = await params;
    console.log(`📚 Starting course fetch for ID: ${courseIdParam}`);
    
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

    const courseId = parseInt(courseIdParam);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            isCompleted: true,
            isLocked: true
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
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform data to match expected format
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      jsonDescription: course.jsonDescription,
      htmlDescription: course.htmlDescription,
      level: course.level,
      thumbnail: course.thumbnail,
      icon: course.icon,
      isCompleted: course.isCompleted,
      isLocked: course.isLocked,
      author: course.author,
      modules: course.modules,
      isJoined: course.members.length > 0,
      totalMembers: course._count.members,
      totalModules: course._count.modules,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };

    console.log(`✅ Retrieved course: ${course.title}`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCourse 
    });

  } catch (error) {
    console.error("[API_COURSE_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/courses/[id]
// Update a course (only by author)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseIdParam } = await params;
    console.log(`✏️ Starting course update for ID: ${courseIdParam}`);
    
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

    const courseId = parseInt(courseIdParam);
    const body = await req.json();

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Check if course exists and user is the author
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      select: { authorId: true, title: true }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existingCourse.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own courses' },
        { status: 403 }
      );
    }

    // Update the course
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        ...body,
        updatedAt: new Date()
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

    console.log(`✅ Updated course: ${updatedCourse.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        level: updatedCourse.level,
        isLocked: updatedCourse.isLocked,
        updatedAt: updatedCourse.updatedAt,
        message: 'Course updated successfully'
      }
    });

  } catch (error) {
    console.error("[API_COURSE_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/courses/[id]
// Delete a course (only by author)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseIdParam } = await params;
    console.log(`🗑️ Starting course deletion for ID: ${courseIdParam}`);
    
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

    const courseId = parseInt(courseIdParam);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Check if course exists and user is the author
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      select: { authorId: true, title: true }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existingCourse.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    // Delete the course
    await db.course.delete({
      where: { id: courseId }
    });

    console.log(`✅ Deleted course: ${existingCourse.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Course deleted successfully'
      }
    });

  } catch (error) {
    console.error("[API_COURSE_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
