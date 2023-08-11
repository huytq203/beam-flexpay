/// <reference types="vite/client" />

import { EventEmitter } from 'events'

declare global {
  interface Window {
    events: EventEmitter
  }
}
