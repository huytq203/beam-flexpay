import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RainField } from '../RainField'
import { RAIN_DROP_COUNT } from '../weather-scene'

const setVisibility = (state: 'visible' | 'hidden'): void => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true
  })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

describe('RainField', () => {
  it('không render gì khi trời không mưa', () => {
    const { container } = render(<RainField intensity="none" />)

    expect(container.querySelector('.auth-rainfield')).toBeNull()
  })

  it.each(['light', 'moderate', 'heavy'] as const)(
    'render đúng số hạt cho mưa cấp %s',
    (intensity) => {
      const { container } = render(<RainField intensity={intensity} />)

      expect(container.querySelectorAll('.auth-raindrop')).toHaveLength(
        RAIN_DROP_COUNT[intensity]
      )
    }
  )

  it('sinh vị trí hạt mưa ổn định giữa hai lần render', () => {
    const readLefts = (): string[] => {
      const { container } = render(<RainField intensity="light" />)
      return [...container.querySelectorAll<HTMLElement>('.auth-raindrop')].map(
        (drop) => drop.style.left
      )
    }

    expect(readLefts()).toEqual(readLefts())
  })

  it('trải hạt mưa ra nhiều vị trí khác nhau', () => {
    const { container } = render(<RainField intensity="moderate" />)
    const lefts = [
      ...container.querySelectorAll<HTMLElement>('.auth-raindrop')
    ].map((drop) => drop.style.left)

    expect(new Set(lefts).size).toBeGreaterThan(20)
  })

  it('ẩn khỏi trình đọc màn hình và không nhận tương tác', () => {
    const { container } = render(<RainField intensity="light" />)
    const field = container.querySelector('.auth-rainfield')

    expect(field).toHaveAttribute('aria-hidden', 'true')
    expect(field).toHaveClass('pointer-events-none')
  })

  it('dừng mưa khi người dùng rời tab và chạy lại khi quay về', () => {
    setVisibility('visible')
    const { container } = render(<RainField intensity="light" />)
    const field = container.querySelector('.auth-rainfield')
    expect(field).toHaveAttribute('data-paused', 'false')

    setVisibility('hidden')
    expect(field).toHaveAttribute('data-paused', 'true')

    setVisibility('visible')
    expect(field).toHaveAttribute('data-paused', 'false')
  })
})
