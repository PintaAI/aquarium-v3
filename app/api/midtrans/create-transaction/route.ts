import { NextResponse,NextRequest } from 'next/server';
import midtransClient from 'midtrans-client';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { UserPlan } from '@prisma/client'; // Import UserPlan enum

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Define a type for Midtrans API errors
interface MidtransError extends Error {
  ApiResponse?: {
    status_code?: string; // Example property, adjust based on actual API response
    status_message?: string; // Example property
    error_messages?: string[];
    // Add other relevant properties from the Midtrans error response structure
  };
}


export async function POST(req: NextRequest) { // Add req parameter with type
  try {
    // Read data from request body
    const body = await req.json();
    const { planId, amount, planName } = body;

    // Basic validation
    if (!planId || typeof amount !== 'number' || amount <= 0 || !planName) {
      return new NextResponse('Invalid plan details provided', { status: 400 });
    }

    // Validate planId against UserPlan enum (optional but good practice)
    if (!Object.values(UserPlan).includes(planId as UserPlan)) {
       return new NextResponse(`Invalid planId: ${planId}`, { status: 400 });
    }
    const userPlanEnum = planId as UserPlan; // Cast to enum type

    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Use dynamic details from request body
    const price = amount;
    const itemName = planName;
    const subscriptionPlan = planId; // Use planId from request

    // Generate a unique order ID (shortened to avoid length limits)
    // Include planId in orderId for potential future reference
    const orderId = `SUB-${planId}-${user.id.substring(0, 8)}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price, // Use dynamic price
      },
      item_details: [{
        id: `PLAN-${subscriptionPlan}`, // Use dynamic planId
        price: price, // Use dynamic price
        quantity: 1,
        name: itemName, // Use dynamic itemName
      }],
      customer_details: {
        first_name: user.name?.split(' ')[0] || 'User',
        last_name: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        // phone: user.phone, // Add phone if available and required
      },
      // Optional: Add expiry, callbacks, etc.
      // expiry: {
      //   start_time: new Date().toISOString().slice(0, 19) + " +0700", // WIB
      //   unit: "minutes",
      //   duration: 60
      // }
    };

    const transaction = await snap.createTransaction(parameter);
    const transactionToken = transaction.token;

    // Store transaction attempt in DB
    await db.subscription.create({
      data: {
        userId: user.id,
        midtransOrderId: orderId,
        status: 'PENDING', // Initial status
        plan: userPlanEnum, // Use the dynamic enum value from request
        // startDate will be set on successful webhook notification
      }
    });

    console.log('Midtrans Transaction Token:', transactionToken);
    return NextResponse.json({ token: transactionToken });

  } catch (error) {
    console.error('[MIDTRANS_CREATE_TRANSACTION_ERROR]', error);
    // Check if the error is from Midtrans API
    if (error instanceof Error && 'ApiResponse' in error) {
        const midtransError = error as MidtransError; // Use the defined type
        console.error('Midtrans API Error Details:', midtransError.ApiResponse);
        // Access properties safely using optional chaining
        const errorMessages = midtransError.ApiResponse?.error_messages?.join(', ');
        const statusMessage = midtransError.ApiResponse?.status_message;
        const errorMessage = errorMessages || statusMessage || error.message;
        return new NextResponse(`Midtrans Error: ${errorMessage}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
