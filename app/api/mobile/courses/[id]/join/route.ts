import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// POST /api/mobile/courses/[id]/join
// Join a course
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseIdParam } = await params;
    console.log(`📝 Starting course join for ID: ${courseIdParam}`);
    
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

    // Check if course exists and is not locked
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        title: true, 
        isLocked: true,
        authorId: true,
        members: {
          where: { id: user.sub },
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Course is locked and not available for joining' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    if (course.members.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already a member of this course' },
        { status: 400 }
      );
    }

    // Check if user is the author (authors are automatically members)
    if (course.authorId === user.sub) {
      return NextResponse.json(
        { success: false, error: 'You cannot join your own course as you are the author' },
        { status: 400 }
      );
    }

    // Add user to course members
    await db.course.update({
      where: { id: courseId },
      data: {
        members: {
          connect: { id: user.sub }
        }
      }
    });

    console.log(`✅ User ${user.sub} joined course: ${course.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully joined the course'
      }
    });

  } catch (error) {
    console.error("[API_COURSE_JOIN]", error);
    return NextResponse.json(
      { success: false, error: "Failed to join course" },
      { status: 500 }
    );
  }
}

// DELETE /api/mobile/courses/[id]/join
// Leave a course
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseIdParam } = await params;
    console.log(`🚪 Starting course leave for ID: ${courseIdParam}`);
    
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

    // Check if course exists and user is a member
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        title: true,
        authorId: true,
        members: {
          where: { id: user.sub },
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the author (authors cannot leave their own course)
    if (course.authorId === user.sub) {
      return NextResponse.json(
        { success: false, error: 'You cannot leave your own course as you are the author' },
        { status: 400 }
      );
    }

    // Check if user is actually a member
    if (course.members.length === 0) {
      return NextResponse.json(
        { success: false, error: 'You are not a member of this course' },
        { status: 400 }
      );
    }

    // Remove user from course members
    await db.course.update({
      where: { id: courseId },
      data: {
        members: {
          disconnect: { id: user.sub }
        }
      }
    });

    console.log(`✅ User ${user.sub} left course: ${course.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully left the course'
      }
    });

  } catch (error) {
    console.error("[API_COURSE_LEAVE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to leave course" },
      { status: 500 }
    );
  }
}
