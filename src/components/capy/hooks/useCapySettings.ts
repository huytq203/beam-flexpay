import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { ENV } from '@configs/env'
import { useAppSelector } from '@hooks/hook'
import {
  parsePrefs,
  readRawPrefs,
  subscribePrefs,
  writePrefs,
  type CapyPrefs
} from '../capyPrefs'
import { isCapyRoute } from '../capyRoutes'

export interface CapySettings extends CapyPrefs {
  /** Tính năng có được phép chạy ở nơi này không (env, route, cỡ màn hình, giảm chuyển động). */
  readonly available: boolean
  /** Ghi một phần tuỳ chọn; các giá trị còn lại giữ nguyên. */
  readonly update: (patch: Partial<CapyPrefs>) => void
  readonly setEnabled: (value: boolean) => void
  readonly setIdleOnly: (value: boolean) => void
}

const MIN_WIDTH_QUERY = '(min-width: 768px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const matches = (query: string): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches

function subscribeMedia(query: string) {
  return (notify: () => void): (() => void) => {
    if (typeof window.matchMedia !== 'function') return () => undefined
    const list = window.matchMedia(query)
    list.addEventListener('change', notify)
    return () => list.removeEventListener('change', notify)
  }
}
const subscribeWidth = subscribeMedia(MIN_WIDTH_QUERY)
const subscribeMotion = subscribeMedia(REDUCED_MOTION_QUERY)

export function useCapySettings(): CapySettings {
  const { pathname } = useLocation()
  const username = useAppSelector((state) => state.auth.profile.username)
  const raw = useSyncExternalStore(subscribePrefs, () => readRawPrefs(username))
  const wide = useSyncExternalStore(subscribeWidth, () =>
    matches(MIN_WIDTH_QUERY)
  )
  const reduced = useSyncExternalStore(subscribeMotion, () =>
    matches(REDUCED_MOTION_QUERY)
  )
  const prefs = useMemo(() => parsePrefs(raw), [raw])

  const update = useCallback(
    (patch: Partial<CapyPrefs>) => writePrefs(username, { ...prefs, ...patch }),
    [username, prefs]
  )

  return {
    ...prefs,
    available: ENV.CAPY_ENABLED && isCapyRoute(pathname) && wide && !reduced,
    update,
    setEnabled: (enabled) => update({ enabled }),
    setIdleOnly: (idleOnly) => update({ idleOnly })
  }
}
