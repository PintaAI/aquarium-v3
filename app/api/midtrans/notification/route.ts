import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/lib/db'; // Assuming you use db.ts for Prisma client
// Removed unused UserPlan import to fix linting

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

    console.log(`Notification received & verified. Order ID: ${orderId}, Transaction Status: ${transactionStatus}, Fraud Status: ${fraudStatus}, Payment Type: ${paymentType}`);

    // Find the existing subscription record
    const subscription = await db.subscription.findUnique({
      where: { midtransOrderId: orderId },
    });

    if (!subscription) {
      console.error(`Subscription not found for Order ID: ${orderId}. Ignoring notification.`);
      // Return 200 OK to Midtrans even if we can't find the order,
      // otherwise they might keep retrying.
      return new NextResponse('Subscription not found, notification ignored.', { status: 200 });
    }

    // --- Determine the target status based on Midtrans notification ---
    let targetSubscriptionStatus = subscription.status; // Default to current status
    let isPaymentSuccess = false;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        targetSubscriptionStatus = 'SUCCESS';
        isPaymentSuccess = true;
      } else if (fraudStatus === 'challenge') {
        targetSubscriptionStatus = 'CHALLENGE';
      }
      // If fraudStatus is 'deny', Midtrans might send 'deny' transaction_status later
    } else if (transactionStatus === 'settlement') {
      targetSubscriptionStatus = 'SUCCESS';
      isPaymentSuccess = true;
    } else if (transactionStatus === 'pending') {
      targetSubscriptionStatus = 'PENDING';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire' || transactionStatus === 'deny') {
      targetSubscriptionStatus = 'FAILED';
    }
    // Add handling for other statuses like 'refund', 'partial_refund' if needed

    console.log(`Order ID ${orderId}: Determined target status: ${targetSubscriptionStatus}`);

    // --- Update Database if status changed or payment is successful ---

    // Only proceed with updates if the status is changing OR if it's a success notification
    // and the subscription isn't already marked as SUCCESS (idempotency)
    if (targetSubscriptionStatus !== subscription.status || (isPaymentSuccess && subscription.status !== 'SUCCESS')) {

      // Update Subscription status and potentially startDate
      await db.subscription.update({
        where: { id: subscription.id }, // Use primary key for update
        data: {
          status: targetSubscriptionStatus,
          // Set startDate only when transitioning to SUCCESS for the first time
          startDate: (isPaymentSuccess && subscription.status !== 'SUCCESS') ? new Date() : subscription.startDate,
        },
      });
      console.log(`Subscription ${orderId} status updated to ${targetSubscriptionStatus}.`);

      // Update User plan ONLY if payment is successful and subscription wasn't already SUCCESS
      if (isPaymentSuccess && subscription.status !== 'SUCCESS') {
        await db.user.update({
          where: { id: subscription.userId },
          data: { plan: subscription.plan }, // Use the plan stored in the subscription record
        });
        console.log(`User ${subscription.userId} plan updated to ${subscription.plan}.`);
      }

    } else {
       console.log(`Order ID ${orderId}: No status change needed or already processed. Current: ${subscription.status}, Target: ${targetSubscriptionStatus}`);
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
