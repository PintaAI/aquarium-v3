'use server';

import { currentUser } from '@/lib/auth';
import { StreamClient } from '@stream-io/node-sdk';

// Interface for user data
interface StreamUser {
  id: string;
  name: string | null;
  image: string | null;
}

// Create users in Stream before using them in calls
export async function createStreamUsers(users: StreamUser[]) {
  try {
    console.log('[Stream] Creating users:', users.map(u => ({ id: u.id, name: u.name })));
    
    const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;
    const apiSecret = process.env.STREAMCALL_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not found');
    }

    const client = new StreamClient(apiKey, apiSecret);

    // Create/Update users in Stream
    // Create/Update users in Stream - use upsertUsers for batch operation
    const createUsersResult = await client.upsertUsers(
      users.map(user => ({
        id: user.id,
        name: user.name || 'Anonymous',
        image: user.image || undefined
      }))
    );

    console.log('[Stream] Users created successfully:', createUsersResult);
    return { success: true };
  } catch (error) {
    console.error('[Stream] Failed to create users:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create users in Stream'
    };
  }
}

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
    const expirationTime = issuedAt + 60 * 60 * 3; // Token valid for 3 hours from the adjusted issuedAt time

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
