"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { BellRing, BellOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscribeToPush, unsubscribeFromPush, type WebPushSubscription } from "@/app/actions/push-notifications"

export function NotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!("Notification" in window)) {
      return
    }
    
    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.getSubscription().then(subscription => {
        setIsSubscribed(!!subscription)
      })
    })
  }, [])

  const handleToggle = async () => {
    try {
      if (!("Notification" in window)) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support push notifications",
          variant: "destructive"
        })
        return
      }

      if (Notification.permission === "denied") {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        })
        return
      }

      const registration = await navigator.serviceWorker.ready
      
      if (isSubscribed) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await unsubscribeFromPush(subscription.endpoint)
          setIsSubscribed(false)
          toast({
            title: "Notifications Disabled",
            description: "You will no longer receive push notifications"
          })
        }
      } else {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          const pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          })
          
          const subscriptionJson = pushSubscription.toJSON()
          const keys = subscriptionJson.keys
          
          if (!pushSubscription.endpoint || !keys?.p256dh || !keys?.auth) {
            throw new Error('Invalid push subscription')
          }
          
          const subscription: WebPushSubscription = {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth
            }
          }
          
          await subscribeToPush(subscription)
          setIsSubscribed(true)
          toast({
            title: "Notifications Enabled",
            description: "You will now receive push notifications"
          })
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      toast({
        title: "Error",
        description: "Failed to toggle notifications",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        checked={isSubscribed}
        onCheckedChange={handleToggle}
      />
      {isSubscribed ? (
        <BellRing className="h-4 w-4 text-primary" />
      ) : (
        <BellOff className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  )
}
