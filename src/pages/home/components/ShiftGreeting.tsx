import { CloudIcon, CloudRainIcon, SunIcon, MapPinIcon } from '@phosphor-icons/react'
import { useAppSelector } from '@hooks/hook'
import { useAuthWeather } from '@components/layout/hooks/useAuthWeather'
import type { WeatherKind } from '@components/layout/components/weather-scene'
import { useShiftClock } from '../hooks/useShiftClock'

interface ShiftGreetingProps {
  lineCount: number
  stationCount: number
}

const KIND_ICON: Record<WeatherKind, typeof SunIcon> = {
  clear: SunIcon,
  cloudy: CloudIcon,
  drizzle: CloudRainIcon,
  rain: CloudRainIcon,
  storm: CloudRainIcon
}

/** Tên gọi trong tiếng Việt nằm ở cuối họ tên đầy đủ. */
const givenNameOf = (fullName: string): string =>
  fullName.trim().split(/\s+/).at(-1) || 'bạn'

/**
 * Đầu tuyến: xác nhận đúng người, đúng giờ, đúng phạm vi. Không số liệu
 * nghiệp vụ — chỉ những thứ đã có thật trong phiên đăng nhập.
 */
export function ShiftGreeting({ lineCount, stationCount }: ShiftGreetingProps) {
  const profile = useAppSelector((state) => state.auth.profile)
  const clock = useShiftClock()
  const weather = useAuthWeather()

  const displayName = profile.fullName || profile.username || profile.email
  const WeatherIcon = weather.condition
    ? KIND_ICON[weather.condition.kind]
    : null

  return (
    <div data-portal-greeting>
      <h1
        data-portal-heading
        tabIndex={-1}
        className='font-signage text-[clamp(2rem,3.6vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-portal-ink outline-none'
      >
        {givenNameOf(displayName)}
        <span className='text-primary'>.</span>
      </h1>

      <p
        data-portal-intro
        className='mt-2.5 max-w-[44ch] text-[13px] leading-5 text-portal-ink-soft'
      >
        Bản đồ chỉ vẽ những tuyến tài khoản này được phép đi — {lineCount}{' '}
        tuyến, {stationCount} ga.
      </p>

      <dl
        data-portal-status
        className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-signage text-[11px] font-semibold uppercase tracking-[0.12em] text-portal-ink-soft'
      >
        <div className='flex items-center gap-1.5'>
          <dt className='sr-only'>Buổi trong ngày</dt>
          <dd>{clock.greeting}</dd>
        </div>
        <div className='flex items-baseline gap-1.5'>
          <dt className='sr-only'>Giờ hiện tại</dt>
          <dd className='tabular-nums text-[15px] leading-4 text-portal-ink'>
            {clock.time}
          </dd>
        </div>
        <div className='flex items-center gap-1.5'>
          <dt className='sr-only'>Hôm nay</dt>
          <dd>{clock.date}</dd>
        </div>

        {weather.status === 'loading' && (
          <div
            aria-hidden
            className='h-3 w-28 animate-pulse rounded-full bg-portal-rule'
          />
        )}
        {weather.status === 'data' && WeatherIcon && weather.condition && (
          <div className='flex items-center gap-1.5'>
            <dt className='sr-only'>Thời tiết</dt>
            <dd className='flex items-center gap-1.5'>
              <WeatherIcon
                aria-hidden
                size={14}
                weight='duotone'
              />
              {weather.locationLabel} ·{' '}
              <span className='tabular-nums'>
                {Math.round(weather.condition.temperature)}°C
              </span>
              {weather.canRequest && (
                <button
                  type='button'
                  onClick={weather.requestLocation}
                  aria-label='Dùng vị trí của tôi'
                  className='grid size-4 place-items-center rounded-full outline-none transition-colors hover:bg-portal-rule focus-visible:ring-2 focus-visible:ring-primary'
                >
                  <MapPinIcon
                    aria-hidden
                    size={11}
                  />
                </button>
              )}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
