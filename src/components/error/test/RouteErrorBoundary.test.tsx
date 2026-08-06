import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RouteErrorBoundary from '../RouteErrorBoundary'

let routeError: unknown = null

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useRouteError: () => routeError }
})

const reload = vi.fn()

const renderBoundary = () =>
  render(
    <MemoryRouter initialEntries={['/secure-panel/merchant/merchant-management']}>
      <RouteErrorBoundary />
    </MemoryRouter>
  )

beforeEach(() => {
  sessionStorage.clear()
  reload.mockClear()
  routeError = null
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload },
    writable: true,
    configurable: true
  })
})

describe('RouteErrorBoundary', () => {
  it('hiện màn 404 khi router báo đúng 404', () => {
    routeError = {
      status: 404,
      statusText: 'Not Found',
      data: null,
      internal: true
    }

    renderBoundary()

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
  })

  it('không hiện 404 mà tự reload khi lỗi là nạp chunk thất bại', () => {
    routeError = new Error(
      'Failed to fetch dynamically imported module: /assets/MerchantManagement-abc.js'
    )

    renderBoundary()

    expect(reload).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('404')).not.toBeInTheDocument()
  })

  it('hiện màn cập nhật khi lỗi chunk lặp lại và reload bị chặn', () => {
    routeError = new Error('Failed to fetch dynamically imported module: /assets/a.js')
    const { unmount } = renderBoundary()
    unmount()

    renderBoundary()

    expect(reload).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Ứng dụng vừa được cập nhật')).toBeInTheDocument()
  })

  it('hiện màn lỗi chung cho lỗi render, không đổ ra 404', () => {
    routeError = new TypeError("Cannot read properties of undefined (reading 'id')")

    renderBoundary()

    expect(screen.getByText('Không tải được nội dung')).toBeInTheDocument()
    expect(screen.queryByText('404')).not.toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
  })
})
