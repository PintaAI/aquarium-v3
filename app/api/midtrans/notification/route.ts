import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/lib/db'; // Assuming you use db.ts for Prisma client
import { UserPlan } from '@prisma/client'; // Import UserPlan enum

// Initialize Midtrans Core API client (needed for notification verification)
// Note: Use CoreApi for notification verification as per docs/examples
const apiClient = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!, // Client key might not be strictly needed here, but good practice
});

// Define a type for Midtrans API errors (similar to create-transaction)
interface MidtransError extends Error {
  ApiResponse?: {
    status_code?: string;
    status_message?: string;
    error_messages?: string[];
    // Add other relevant properties if needed
  };
}

export async function POST(req: Request) {
  try {
    const notificationJson = await req.json();
    console.log('Received Midtrans Notification:', JSON.stringify(notificationJson, null, 2));

    // Verify the notification authenticity
    const statusResponse = await apiClient.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(`Notification verified. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}. Payment Type: ${paymentType}`);

    // --- TODO: Implement robust logic based on transaction status ---
    let userPlanUpdate: UserPlan | null = null;
    let subscriptionStatusUpdate: string | null = null; // Added for Subscription model status
    let setStartDate: boolean = false; // Flag to set start date on success

    if (transactionStatus === 'capture') {
      // For card payments, capture means payment is successful, but check fraud status
      if (fraudStatus === 'accept') {
        // Payment successful and accepted
        userPlanUpdate = UserPlan.PREMIUM;
        subscriptionStatusUpdate = 'SUCCESS';
        setStartDate = true;
        console.log(`Order ID ${orderId}: Payment captured and accepted. Updating status to SUCCESS.`);
      } else if (fraudStatus === 'challenge') {
        // Payment requires manual review (challenge)
        subscriptionStatusUpdate = 'CHALLENGE';
        console.log(`Order ID ${orderId}: Payment captured but requires challenge. Updating status to CHALLENGE.`);
      }
    } else if (transactionStatus === 'settlement') {
      // For non-card payments, settlement means payment is successful
      userPlanUpdate = UserPlan.PREMIUM;
      subscriptionStatusUpdate = 'SUCCESS';
      setStartDate = true;
      console.log(`Order ID ${orderId}: Payment settled. Updating status to SUCCESS.`);
    } else if (transactionStatus === 'pending') {
      // Payment is pending (e.g., waiting for bank transfer)
      subscriptionStatusUpdate = 'PENDING';
      console.log(`Order ID ${orderId}: Payment pending. Status remains PENDING.`);
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire' || transactionStatus === 'deny') {
      // Payment failed or was cancelled/expired
      subscriptionStatusUpdate = 'FAILED'; // Map all these to FAILED
      console.log(`Order ID ${orderId}: Payment failed/cancelled/expired (${transactionStatus}). Updating status to FAILED.`);
    }

    // If payment was successful, update the user's plan
    if (userPlanUpdate) {
      // Extract userId from orderId (assuming format SUB-PLAN-userId-timestamp)
      const parts = orderId.split('-');
      if (parts.length >= 4 && parts[0] === 'SUB') {
        const userId = parts[2]; // Adjust index if your format differs

        // Update Subscription model status
        if (subscriptionStatusUpdate) {
          await db.subscription.update({
            where: { midtransOrderId: orderId },
            data: {
              status: subscriptionStatusUpdate,
              startDate: setStartDate ? new Date() : undefined, // Set start date only on success
            },
          });
           console.log(`Subscription ${orderId} status updated to ${subscriptionStatusUpdate}.`);
        }

        // Update User model only if payment was successful
        if (userPlanUpdate) {
          await db.user.update({
          where: { id: userId },
            data: { plan: userPlanUpdate },
          });
          console.log(`User ${userId} plan updated to ${userPlanUpdate}.`);
        }

      } else {
        console.error(`Could not extract userId from orderId: ${orderId}. User plan not updated.`);
        // Potentially return a different status if orderId format is critical
      }
    }

    // Respond to Midtrans with 200 OK to acknowledge receipt
    return new NextResponse('Notification received successfully.', { status: 200 });

  } catch (error) {
    console.error('[MIDTRANS_NOTIFICATION_ERROR]', error);
     // Check if the error is from Midtrans API during verification
    if (error instanceof Error && 'ApiResponse' in error) {
        const midtransError = error as MidtransError; // Use the defined type
        console.error('Midtrans API Error during notification verification:', midtransError.ApiResponse);
        // Access properties safely using optional chaining
        const statusMessage = midtransError.ApiResponse?.status_message;
        const errorMessage = statusMessage || error.message;
        // Respond with an error status, Midtrans might retry
        return new NextResponse(`Midtrans Verification Error: ${errorMessage}`, { status: 500 });
    }
    // Respond with an error status for other internal errors
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
