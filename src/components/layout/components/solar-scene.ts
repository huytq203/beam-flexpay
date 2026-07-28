import { getPosition, getTimes } from 'suncalc'
import type { CloudPalette } from './CloudField'

const HO_CHI_MINH_COORDINATES = {
  latitude: 10.8231,
  longitude: 106.6297
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

export interface SolarScene {
  isNight: boolean
  isTwilight: boolean
  isSunset: boolean
  isNoonHour: boolean
  isEveningImageHour: boolean
  sunLeft: string
  sunTop: string
  sunOpacity: number
  sky: string
  sunColor: string
  farMountain: string
  middleMountain: string
  nearMountain: string
  cloud: CloudPalette
  timeLabel: string
}

/**
 * Chuyển dữ liệu thiên văn của SunCalc thành các token thị giác cho panel.
 */
export function getSolarScene(now: Date): SolarScene {
  const { latitude, longitude } = HO_CHI_MINH_COORDINATES
  const { altitude } = getPosition(now, latitude, longitude)
  const { sunrise, sunset, solarNoon } = getTimes(now, latitude, longitude)
  const sunriseAt = sunrise?.getTime() ?? now.getTime()
  const sunsetAt = sunset?.getTime() ?? now.getTime()
  const daylightProgress = clamp(
    (now.getTime() - sunriseAt) / Math.max(sunsetAt - sunriseAt, 1),
    0,
    1
  )
  const easedDaylightProgress =
    daylightProgress ** 3 *
    (daylightProgress * (daylightProgress * 6 - 15) + 10)
  const sunArc = Math.max(Math.sin(daylightProgress * Math.PI), 0) ** 0.28
  const isSunset = now.getTime() > solarNoon.getTime()
  const isNight = altitude < -6
  const isTwilight = altitude < 10 && !isNight
  const vietnamHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(now)
  )
  const sunTop =
    altitude >= 0
      ? 64 - sunArc * 52
      : 64 + Math.min(Math.abs(altitude), 12) * 1.2

  let sky = 'linear-gradient(165deg, #c9fffa 0%, #9cece5 52%, #70d3ca 100%)'
  let sunColor = '#fff1a8'
  let farMountain = '#83d8cf'
  let middleMountain = '#48afa7'
  let nearMountain = '#237d78'
  let cloud: CloudPalette = { light: '#ffffff', shade: '#a5e4dd' }

  if (isNight) {
    sky = 'linear-gradient(165deg, #102c46 0%, #164b5c 55%, #1b6870 100%)'
    sunColor = '#ffc47d'
    farMountain = '#367681'
    middleMountain = '#285f6a'
    nearMountain = '#194b56'
    cloud = { light: '#3d6d83', shade: '#204a5e' }
  } else if (isTwilight && isSunset) {
    sky = 'linear-gradient(165deg, #4a7897 0%, #dc927b 58%, #ffc481 100%)'
    sunColor = '#ffb35f'
    farMountain = '#799a91'
    middleMountain = '#477b73'
    nearMountain = '#245b59'
    cloud = { light: '#ffe4c8', shade: '#c8807a' }
  } else if (isTwilight) {
    sky = 'linear-gradient(165deg, #80cfd1 0%, #f4bd91 58%, #ffe0ab 100%)'
    sunColor = '#ffd98a'
    farMountain = '#8fc6b9'
    middleMountain = '#5d9e91'
    nearMountain = '#34766f'
    cloud = { light: '#fff5e2', shade: '#e3ab8d' }
  }

  return {
    isNight,
    isTwilight,
    isSunset,
    isNoonHour: vietnamHour === 12,
    isEveningImageHour: vietnamHour >= 17 && vietnamHour <= 23,
    sunLeft: `${4 + easedDaylightProgress * 92}%`,
    sunTop: `${sunTop}%`,
    sunOpacity: clamp((altitude + 6) / 6, 0, 1),
    sky,
    sunColor,
    farMountain,
    middleMountain,
    nearMountain,
    cloud,
    timeLabel: new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now)
  }
}
