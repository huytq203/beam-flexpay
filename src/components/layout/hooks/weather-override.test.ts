import { afterEach, describe, expect, it, vi } from 'vitest'
import { readWeatherOverride } from './weather-override'

const useWeather = (weather: string): void => {
  window.history.replaceState({}, '', `/?weather=${weather}`)
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

describe('readWeatherOverride', () => {
  it.each([
    ['clear', 'clear', 'none'],
    ['cloudy', 'cloudy', 'none'],
    ['drizzle', 'drizzle', 'light'],
    ['rain', 'rain', 'moderate'],
    ['heavy', 'storm', 'heavy']
  ] as const)('ép ?weather=%s thành %s/%s', (value, kind, rain) => {
    useWeather(value)

    const override = readWeatherOverride()

    expect(override?.status).toBe('data')
    expect(override?.condition).toMatchObject({ kind, rain })
  })

  it.each(['loading', 'error', 'empty'] as const)(
    'ép được trạng thái %s',
    (status) => {
      useWeather(status)

      expect(readWeatherOverride()).toEqual({ status, condition: null })
    }
  )

  it('hỗ trợ alias light và moderate', () => {
    useWeather('light')
    expect(readWeatherOverride()?.condition?.rain).toBe('light')

    useWeather('moderate')
    expect(readWeatherOverride()?.condition?.rain).toBe('moderate')
  })

  it('bỏ qua override trong production', () => {
    useWeather('heavy')

    expect(readWeatherOverride(false)).toBeNull()
  })

  it('bỏ qua giá trị lạ và cảnh báo rõ cách dùng', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    useWeather('snow')

    expect(readWeatherOverride()).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('?weather=snow'))
  })
})
