import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/modules/[id]
// Fetch a specific module with detailed information
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleIdParam } = await params;
    console.log(`📖 Starting module fetch for ID: ${moduleIdParam}`);
    
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

    const moduleId = parseInt(moduleIdParam);

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid module ID' },
        { status: 400 }
      );
    }

    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            authorId: true,
            members: {
              where: { id: user.sub },
              select: { id: true }
            }
          }
        },
        completions: {
          where: { userId: user.sub },
          select: {
            isCompleted: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this module (is course member or author)
    const isCourseAuthor = moduleData.course.authorId === user.sub;
    const isCourseMember = moduleData.course.members.length > 0;
    
    if (!isCourseAuthor && !isCourseMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You must be enrolled in the course to view this module.' },
        { status: 403 }
      );
    }

    // Get user's completion status for this module
    const userCompletion = moduleData.completions[0];

    // Transform data to match expected format
    const transformedModule = {
      id: moduleData.id,
      title: moduleData.title,
      description: moduleData.description,
      jsonDescription: moduleData.jsonDescription,
      htmlDescription: moduleData.htmlDescription,
      order: moduleData.order,
      isCompleted: moduleData.isCompleted,
      isLocked: moduleData.isLocked,
      courseId: moduleData.courseId,
      course: {
        id: moduleData.course.id,
        title: moduleData.course.title
      },
      userCompletion: userCompletion ? {
        isCompleted: userCompletion.isCompleted,
        completedAt: userCompletion.updatedAt
      } : null,
      createdAt: moduleData.createdAt,
      updatedAt: moduleData.updatedAt
    };

    console.log(`✅ Retrieved module: ${moduleData.title}`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedModule 
    });

  } catch (error) {
    console.error("[API_MODULE_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// PATCH /api/mobile/modules/[id]
// Update a module (only by course author)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleIdParam } = await params;
    console.log(`✏️ Starting module update for ID: ${moduleIdParam}`);
    
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

    const moduleId = parseInt(moduleIdParam);
    const body = await req.json();

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid module ID' },
        { status: 400 }
      );
    }

    // Check if module exists and user is the course author
    const existingModule = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: { authorId: true, title: true }
        }
      }
    });

    if (!existingModule) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    if (existingModule.course.authorId !== user.sub) {
      return NextResponse.json(
        { success: false, error: 'You can only update modules in your own courses' },
        { status: 403 }
      );
    }

    // Update the module
    const updatedModule = await db.module.update({
      where: { id: moduleId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Updated module: ${updatedModule.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedModule.id,
        title: updatedModule.title,
        description: updatedModule.description,
        order: updatedModule.order,
        isLocked: updatedModule.isLocked,
        updatedAt: updatedModule.updatedAt,
        message: 'Module updated successfully'
      }
    });

  } catch (error) {
    console.error("[API_MODULE_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// PUT /api/mobile/modules/[id]/completion
// Mark module as completed/uncompleted
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleIdParam } = await params;
    const { isCompleted } = await req.json();
    
    console.log(`✅ Updating completion status for module ID: ${moduleIdParam}`);
    
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

    const moduleId = parseInt(moduleIdParam);

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid module ID' },
        { status: 400 }
      );
    }

    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isCompleted must be a boolean' },
        { status: 400 }
      );
    }

    // Check if module exists and user has access
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            authorId: true,
            members: {
              where: { id: user.sub },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!moduleData) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this module
    const isCourseAuthor = moduleData.course.authorId === user.sub;
    const isCourseMember = moduleData.course.members.length > 0;
    
    if (!isCourseAuthor && !isCourseMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You must be enrolled in the course to update module completion.' },
        { status: 403 }
      );
    }

    // Upsert the completion record
    const completion = await db.userModuleCompletion.upsert({
      where: {
        userId_moduleId: {
          userId: user.sub,
          moduleId: moduleId
        }
      },
      update: {
        isCompleted: isCompleted,
        updatedAt: new Date()
      },
      create: {
        userId: user.sub,
        moduleId: moduleId,
        isCompleted: isCompleted
      }
    });

    console.log(`✅ Updated completion status for module: ${moduleData.title}`);
    
    return NextResponse.json({
      success: true,
      data: {
        moduleId: moduleId,
        isCompleted: completion.isCompleted,
        updatedAt: completion.updatedAt,
        message: `Module marked as ${isCompleted ? 'completed' : 'incomplete'}`
      }
    });

  } catch (error) {
    console.error("[API_MODULE_COMPLETION]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module completion" },
      { status: 500 }
    );
  }
}
