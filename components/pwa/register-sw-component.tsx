'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../../lib/register-sw';

// Fungsi untuk mengonversi string base64 ke Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function RegisterSW() {
  useEffect(() => {
    registerServiceWorker();

    // Meminta izin notifikasi dan mendapatkan subscription
    if ('Notification' in window && navigator.serviceWorker) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Izin notifikasi diberikan.');
          navigator.serviceWorker.ready.then(registration => {
            const applicationServerKey = urlBase64ToUint8Array('BCOvKA2X-dCh86L2K5CCAlIVqpst79ZTFobIxDsDJQ60-_s4uRzj55RMpxdB20Doi5ORfieuscfvLFR0TAHyegE');
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey
            }).then(subscription => {
              console.log('Subscription:', subscription);
              // Kirim subscription ke server
              fetch('/api/save-subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
              });
            });
          });
        } else {
          console.log('Izin notifikasi ditolak.');
        }
      });
    }
  }, []);

  return null;
}
