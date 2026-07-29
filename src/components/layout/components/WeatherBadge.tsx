import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  MapPin,
  Sun,
  type LucideIcon
} from 'lucide-react'
import type { ReactElement } from 'react'
import type { WeatherStatus } from '../hooks/useAuthWeather'
import type { WeatherCondition, WeatherKind } from './weather-scene'

const KIND_ICON: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  storm: CloudLightning
}

export interface WeatherBadgeProps {
  status: WeatherStatus
  condition: WeatherCondition | null
  locationLabel: string
  canRequest: boolean
  /** Panel đang ở tông tối (đêm/hoàng hôn) nên badge phải dùng chữ sáng. */
  usesLightText: boolean
  onRequestLocation: () => void
}

/** Nhiệt độ và điều kiện thời tiết, đặt ngay dưới badge giờ Việt Nam. */
export function WeatherBadge({
  status,
  condition,
  locationLabel,
  canRequest,
  usesLightText,
  onRequestLocation
}: WeatherBadgeProps): ReactElement | null {
  if (status === 'error' || status === 'empty') return null

  const shellClass = `flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide transition-colors duration-1000 ${
    usesLightText ? 'bg-white/10 text-teal-50' : 'bg-white/45 text-teal-900/70'
  }`

  if (status === 'loading' || !condition) {
    return (
      <div className={shellClass} data-state="loading" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-current opacity-60" />
        <span className="h-2 w-16 animate-pulse rounded-full bg-current opacity-25" />
      </div>
    )
  }

  const Icon = KIND_ICON[condition.kind]
  const summary = `${locationLabel} · ${Math.round(condition.temperature)}°C · ${condition.label}`

  return (
    <div className={shellClass}>
      <Icon className="size-3" aria-hidden="true" />
      <span aria-label={`Thời tiết hiện tại ${summary}`}>{summary}</span>
      {canRequest && (
        <button
          type="button"
          onClick={onRequestLocation}
          aria-label="Dùng vị trí của tôi"
          className="grid size-4 place-items-center rounded-full transition-colors hover:bg-current/15 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <MapPin className="size-2.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
