import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeatherCoords, WEATHER_COORDS_CACHE_KEY } from './useWeatherCoords'

const PRECISE = { latitude: 16.0544, longitude: 108.2022 }

const mockGeolocation = (
  implementation: (
    success: PositionCallback,
    failure: PositionErrorCallback
  ) => void
) => {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(implementation) },
    configurable: true
  })
}

const mockPermissions = (state: PermissionState | null) => {
  Object.defineProperty(navigator, 'permissions', {
    value:
      state === null
        ? undefined
        : { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true
  })
}

const resolveWith = (coords: {
  latitude: number
  longitude: number
}): void =>
  mockGeolocation((success) => {
    const positionCoords = {
        ...coords,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => coords
    }
    success({
      coords: positionCoords,
      timestamp: Date.now(),
      toJSON: () => ({ coords: positionCoords })
    })
  })

beforeEach(() => {
  sessionStorage.clear()
  resolveWith(PRECISE)
})

afterEach(() => vi.restoreAllMocks())

describe('useWeatherCoords', () => {
  it('mặc định trả toạ độ Hà Nội và đánh dấu không chính xác', async () => {
    mockPermissions('prompt')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(result.current.canRequest).toBe(true))
    expect(result.current.coords).toEqual({
      latitude: 21.0278,
      longitude: 105.8342,
      isPrecise: false,
      locationLabel: 'Hà Nội'
    })
  })

  it('đọc vị trí thật khi quyền đã được cấp từ trước', async () => {
    mockPermissions('granted')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(result.current.coords).toEqual({
        ...PRECISE,
        isPrecise: true,
        locationLabel: 'Hải Châu, Đà Nẵng'
      })
    )
  })

  it('không tự gọi getCurrentPosition khi quyền đang ở trạng thái prompt', async () => {
    mockPermissions('prompt')

    renderHook(() => useWeatherCoords())

    await waitFor(() => expect(navigator.permissions.query).toHaveBeenCalled())
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('cho phép người dùng tự yêu cầu khi quyền ở trạng thái prompt', async () => {
    mockPermissions('prompt')

    const { result } = renderHook(() => useWeatherCoords())
    await waitFor(() => expect(result.current.canRequest).toBe(true))

    act(() => result.current.requestLocation())

    await waitFor(() =>
      expect(result.current.coords).toEqual({
        ...PRECISE,
        isPrecise: true,
        locationLabel: 'Hải Châu, Đà Nẵng'
      })
    )
  })

  it('không mời gọi lại khi người dùng đã từ chối quyền', async () => {
    mockPermissions('denied')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(result.current.canRequest).toBe(false))
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('vẫn cho bấm thủ công khi trình duyệt không có Permissions API', async () => {
    mockPermissions(null)

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() => expect(result.current.canRequest).toBe(true))
    expect(result.current.coords.isPrecise).toBe(false)
  })

  it('giữ Hà Nội khi geolocation báo lỗi', async () => {
    mockPermissions('granted')
    mockGeolocation((_success, failure) => {
      failure({
        code: 3,
        message: 'timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      })
    })

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled()
    )
    expect(result.current.coords.isPrecise).toBe(false)
  })

  it('dùng lại địa danh đã cache thay vì hỏi lại trình duyệt', () => {
    sessionStorage.setItem(
      WEATHER_COORDS_CACHE_KEY,
      JSON.stringify({
        ...PRECISE,
        isPrecise: true,
        locationLabel: 'Hải Châu, Đà Nẵng'
      })
    )
    mockPermissions('granted')

    const { result } = renderHook(() => useWeatherCoords())

    expect(result.current.coords).toEqual({
      ...PRECISE,
      isPrecise: true,
      locationLabel: 'Hải Châu, Đà Nẵng'
    })
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('tự nâng cấp cache cũ chưa có tên địa danh', async () => {
    sessionStorage.setItem(
      WEATHER_COORDS_CACHE_KEY,
      JSON.stringify({ ...PRECISE, isPrecise: true })
    )
    mockPermissions('granted')

    const { result } = renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(result.current.coords.locationLabel).toBe('Hải Châu, Đà Nẵng')
    )
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledOnce()
  })

  it('ghi toạ độ vừa lấy được vào cache', async () => {
    mockPermissions('granted')

    renderHook(() => useWeatherCoords())

    await waitFor(() =>
      expect(sessionStorage.getItem(WEATHER_COORDS_CACHE_KEY)).toBe(
        JSON.stringify({
          ...PRECISE,
          isPrecise: true,
          locationLabel: 'Hải Châu, Đà Nẵng'
        })
      )
    )
  })
})
