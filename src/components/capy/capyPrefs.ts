import {
  ACTIVITY_LEVELS,
  DEFAULT_LEVELS,
  SLEEP_AFTER_OPTIONS,
  SPEED_LEVELS,
  type Levels
} from './engine/tuning'

export interface CapyPrefs extends Levels {
  readonly enabled: boolean
  readonly idleOnly: boolean
}

export const DEFAULT_CAPY_PREFS: CapyPrefs = {
  enabled: true,
  idleOnly: false,
  ...DEFAULT_LEVELS
}

const listeners = new Set<() => void>()

export const capyStorageKey = (username: string): string => `capy:${username}`

/** Đọc chuỗi thô; lỗi truy cập localStorage (chế độ riêng tư, bị chặn) coi như chưa lưu. */
export function readRawPrefs(username: string): string | null {
  try {
    return window.localStorage.getItem(capyStorageKey(username))
  } catch {
    return null
  }
}

const oneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.find((option) => option === value) ?? fallback

/** Đọc tuỳ chọn đã lưu; giá trị thiếu hoặc không hợp lệ rơi về mặc định, không bao giờ ném lỗi. */
export function parsePrefs(raw: string | null): CapyPrefs {
  if (!raw) return DEFAULT_CAPY_PREFS
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return DEFAULT_CAPY_PREFS
    const saved = value as Record<string, unknown>
    const flag = (key: 'enabled' | 'idleOnly'): boolean =>
      typeof saved[key] === 'boolean' ? saved[key] : DEFAULT_CAPY_PREFS[key]
    return {
      enabled: flag('enabled'),
      idleOnly: flag('idleOnly'),
      speed: oneOf(saved.speed, SPEED_LEVELS, DEFAULT_LEVELS.speed),
      activity: oneOf(saved.activity, ACTIVITY_LEVELS, DEFAULT_LEVELS.activity),
      sleepAfter: oneOf(
        saved.sleepAfter,
        SLEEP_AFTER_OPTIONS,
        DEFAULT_LEVELS.sleepAfter
      )
    }
  } catch {
    return DEFAULT_CAPY_PREFS
  }
}

export function writePrefs(username: string, prefs: CapyPrefs): void {
  try {
    window.localStorage.setItem(capyStorageKey(username), JSON.stringify(prefs))
  } catch {
    /* Không lưu được thì bỏ qua: tuỳ chọn chỉ có tác dụng trong phiên này. */
  }
  listeners.forEach((notify) => notify())
}

export function subscribePrefs(notify: () => void): () => void {
  listeners.add(notify)
  window.addEventListener('storage', notify)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('storage', notify)
  }
}
