'use server';

import { currentUser } from '@/lib/auth';
import { StreamClient } from '@stream-io/node-sdk';

export async function generateStreamToken() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('Unauthorized: User not logged in.');
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;
    const apiSecret = process.env.STREAMCALL_API_SECRET;

    if (!apiKey) {
      throw new Error('Stream API key not found in environment variables.');
    }
    if (!apiSecret) {
      throw new Error('Stream API secret not found in environment variables.');
    }

    const client = new StreamClient(apiKey, apiSecret);

    // Calculate timestamps
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // Set issuedAt 60 seconds in the past to allow for clock skew
    const expirationTime = issuedAt + 60 * 60; // Token valid for 1 hour from the adjusted issuedAt time

    // Generate token associated with the user's ID. Permissions will be determined
    // by the call type configuration in the Stream dashboard based on the user's role there.
    // Pass both issuedAt (iat) and expirationTime (exp)
    const token = client.createToken(user.id, expirationTime, issuedAt);

    // Optional: Log user ID for debugging, role is handled by Stream based on call type config
    console.log(`Generated token for user ${user.id}`);

    return { success: true, token };

  } catch (error) {
    console.error('Error generating Stream token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error generating token';
    return { success: false, error: errorMessage };
  }
}
