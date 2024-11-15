import webpush from 'web-push';

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  'BCOvKA2X-dCh86L2K5CCAlIVqpst79ZTFobIxDsDJQ60-_s4uRzj55RMpxdB20Doi5ORfieuscfvLFR0TAHyegE',
  '_Mwgb68DOIhdaJVl1u6gGj5gjGu3BhQPLYESnwkXwDE'
);

// Simpan subscription di database atau storage
const subscriptions: any[] = [];

export function sendNotification() {
  const payload = JSON.stringify({ title: 'Hello', body: 'World' });

  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, payload)
      .then((response: webpush.SendResult) => console.log('Notification sent:', response))
      .catch((error: Error) => console.error('Error sending notification:', error));
  });
}
