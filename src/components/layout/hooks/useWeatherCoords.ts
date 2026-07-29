import { useCallback, useEffect, useState } from 'react'
import { reverseGeocodeCurrentLocation } from '@/app/services/reverseGeocode'
import { HANOI_COORDINATES } from '../components/solar-scene'

export interface WeatherCoords {
  latitude: number
  longitude: number
  /** true khi là toạ độ thật của người dùng, false khi đang dùng mặc định Hà Nội. */
  isPrecise: boolean
  locationLabel: string
}

export interface UseWeatherCoordsResult {
  coords: WeatherCoords
  /** true khi còn có thể xin quyền vị trí bằng một hành động chủ đích. */
  canRequest: boolean
  requestLocation: () => void
}

export const WEATHER_COORDS_CACHE_KEY = 'auth-weather-coords'
const PRECISE_LOCATION_FALLBACK = 'Vị trí của bạn'

const FALLBACK: WeatherCoords = {
  ...HANOI_COORDINATES,
  isPrecise: false,
  locationLabel: 'Hà Nội'
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 5_000,
  maximumAge: 10 * 60_000
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isCachedCoords = (
  value: unknown
): value is Omit<WeatherCoords, 'locationLabel'> &
  Partial<Pick<WeatherCoords, 'locationLabel'>> =>
  isRecord(value) &&
  typeof value.latitude === 'number' &&
  typeof value.longitude === 'number' &&
  typeof value.isPrecise === 'boolean' &&
  (value.locationLabel === undefined || typeof value.locationLabel === 'string')

const readCache = (): WeatherCoords | null => {
  try {
    const raw = sessionStorage.getItem(WEATHER_COORDS_CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isCachedCoords(parsed)) return null
    return {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      isPrecise: parsed.isPrecise,
      locationLabel:
        parsed.locationLabel?.trim() ||
        (parsed.isPrecise ? PRECISE_LOCATION_FALLBACK : 'Hà Nội')
    }
  } catch {
    return null
  }
}

const writeCache = (coords: WeatherCoords): void => {
  try {
    sessionStorage.setItem(WEATHER_COORDS_CACHE_KEY, JSON.stringify(coords))
  } catch {
    // sessionStorage bị chặn (chế độ riêng tư): bỏ qua, chỉ mất cache.
  }
}

const requestPreciseLocation = (
  onLocated: (coords: WeatherCoords) => void
): void => {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords: WeatherCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        isPrecise: true,
        locationLabel: PRECISE_LOCATION_FALLBACK
      }
      onLocated(coords)

      void reverseGeocodeCurrentLocation(coords).then((locationLabel) => {
        if (locationLabel) onLocated({ ...coords, locationLabel })
      })
    },
    () => {
      // Giữ nguyên Hà Nội. Không log toạ độ, không báo lỗi cho người dùng.
    },
    GEOLOCATION_OPTIONS
  )
}

const resolvePermission = async (
  locate: () => void,
  updateCanRequest: (canRequest: boolean) => void,
  isDisposed: () => boolean
): Promise<void> => {
  if (!navigator.permissions?.query) {
    if (!isDisposed()) updateCanRequest(true)
    return
  }

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    if (isDisposed()) return
    if (status.state === 'granted') {
      locate()
      return
    }
    updateCanRequest(status.state === 'prompt')
  } catch {
    if (!isDisposed()) updateCanRequest(true)
  }
}

/**
 * Toạ độ cho panel thời tiết theo chiến lược silent-first: chỉ đọc geolocation
 * khi quyền đã ở trạng thái `granted`. Ở trạng thái `prompt` hook cố tình KHÔNG
 * gọi, để màn đăng nhập không bật popup xin quyền bất ngờ — người dùng phải tự
 * bấm nút thì mới hỏi.
 */
export function useWeatherCoords(): UseWeatherCoordsResult {
  const [coords, setCoords] = useState<WeatherCoords>(
    () => readCache() ?? FALLBACK
  )
  const [canRequest, setCanRequest] = useState(false)

  const handleLocated = useCallback((next: WeatherCoords): void => {
    setCoords(next)
    setCanRequest(false)
    writeCache(next)
  }, [])
  const locate = useCallback(
    (): void => requestPreciseLocation(handleLocated),
    [handleLocated]
  )

  useEffect(() => {
    const cached = readCache()
    if (
      cached?.isPrecise &&
      cached.locationLabel !== PRECISE_LOCATION_FALLBACK
    ) {
      return
    }

    let disposed = false
    void resolvePermission(locate, setCanRequest, () => disposed)

    return () => {
      disposed = true
    }
  }, [locate])

  return { coords, canRequest, requestLocation: locate }
}
