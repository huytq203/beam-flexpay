import { describe, expect, it } from 'vitest'
import { act, render } from '@testing-library/react'
import { CloudField } from '../CloudField'
import { CLOUD_LAYERS } from '../cloud-shapes'

const PALETTE = { light: '#ffffff', shade: '#a5e4dd' }

const CLOUDS_PER_TRACK = CLOUD_LAYERS.reduce(
  (total, layer) => total + layer.clouds.length,
  0
)

const renderField = () => render(<CloudField palette={PALETTE} />)

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true
  })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

describe('CloudField', () => {
  it('nhân đôi mỗi lớp mây để track lặp lại không có mối nối', () => {
    const { container } = renderField()

    expect(container.querySelectorAll('.auth-cloud-track')).toHaveLength(
      CLOUD_LAYERS.length
    )
    expect(container.querySelectorAll('.auth-cloud')).toHaveLength(
      CLOUDS_PER_TRACK * 2
    )
  })

  it('đặt bản nhân đôi lệch đúng 50% chiều rộng track', () => {
    const { container } = renderField()
    const [firstTrack] = container.querySelectorAll('.auth-cloud-track')
    const layer = CLOUD_LAYERS[0]
    const clouds = firstTrack.querySelectorAll<HTMLElement>('.auth-cloud')

    layer.clouds.forEach((cloud, index) => {
      expect(clouds[index].style.left).toBe(`${cloud.left}%`)
      expect(clouds[index + layer.clouds.length].style.left).toBe(
        `${cloud.left + 50}%`
      )
    })
  })

  it('giữ bản gốc và bản nhân đôi trùng pha nhấp nhô', () => {
    const { container } = renderField()
    const floating = container.querySelectorAll<HTMLElement>('.auth-cloud--float')
    const half = floating.length / 2

    expect(half).toBeGreaterThan(0)
    for (let index = 0; index < half; index += 1) {
      const original = floating[index]
      const duplicate = floating[index + half]
      expect(duplicate.style.animationDuration).toBe(
        original.style.animationDuration
      )
      expect(duplicate.style.animationDelay).toBe(original.style.animationDelay)
    }
  })

  it('tô mây bằng đúng hai tông của bảng màu đang truyền vào', () => {
    const { container } = renderField()
    const fills = [...container.querySelectorAll('.auth-cloud-fill')].map(
      (group) => group.getAttribute('fill')
    )

    expect(new Set(fills)).toEqual(new Set([PALETTE.light, PALETTE.shade]))
  })

  it('ẩn khỏi trình đọc màn hình và không nhận tương tác', () => {
    const { container } = renderField()
    const field = container.querySelector('.auth-cloudfield')

    expect(field).toHaveAttribute('aria-hidden', 'true')
    expect(field).toHaveClass('pointer-events-none')
  })

  it('dừng vòng lặp khi người dùng rời tab và chạy lại khi quay về', () => {
    const { container } = renderField()
    const field = container.querySelector('.auth-cloudfield')
    expect(field).toHaveAttribute('data-paused', 'false')

    setVisibility('hidden')
    expect(field).toHaveAttribute('data-paused', 'true')

    setVisibility('visible')
    expect(field).toHaveAttribute('data-paused', 'false')
  })
})
