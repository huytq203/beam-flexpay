import { act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'
import TransitPortal from '../TransitPortal'

vi.mock('../components/network-scene', () => ({
  createNetworkScene: () => null
}))

vi.mock('@components/layout/hooks/useAuthWeather', () => ({
  WeatherStatus: {
    LOADING: 'loading',
    ERROR: 'error',
    EMPTY: 'empty',
    DATA: 'data'
  },
  useAuthWeather: () => ({
    status: 'empty',
    condition: null,
    locationLabel: 'Hà Nội',
    canRequest: false,
    requestLocation: () => {}
  })
}))

/**
 * Hồi quy cho một lỗi đã xảy ra thật trên máy người dùng: chuỗi mở màn làm mờ
 * danh mục tuyến rồi không hiện lại, và màn hình mất hẳn thứ điều hướng duy
 * nhất nó có.
 *
 * Bất biến được khoá ở đây mạnh hơn "cuối cùng thì hiện lại": chuyển động
 * KHÔNG BAO GIỜ được chạm vào `opacity` của các dải tuyến và các ga, ở bất kỳ
 * thời điểm nào của chuỗi. Nhờ vậy chuỗi chạy dở, đứng hẳn, hay không chạy đều
 * không thể giấu menu đi.
 */
describe('chuỗi mở màn của màn khởi động', () => {
  const NAV_SELECTOR = '[data-portal-line], [data-portal-station]'

  const renderPortal = () => {
    const store = createAppStore()
    store.dispatch(savePermissions(['EWALLET:ADMIN:FULL']))
    return { store, ...renderWithProviders(<TransitPortal />, { store }) }
  }

  const inlineOpacities = (container: HTMLElement): string[] => [
    ...new Set(
      [...container.querySelectorAll<HTMLElement>(NAV_SELECTOR)].map(
        (element) => element.style.opacity
      )
    )
  ]

  const tick = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  it('không bao giờ đặt opacity lên danh mục, ở mọi thời điểm của chuỗi', async () => {
    const { container } = renderPortal()

    // Lấy mẫu xuyên suốt chuỗi (~1.2s) chứ không chỉ ở trạng thái cuối: lỗi cũ
    // nằm ở giữa chừng, và một lần lấy mẫu sau cùng sẽ không thấy nó.
    for (let step = 0; step < 14; step += 1) {
      expect(inlineOpacities(container)).toEqual([''])
      await tick(100)
    }

    expect(
      container.querySelectorAll('[data-portal-line]')
    ).toHaveLength(5)
  })

  it('vẫn giữ danh mục hiện khi quyền đổi giữa lúc chuỗi đang chạy', async () => {
    const { container, store } = renderPortal()

    // Ép effect dựng chuỗi lần hai trên chính những phần tử đang animate dở.
    await tick(300)
    act(() => {
      store.dispatch(savePermissions(['EWALLET:TRANSACTION:FULL']))
    })

    for (let step = 0; step < 12; step += 1) {
      expect(inlineOpacities(container)).toEqual([''])
      await tick(100)
    }

    expect(
      container.querySelectorAll('[data-portal-line]').length
    ).toBeGreaterThan(0)
  })
})
