import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AuthBrandPanel } from '../AuthBrandPanel'
import { getSolarScene } from '../solar-scene'
import { applyWeather, type WeatherCondition } from '../weather-scene'

const NOON = new Date('2026-07-29T05:00:00Z')

const RAINY: WeatherCondition = {
  kind: 'rain',
  rain: 'moderate',
  cloudCover: 87,
  temperature: 28.4,
  label: 'Mưa rào'
}

const renderPanel = (
  condition: WeatherCondition | null,
  weatherProps: Partial<Parameters<typeof AuthBrandPanel>[0]> = {}
) =>
  render(
    <AuthBrandPanel
      scene={applyWeather(getSolarScene(NOON), condition)}
      isSynchronized
      weatherStatus={condition ? 'data' : 'loading'}
      condition={condition}
      locationLabel="Hà Nội"
      canRequest={false}
      onRequestLocation={vi.fn()}
      brandRef={createRef<HTMLDivElement>()}
      sceneRef={createRef<HTMLDivElement>()}
      mascotRef={createRef<HTMLDivElement>()}
      {...weatherProps}
    />
  )

describe('AuthBrandPanel', () => {
  it('đổ mưa khi thời tiết đang mưa', () => {
    const { container } = renderPanel(RAINY)

    expect(container.querySelectorAll('.auth-raindrop')).toHaveLength(60)
  })

  it('không đổ mưa khi chưa có dữ liệu thời tiết', () => {
    const { container } = renderPanel(null)

    expect(container.querySelector('.auth-rainfield')).toBeNull()
  })

  it('phủ lớp xám lên trời theo độ phủ mây', () => {
    const { container } = renderPanel(RAINY)
    const overcast = container.querySelector<HTMLElement>('.auth-overcast')

    expect(overcast).not.toBeNull()
    expect(Number(overcast?.style.opacity)).toBeGreaterThan(0)
  })

  it('vẫn hiện đồng hồ giờ Việt Nam bên cạnh badge thời tiết', () => {
    renderPanel(RAINY)

    expect(screen.getByText(/· VN$/)).toBeInTheDocument()
    expect(screen.getByText('Hà Nội · 28°C · Mưa rào')).toBeInTheDocument()
  })
})
