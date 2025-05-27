#!/usr/bin/env node

import { StreamChat } from 'stream-chat';
import type { UserResponse } from 'stream-chat';

const apiKey = '3stmtz2b4rkt';
const apiSecret = 'vd94p99jkwvcs6dkgyjghse8c3m3fqhucvd2g66tedrg48d43wyjkg2hakwb9ue7';

async function deleteAllUsers() {
  const client = new StreamChat(apiKey, apiSecret);

  try {
    // Get all users (paginate through results)
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    console.log('Starting user cleanup...');

    while (hasMore) {
      // Get batch of users
      // Get batch of users using proper pagination
      const response = await client.queryUsers(
        {}, // Empty filter to get all users
        { created_at: -1 }, // Sort by creation date descending
        { limit, offset }
      );
      const users = response.users as UserResponse[];

      if (users.length === 0) {
        hasMore = false;
        continue;
      }

      console.log(`Processing batch of ${users.length} users...`);

      // Delete users in batch
      try {
        const userIds = users.map(user => user.id);
        const deleteResponse = await client.deleteUsers(userIds, {
          user: 'hard',
          messages: 'hard'
        });

        // Track deletion task
        const taskId = deleteResponse.task_id;
        if (!taskId) {
          throw new Error('No task ID received for deletion');
        }

        let taskCompleted = false;
        let retries = 0;
        const maxRetries = 30; // Maximum 30 seconds wait
        
        while (!taskCompleted && retries < maxRetries) {
          retries++;
          const taskResponse = await client.getTask(taskId);
          if (taskResponse.status === 'completed') {
            console.log(`Successfully deleted ${userIds.length} users`);
            taskCompleted = true;
          } else if (taskResponse.status === 'failed') {
            throw new Error(`Task failed: ${taskResponse.error}`);
          } else {
            // Wait 1 second before checking again
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (err) {
        console.error('Failed to delete batch of users:', err);
      }

      offset += users.length;
    }

    console.log('User cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
deleteAllUsers().catch(console.error);
