// Show notification with system sound (works on iOS PWA installed)
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [500, 200, 500, 200, 500],
      tag: 'meditrack-med-' + (event.data.tag || 'reminder'),
      renotify: true,
      requireInteraction: true, // keeps notification visible until dismissed
      silent: false,            // use system sound
      data: { url: '/', playSound: true },
    })
  }
})

// When user taps notification → open app and play alarm sound
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Send message to play alarm sound in the app
      list.forEach(client => client.postMessage({ type: 'PLAY_ALARM' }))
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/?alarm=1')
    })
  )
})
