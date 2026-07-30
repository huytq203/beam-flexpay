import { createAppStore } from '@/app/store'
import { errorHandlers } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthWeather } from '../hooks/useAuthWeather'

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createAppStore()}>{children}</Provider>
)

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    configurable: true
  })
})

describe('useAuthWeather', () => {
  it('bắt đầu ở trạng thái loading và chưa có điều kiện thời tiết', () => {
    const { result, unmount } = renderHook(() => useAuthWeather(), { wrapper })

    expect(result.current.status).toBe('loading')
    expect(result.current.condition).toBeNull()
    unmount()
  })

  it('trả điều kiện đã map khi lấy được dữ liệu', async () => {
    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('data'))
    expect(result.current.locationLabel).toBe('Hà Nội')
    expect(result.current.condition).toMatchObject({
      kind: 'rain',
      rain: 'moderate',
      cloudCover: 87,
      temperature: 28.4
    })
  })

  it('vào trạng thái error và không có điều kiện khi API hỏng', async () => {
    server.use(errorHandlers.weatherUnavailable)

    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.condition).toBeNull()
  })

  it('vào trạng thái empty khi response không hợp lệ', async () => {
    server.use(errorHandlers.weatherMalformed)

    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(result.current.condition).toBeNull()
  })

  it('ưu tiên cổng dev-only và không chờ API thật', () => {
    window.history.replaceState({}, '', '/?weather=heavy')

    const { result } = renderHook(() => useAuthWeather(), { wrapper })

    expect(result.current.status).toBe('data')
    expect(result.current.condition).toMatchObject({
      kind: 'storm',
      rain: 'heavy',
      cloudCover: 100
    })
    expect(result.current.locationLabel).toBe('Hà Nội')
    expect(result.current.canRequest).toBe(false)
  })
})
