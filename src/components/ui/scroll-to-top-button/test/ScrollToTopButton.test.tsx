import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollToTopButton } from '../ScrollToTopButton'

describe('ScrollToTopButton', () => {
  it('hiển thị tiến độ cuộn của vùng nội dung', async () => {
    const scrollContainer = document.createElement('div')
    Object.defineProperties(scrollContainer, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 400, writable: true }
    })

    render(<ScrollToTopButton target={() => scrollContainer} />)

    const button = screen.getByRole('button', { name: 'Cuộn lên đầu trang' })
    await waitFor(() => {
      expect(button.style.getPropertyValue('--scroll-progress')).toBe('180deg')
    })
  })

  it('cho phép tắt vòng tiến độ khi tái sử dụng', () => {
    render(<ScrollToTopButton showProgress={false} />)

    expect(
      screen.getByRole('button', { name: 'Cuộn lên đầu trang' })
    ).not.toHaveClass('show-progress')
  })
})
