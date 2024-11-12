interface WorkboxEvent extends Event {
  isUpdate?: boolean;
}

interface Workbox {
  addEventListener(event: string, callback: (event: WorkboxEvent) => void): void;
}

declare global {
  interface Window {
    workbox: Workbox;
  }
}

export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' && 
    'serviceWorker' in navigator
  ) {
    // Register the service worker after the page is loaded
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}
