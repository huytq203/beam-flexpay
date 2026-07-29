import {
  weatherResponseSchema,
  type WeatherCurrent
} from '@/app/schemas/weather.schema'
import { ENV } from '@configs/env'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'

export interface WeatherQueryArg {
  latitude: number
  longitude: number
}

const CURRENT_FIELDS =
  'weather_code,temperature_2m,precipitation,cloud_cover,is_day'

/**
 * Base query RIÊNG, cố ý không dùng `fetchBaseQueryCustom`: file đó gắn Bearer
 * token, giữ singleton refresh-token và bắn Swal khi lỗi. Thời tiết chỉ là chi
 * tiết trang trí, một lỗi 503 của Open-Meteo không được phép chạm tới phiên
 * đăng nhập của người dùng.
 */
const weatherBaseQuery = retry(
  fetchBaseQuery({ baseUrl: ENV.WEATHER, timeout: 5_000 }),
  { maxRetries: 1 }
)

export const apiWeather = createApi({
  reducerPath: 'weatherApi',
  baseQuery: weatherBaseQuery,
  endpoints: (build) => ({
    getCurrentWeather: build.query<WeatherCurrent | null, WeatherQueryArg>({
      query: ({ latitude, longitude }) => ({
        url: '/forecast',
        method: 'GET',
        params: {
          latitude,
          longitude,
          current: CURRENT_FIELDS,
          timezone: 'auto'
        }
      }),
      // safeParse chứ không parse: response méo phải rơi vào trạng thái "empty"
      // chứ không được biến thành rejected action đi qua errorMiddleware.
      transformResponse: (response: unknown): WeatherCurrent | null => {
        const parsed = weatherResponseSchema.safeParse(response)
        return parsed.success ? parsed.data.current : null
      }
    })
  })
})

export const { useGetCurrentWeatherQuery } = apiWeather
