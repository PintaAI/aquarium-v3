self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0]
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i]
          }
        }
        return client.focus()
      }
      return clients.openWindow('/')
    })
  )
})

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim())
})
