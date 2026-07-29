import type { CSSProperties, ReactElement } from 'react'
import { usePageHidden } from '../hooks/usePageHidden'
import { RAIN_DROP_COUNT, type RainIntensity } from './weather-scene'
import './rain-field.css'

/**
 * Nhiễu tất định theo index. Cố ý không dùng Math.random: mỗi lần poll thời
 * tiết component re-render, random sẽ khiến toàn bộ hạt mưa nhảy vị trí.
 */
const noise = (seed: number): number => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const dropStyle = (index: number): CSSProperties => ({
  left: `${(noise(index) * 108 - 4).toFixed(2)}%`,
  height: `${(9 + noise(index + 101) * 13).toFixed(1)}px`,
  opacity: 0.35 + noise(index + 211) * 0.45,
  animationDelay: `${(noise(index + 307) * -1.6).toFixed(2)}s`,
  animationDuration: `${(0.62 + noise(index + 419) * 0.5).toFixed(2)}s`
})

export interface RainFieldProps {
  intensity: RainIntensity
}

/** Màn mưa phủ toàn panel, nằm trên dãy núi của cảnh mặt trời. */
export function RainField({
  intensity
}: RainFieldProps): ReactElement | null {
  const isPageHidden = usePageHidden()
  const dropCount = RAIN_DROP_COUNT[intensity]

  if (dropCount === 0) return null

  return (
    <div
      className="auth-rainfield pointer-events-none absolute inset-0 z-20 overflow-hidden"
      data-paused={isPageHidden}
      aria-hidden="true"
    >
      {[...Array(dropCount).keys()].map((index) => (
        <span key={index} className="auth-raindrop" style={dropStyle(index)} />
      ))}
    </div>
  )
}
