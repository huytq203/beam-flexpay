/// <reference types="vite/client" />

import { EventEmitter } from 'events'

declare global {
  interface Window {
    events: EventEmitter
  }
}
interface ImportMetaEnv {
  readonly VITE_FEE_API_URL: string,
  readonly VITE_API_LOGIN: string,
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
