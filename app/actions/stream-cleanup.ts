'use server'

import { StreamChat } from 'stream-chat';
import { currentUser } from '@/lib/auth';

// Helper function to wait for task completion
async function waitForTask(client: StreamChat, taskId: string, maxAttempts = 30): Promise<boolean> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const response = await client.getTask(taskId);
    if (response.status === 'completed') {
      return true;
    }
    if (response.status === 'failed') {
      return false;
    }
    // Wait 1 second before next check
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  return false;
}

// Cleanup all Stream users in a batch
export async function cleanupAllStreamUsers() {
  try {
    // Only allow GURU to perform cleanup
    const user = await currentUser();
    if (user?.role !== 'GURU') {
      throw new Error('Unauthorized');
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;
    const apiSecret = process.env.STREAMCALL_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not found');
    }

    const client = new StreamChat(apiKey, apiSecret);
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      // Get batch of users using proper pagination
      const response = await client.queryUsers(
        {}, // Empty filter to get all users
        { created_at: -1 }, // Sort by creation date descending
        { limit, offset }
      );
      const users = response.users;

      if (users.length === 0) {
        hasMore = false;
        continue;
      }

      // Get all user IDs from this batch
      const userIds = users.map(user => user.id);

      // Delete users in batch
      const deleteResponse = await client.deleteUsers(userIds, {
        user: 'hard',
        messages: 'hard'
      });

      // Wait for deletion task to complete
      const success = await waitForTask(client, deleteResponse.task_id);
      if (success) {
        totalDeleted += userIds.length;
      }

      offset += users.length;
    }

    return { success: true, totalDeleted };
  } catch (error) {
    console.error('Failed to cleanup Stream users:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Cleanup specific user's Stream data
export async function cleanupStreamUser(userId: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;
    const apiSecret = process.env.STREAMCALL_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not found');
    }

    const client = new StreamChat(apiKey, apiSecret);
    
    // Delete user and wait for task completion
    const response = await client.deleteUsers([userId], {
      user: 'hard',
      messages: 'hard'
    });
    
    const success = await waitForTask(client, response.task_id);
    if (!success) {
      throw new Error('User deletion task failed');
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to cleanup Stream user ${userId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
