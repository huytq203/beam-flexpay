import type { WeatherCondition } from '../components/weather-scene'
import type { AuthWeather } from './useAuthWeather'

export type WeatherOverride = Pick<AuthWeather, 'status' | 'condition'>

const CLEAR_CONDITION: WeatherCondition = {
  kind: 'clear',
  rain: 'none',
  cloudCover: 5,
  temperature: 28,
  label: 'Trời quang'
}

const CLOUDY_CONDITION: WeatherCondition = {
  kind: 'cloudy',
  rain: 'none',
  cloudCover: 95,
  temperature: 28,
  label: 'Nhiều mây'
}

const DRIZZLE_CONDITION: WeatherCondition = {
  kind: 'drizzle',
  rain: 'light',
  cloudCover: 88,
  temperature: 27.5,
  label: 'Mưa phùn'
}

const RAIN_CONDITION: WeatherCondition = {
  kind: 'rain',
  rain: 'moderate',
  cloudCover: 95,
  temperature: 27,
  label: 'Mưa rào'
}

const STORM_CONDITION: WeatherCondition = {
  kind: 'storm',
  rain: 'heavy',
  cloudCover: 100,
  temperature: 26.5,
  label: 'Mưa to'
}

const WEATHER_OVERRIDES = new Map<string, WeatherOverride>([
  ['clear', { status: 'data', condition: CLEAR_CONDITION }],
  ['cloudy', { status: 'data', condition: CLOUDY_CONDITION }],
  ['drizzle', { status: 'data', condition: DRIZZLE_CONDITION }],
  ['light', { status: 'data', condition: DRIZZLE_CONDITION }],
  ['rain', { status: 'data', condition: RAIN_CONDITION }],
  ['moderate', { status: 'data', condition: RAIN_CONDITION }],
  ['storm', { status: 'data', condition: STORM_CONDITION }],
  ['heavy', { status: 'data', condition: STORM_CONDITION }],
  ['loading', { status: 'loading', condition: null }],
  ['error', { status: 'error', condition: null }],
  ['empty', { status: 'empty', condition: null }]
])

/**
 * Dev-only weather preview:
 * ?weather=clear|cloudy|drizzle|rain|storm|loading|error|empty
 * Aliases: light, moderate, heavy.
 */
export function readWeatherOverride(
  isDevelopment: boolean = import.meta.env.DEV
): WeatherOverride | null {
  if (!isDevelopment) return null

  const value = new URLSearchParams(window.location.search)
    .get('weather')
    ?.trim()
    .toLowerCase()

  if (!value) return null

  const override = WEATHER_OVERRIDES.get(value)
  if (override) return override

  console.warn(
    `[weather-override] Không hỗ trợ ?weather=${value}. ` +
      'Dùng clear, cloudy, drizzle, rain, storm, loading, error hoặc empty.'
  )
  return null
}
