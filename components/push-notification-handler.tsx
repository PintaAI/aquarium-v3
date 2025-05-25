'use client'

import { useCallback, useEffect, useState } from 'react'
import { subscribeToPush, unsubscribeFromPush } from '@/app/actions/push-notifications'
import { Button } from './ui/button'

export function PushNotificationHandler() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Push API is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    } else {
      setLoading(false)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setLoading(false)
    } catch {
      setError('Failed to register service worker')
      setLoading(false)
    }
  }

  const subscribe = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      })

      await subscribeToPush({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.toJSON().keys!.p256dh,
          auth: sub.toJSON().keys!.auth,
        },
      })

      setSubscription(sub)
    } catch (err) {
      setError('Failed to subscribe to push notifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return

    try {
      setLoading(true)
      setError(null)
      await subscription.unsubscribe()
      await unsubscribeFromPush(subscription.endpoint)
      setSubscription(null)
    } catch (err) {
      setError('Failed to unsubscribe from push notifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [subscription])

  if (!isSupported) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
      {subscription ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            You are currently subscribed to push notifications.
          </p>
          <Button variant="destructive" onClick={unsubscribe}>
            Unsubscribe
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to receive push notifications about new courses, updates, and more.
          </p>
          <Button onClick={subscribe}>Subscribe</Button>
        </>
      )}
    </div>
  )
}
