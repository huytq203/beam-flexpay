import { describe, expect, it } from 'vitest'
import { weatherResponseSchema } from '../weather.schema'

const VALID = {
  current: {
    time: '2026-07-29T09:30',
    weather_code: 61,
    temperature_2m: 28.4,
    precipitation: 1.2,
    cloud_cover: 87,
    is_day: 1
  }
}

describe('weatherResponseSchema', () => {
  it('chấp nhận response đầy đủ của Open-Meteo', () => {
    const parsed = weatherResponseSchema.safeParse(VALID)

    expect(parsed.success).toBe(true)
  })

  it('bỏ qua field thừa mà Open-Meteo trả kèm', () => {
    const parsed = weatherResponseSchema.safeParse({
      ...VALID,
      latitude: 21.03,
      current_units: { temperature_2m: '°C' }
    })

    expect(parsed.success).toBe(true)
  })

  it('từ chối khi thiếu hẳn khối current', () => {
    expect(weatherResponseSchema.safeParse({}).success).toBe(false)
  })

  it('từ chối khi weather_code sai kiểu', () => {
    const parsed = weatherResponseSchema.safeParse({
      current: { ...VALID.current, weather_code: 'rain' }
    })

    expect(parsed.success).toBe(false)
  })

  it('từ chối cloud_cover ngoài khoảng 0–100', () => {
    expect(
      weatherResponseSchema.safeParse({
        current: { ...VALID.current, cloud_cover: 140 }
      }).success
    ).toBe(false)
  })
})
