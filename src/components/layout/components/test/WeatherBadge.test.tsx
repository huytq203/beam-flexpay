import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WeatherBadge } from '../WeatherBadge'
import type { WeatherCondition } from '../weather-scene'

const RAINY: WeatherCondition = {
  kind: 'rain',
  rain: 'moderate',
  cloudCover: 87,
  temperature: 28.4,
  label: 'Mưa rào'
}

const renderBadge = (
  props: Partial<Parameters<typeof WeatherBadge>[0]> = {}
) =>
  render(
    <WeatherBadge
      status="data"
      condition={RAINY}
      locationLabel="Hà Nội"
      canRequest={false}
      usesLightText={false}
      onRequestLocation={vi.fn()}
      {...props}
    />
  )

describe('WeatherBadge', () => {
  it('hiện chỉ báo chờ khi đang tải', () => {
    const { container } = renderBadge({ status: 'loading', condition: null })

    expect(container.querySelector('[data-state="loading"]')).not.toBeNull()
    expect(screen.queryByText(/°C/)).toBeNull()
  })

  it('ẩn hoàn toàn khi lỗi', () => {
    const { container } = renderBadge({ status: 'error', condition: null })

    expect(container).toBeEmptyDOMElement()
  })

  it('ẩn hoàn toàn khi không có dữ liệu', () => {
    const { container } = renderBadge({ status: 'empty', condition: null })

    expect(container).toBeEmptyDOMElement()
  })

  it('hiện nhiệt độ làm tròn và nhãn tiếng Việt khi có dữ liệu', () => {
    renderBadge()

    expect(screen.getByText('Hà Nội · 28°C · Mưa rào')).toBeInTheDocument()
  })

  it('không hiện nút xin vị trí khi không được phép hỏi', () => {
    renderBadge()

    expect(
      screen.queryByRole('button', { name: 'Dùng vị trí của tôi' })
    ).toBeNull()
  })

  it('gọi callback khi người dùng chủ động bấm xin vị trí', async () => {
    const onRequestLocation = vi.fn()
    renderBadge({ canRequest: true, onRequestLocation })

    await userEvent.click(
      screen.getByRole('button', { name: 'Dùng vị trí của tôi' })
    )

    expect(onRequestLocation).toHaveBeenCalledOnce()
  })
})
