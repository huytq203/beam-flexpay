import type { WeatherCurrent } from '@/app/schemas/weather.schema'
import type { SolarScene } from './solar-scene'

export const RainIntensity = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  HEAVY: 'heavy'
} as const
export type RainIntensity = (typeof RainIntensity)[keyof typeof RainIntensity]

export const WeatherKind = {
  CLEAR: 'clear',
  CLOUDY: 'cloudy',
  DRIZZLE: 'drizzle',
  RAIN: 'rain',
  STORM: 'storm'
} as const
export type WeatherKind = (typeof WeatherKind)[keyof typeof WeatherKind]

export interface WeatherCondition {
  kind: WeatherKind
  rain: RainIntensity
  /** Độ phủ mây 0–100. */
  cloudCover: number
  temperature: number
  /** Nhãn tiếng Việt hiển thị trên badge. */
  label: string
}

/**
 * Cảnh mặt trời đã được thời tiết điều chỉnh. Mọi token của `SolarScene` giữ
 * nguyên; thời tiết chỉ cộng thêm ba trường điều khiển lớp phủ.
 */
export interface AuthScene extends SolarScene {
  rain: RainIntensity
  /** Alpha của lớp xám phủ lên trời, 0–0.5. */
  overcast: number
  /** Hệ số nhân opacity cho dải mây, 0.55–1. */
  cloudOpacityScale: number
}

export const RAIN_DROP_COUNT: Record<RainIntensity, number> = {
  none: 0,
  light: 28,
  moderate: 60,
  heavy: 110
}

const KIND_LABEL: Record<WeatherKind, string> = {
  clear: 'Trời quang',
  cloudy: 'Nhiều mây',
  drizzle: 'Mưa phùn',
  rain: 'Mưa rào',
  storm: 'Mưa to'
}

const KIND_RAIN: Record<WeatherKind, RainIntensity> = {
  clear: 'none',
  cloudy: 'none',
  drizzle: 'light',
  rain: 'moderate',
  storm: 'heavy'
}

/** Mã WMO của Open-Meteo, nhóm theo hiệu ứng cần render. */
const WMO_KIND = new Map<number, WeatherKind>([
  ...([0, 1] as const).map((code) => [code, WeatherKind.CLEAR] as const),
  ...([2, 3, 45, 48] as const).map(
    (code) => [code, WeatherKind.CLOUDY] as const
  ),
  ...([51, 53, 55, 56, 57] as const).map(
    (code) => [code, WeatherKind.DRIZZLE] as const
  ),
  ...([61, 63, 80, 81] as const).map(
    (code) => [code, WeatherKind.RAIN] as const
  ),
  ...([65, 66, 67, 82, 95, 96, 99] as const).map(
    (code) => [code, WeatherKind.STORM] as const
  )
])

/** Mã tuyết 71–86: Việt Nam không dùng tới, suy hiệu ứng theo lượng mưa đo được. */
const isSnowCode = (code: number): boolean => code >= 71 && code <= 86

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum)

const RAIN_DIM: Record<RainIntensity, number> = {
  none: 0,
  light: 0.04,
  moderate: 0.08,
  heavy: 0.14
}

export function readWeatherCondition(current: WeatherCurrent): WeatherCondition {
  const mappedKind = WMO_KIND.get(current.weather_code)
  const kind = mappedKind ?? WeatherKind.CLEAR
  const rain = mappedKind
    ? KIND_RAIN[mappedKind]
    : isSnowCode(current.weather_code)
    ? current.precipitation > 0
      ? RainIntensity.MODERATE
      : RainIntensity.NONE
    : RainIntensity.NONE

  return {
    kind,
    rain,
    cloudCover: current.cloud_cover,
    temperature: current.temperature_2m,
    label: KIND_LABEL[kind]
  }
}

export function applyWeather(
  scene: SolarScene,
  condition: WeatherCondition | null
): AuthScene {
  if (!condition) {
    return {
      ...scene,
      rain: RainIntensity.NONE,
      overcast: 0,
      cloudOpacityScale: 1
    }
  }

  const cloudRatio = condition.cloudCover / 100

  return {
    ...scene,
    rain: condition.rain,
    overcast: clamp(cloudRatio * 0.35 + RAIN_DIM[condition.rain], 0, 0.5),
    cloudOpacityScale: 0.55 + cloudRatio * 0.45
  }
}
