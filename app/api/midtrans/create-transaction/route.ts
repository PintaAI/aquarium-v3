import { NextResponse } from 'next/server';
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


export async function POST() { // Removed unused 'req' parameter
  try {
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

    // --- TODO: Define subscription details ---
    const subscriptionPlan = 'PREMIUM'; // Or get from request body if multiple plans exist
    const price = 100000; // Example price in IDR (e.g., 100,000 IDR) - Replace with actual price
    const itemName = 'Premium Subscription - 1 Month'; // Example item name
    // ---

    // Generate a unique order ID
    const orderId = `SUB-${subscriptionPlan}-${user.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      item_details: [{
        id: `PLAN-${subscriptionPlan}`,
        price: price,
        quantity: 1,
        name: itemName,
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
        plan: UserPlan.PREMIUM, // Use the enum value
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
