import { useGetCurrentWeatherQuery } from '@services/apiWeather'
import {
  readWeatherCondition,
  type WeatherCondition
} from '../components/weather-scene'
import { useWeatherCoords } from './useWeatherCoords'
import { readWeatherOverride } from './weather-override'

export const WeatherStatus = {
  LOADING: 'loading',
  ERROR: 'error',
  EMPTY: 'empty',
  DATA: 'data'
} as const
export type WeatherStatus = (typeof WeatherStatus)[keyof typeof WeatherStatus]

export interface AuthWeather {
  status: WeatherStatus
  condition: WeatherCondition | null
  locationLabel: string
  canRequest: boolean
  requestLocation: () => void
}

/** Làm mới cùng nhịp 10 phút với đồng bộ đồng hồ của useVietnamTime. */
const REFRESH_INTERVAL_MS = 10 * 60_000

export function useAuthWeather(): AuthWeather {
  const override = readWeatherOverride()
  const { coords, canRequest, requestLocation } = useWeatherCoords()
  const { data, isError, isLoading } = useGetCurrentWeatherQuery(
    { latitude: coords.latitude, longitude: coords.longitude },
    {
      pollingInterval: REFRESH_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      skip: override !== null
    }
  )

  if (override) {
    return {
      ...override,
      locationLabel: coords.locationLabel,
      canRequest: false,
      requestLocation
    }
  }

  const status: WeatherStatus = isLoading
    ? WeatherStatus.LOADING
    : isError
      ? WeatherStatus.ERROR
      : data
        ? WeatherStatus.DATA
        : WeatherStatus.EMPTY

  return {
    status,
    condition: data ? readWeatherCondition(data) : null,
    locationLabel: coords.locationLabel,
    canRequest,
    requestLocation
  }
}
