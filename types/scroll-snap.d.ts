declare module 'scroll-snap' {
  interface ScrollSnapOptions {
    snapDestinationX?: string | number
    snapDestinationY?: string | number
    timeout?: number
    duration?: number
    threshold?: number
    snapStop?: boolean
    easing?: (t: number) => number
    enableKeyboard?: boolean
  }

  interface ScrollSnapAPI {
    bind: () => void
    unbind: () => void
  }

  export default function createScrollSnap(
    element: HTMLElement,
    options?: ScrollSnapOptions
  ): ScrollSnapAPI
}
