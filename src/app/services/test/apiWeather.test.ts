import { createAppStore } from '@/app/store'
import { errorHandlers } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { describe, expect, it } from 'vitest'
import { apiWeather } from '../apiWeather'

const HANOI = { latitude: 21.0278, longitude: 105.8342 }

const fetchWeather = () => {
  const store = createAppStore()
  return store.dispatch(apiWeather.endpoints.getCurrentWeather.initiate(HANOI))
}

describe('apiWeather', () => {
  it('trả khối current đã validate khi Open-Meteo phản hồi hợp lệ', async () => {
    const result = await fetchWeather()

    expect(result.data).toMatchObject({
      weather_code: 61,
      temperature_2m: 28.4,
      cloud_cover: 87
    })
  })

  it('trả null thay vì ném lỗi khi response thiếu khối current', async () => {
    server.use(errorHandlers.weatherMalformed)

    const result = await fetchWeather()

    expect(result.data).toBeNull()
    expect(result.isError).toBe(false)
  })

  it('vào trạng thái lỗi khi Open-Meteo trả 503', async () => {
    server.use(errorHandlers.weatherUnavailable)

    const result = await fetchWeather()

    expect(result.isError).toBe(true)
    expect(result.data).toBeUndefined()
  })

  it('vào trạng thái lỗi khi mất mạng', async () => {
    server.use(errorHandlers.weatherOffline)

    const result = await fetchWeather()

    expect(result.isError).toBe(true)
  })
})
