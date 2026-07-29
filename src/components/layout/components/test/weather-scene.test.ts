import type { WeatherCurrent } from '@/app/schemas/weather.schema'
import { describe, expect, it } from 'vitest'
import { getSolarScene } from '../solar-scene'
import {
  applyWeather,
  RAIN_DROP_COUNT,
  readWeatherCondition,
  type WeatherCondition
} from '../weather-scene'

const current = (patch: Partial<WeatherCurrent> = {}): WeatherCurrent => ({
  time: '2026-07-29T09:30',
  weather_code: 0,
  temperature_2m: 28,
  precipitation: 0,
  cloud_cover: 0,
  is_day: 1,
  ...patch
})

const NOON = new Date('2026-07-29T05:00:00Z')

const condition = (patch: Partial<WeatherCondition> = {}): WeatherCondition => ({
  kind: 'clear',
  rain: 'none',
  cloudCover: 0,
  temperature: 28,
  label: 'Trời quang',
  ...patch
})

describe('readWeatherCondition', () => {
  it.each([
    [0, 'clear', 'none'],
    [1, 'clear', 'none'],
    [2, 'cloudy', 'none'],
    [3, 'cloudy', 'none'],
    [45, 'cloudy', 'none'],
    [48, 'cloudy', 'none'],
    [51, 'drizzle', 'light'],
    [57, 'drizzle', 'light'],
    [61, 'rain', 'moderate'],
    [63, 'rain', 'moderate'],
    [80, 'rain', 'moderate'],
    [81, 'rain', 'moderate'],
    [65, 'storm', 'heavy'],
    [82, 'storm', 'heavy'],
    [95, 'storm', 'heavy'],
    [99, 'storm', 'heavy']
  ] as const)('map mã WMO %i thành %s/%s', (code, kind, rain) => {
    const result = readWeatherCondition(current({ weather_code: code }))

    expect(result.kind).toBe(kind)
    expect(result.rain).toBe(rain)
  })

  it('coi mã lạ ngoài bảng là trời quang', () => {
    const result = readWeatherCondition(current({ weather_code: 123 }))

    expect(result.kind).toBe('clear')
    expect(result.rain).toBe('none')
  })

  it('suy mưa cho mã tuyết theo lượng mưa đo được', () => {
    expect(
      readWeatherCondition(current({ weather_code: 73, precipitation: 0 })).rain
    ).toBe('none')
    expect(
      readWeatherCondition(current({ weather_code: 73, precipitation: 0.6 }))
        .rain
    ).toBe('moderate')
  })

  it('giữ nguyên nhiệt độ và độ phủ mây', () => {
    const result = readWeatherCondition(
      current({ temperature_2m: 31.6, cloud_cover: 72 })
    )

    expect(result.temperature).toBe(31.6)
    expect(result.cloudCover).toBe(72)
  })

  it('gắn nhãn tiếng Việt cho từng kiểu thời tiết', () => {
    expect(readWeatherCondition(current({ weather_code: 0 })).label).toBe(
      'Trời quang'
    )
    expect(readWeatherCondition(current({ weather_code: 61 })).label).toBe(
      'Mưa rào'
    )
  })
})

describe('applyWeather', () => {
  const solar = getSolarScene(NOON)

  it('trả cảnh mặt trời nguyên vẹn khi chưa có dữ liệu thời tiết', () => {
    const scene = applyWeather(solar, null)

    expect(scene.rain).toBe('none')
    expect(scene.overcast).toBe(0)
    expect(scene.cloudOpacityScale).toBe(1)
    expect(scene.sky).toBe(solar.sky)
  })

  it('không làm mất token nào của cảnh mặt trời', () => {
    const scene = applyWeather(solar, condition({ cloudCover: 50 }))

    expect(scene.sunLeft).toBe(solar.sunLeft)
    expect(scene.farMountain).toBe(solar.farMountain)
    expect(scene.timeLabel).toBe(solar.timeLabel)
  })

  it('tăng độ xám theo độ phủ mây', () => {
    expect(applyWeather(solar, condition({ cloudCover: 0 })).overcast).toBe(0)
    expect(
      applyWeather(solar, condition({ cloudCover: 100 })).overcast
    ).toBeCloseTo(0.35)
  })

  it('cộng thêm độ xám khi đang mưa', () => {
    const dry = applyWeather(solar, condition({ cloudCover: 50 })).overcast
    const wet = applyWeather(
      solar,
      condition({ cloudCover: 50, rain: 'heavy' })
    ).overcast

    expect(wet).toBeGreaterThan(dry)
  })

  it('chặn trần độ xám ở 0.5 để cảnh không đen kịt', () => {
    const scene = applyWeather(
      solar,
      condition({ cloudCover: 100, rain: 'heavy' })
    )

    expect(scene.overcast).toBeLessThanOrEqual(0.5)
  })

  it('làm mây mờ đi khi trời quang và đậm lên khi trời phủ kín', () => {
    expect(
      applyWeather(solar, condition({ cloudCover: 0 })).cloudOpacityScale
    ).toBeCloseTo(0.55)
    expect(
      applyWeather(solar, condition({ cloudCover: 100 })).cloudOpacityScale
    ).toBeCloseTo(1)
  })
})

describe('RAIN_DROP_COUNT', () => {
  it('quy định số hạt mưa cho từng cấp độ', () => {
    expect(RAIN_DROP_COUNT).toEqual({
      none: 0,
      light: 28,
      moderate: 60,
      heavy: 110
    })
  })
})
