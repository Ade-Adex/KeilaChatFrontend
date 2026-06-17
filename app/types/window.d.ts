// src/types/window.d.ts
export {} // This makes the file a module

declare global {
  interface Window {
    KeilaChat: {
      open: () => void
      close: () => void
      toggle: () => void
    }
    KeilaConfig?: {
      widgetId?: string
    }
  }
}
