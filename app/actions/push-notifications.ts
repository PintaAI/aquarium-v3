'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import webpush from 'web-push'

// Define types for push subscription
export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface WebPushSubscription {
  endpoint: string
  keys: PushSubscriptionKeys
}

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@example.com', // Replace with your email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeToPush(subscription: WebPushSubscription) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await db.pushNotification.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: session.user.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    throw new Error('Failed to subscribe to push notifications')
  }
}

export async function unsubscribeFromPush(endpoint: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await db.pushNotification.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    throw new Error('Failed to unsubscribe from push notifications')
  }
}

interface NotificationResult {
  success: boolean
  endpoint: string
  error?: unknown
}

export interface NotificationMessage {
  body: string
  url?: string
}

export async function sendNotification(
  userId: string | 'all',
  title: string,
  message: string | NotificationMessage
) {
  try {
    const notifications = await db.pushNotification.findMany({
      where: userId === 'all' ? {} : { userId },
    })

    const messageBody = typeof message === 'string' ? message : message.body
    const messageUrl = typeof message === 'string' ? undefined : message.url

    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: messageUrl
    })

    const results = await Promise.allSettled(
      notifications.map(async (notification) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: notification.endpoint,
              keys: {
                p256dh: notification.p256dh,
                auth: notification.auth,
              },
            },
            payload
          )
          return { success: true, endpoint: notification.endpoint } as NotificationResult
        } catch (error) {
          // If the subscription is no longer valid (e.g. browser unsubscribed)
          if ((error as { statusCode?: number }).statusCode === 410) {
            await db.pushNotification.delete({
              where: { endpoint: notification.endpoint },
            })
          }
          return { 
            success: false, 
            endpoint: notification.endpoint, 
            error 
          } as NotificationResult
        }
      })
    )

    return {
      success: true,
      results: results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        return { success: false, error: result.reason } as NotificationResult
      }),
    }
  } catch (error) {
    console.error('Failed to send push notification:', error)
    throw new Error('Failed to send push notification')
  }
}
