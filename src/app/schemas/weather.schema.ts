import { z } from 'zod'

/**
 * Khối `current` của Open-Meteo Forecast API. Chỉ khai báo các field thực sự
 * dùng tới; field thừa trong response được bỏ qua chứ không làm parse thất bại.
 */
export const weatherResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    weather_code: z.number().int(),
    temperature_2m: z.number(),
    precipitation: z.number(),
    cloud_cover: z.number().min(0).max(100),
    is_day: z.number().int()
  })
})

export type WeatherResponse = z.infer<typeof weatherResponseSchema>
export type WeatherCurrent = WeatherResponse['current']
