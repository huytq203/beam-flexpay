import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'
import TransitPortal from '../TransitPortal'

// jsdom không có WebGL: giữ cảnh three.js ngoài phạm vi test, màn hình sẽ rơi
// về bản đồ SVG đúng như khi trình duyệt thật không dựng được context.
vi.mock('../components/network-scene', () => ({
  createNetworkScene: () => null
}))

// Thời tiết là chi tiết trang trí đi qua mạng; cố định nó để test tập trung
// vào danh mục theo quyền.
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

const storeWithPermissions = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return store
}

describe('TransitPortal', () => {
  it('vẽ các tuyến và ga mà tài khoản được cấp quyền', () => {
    renderWithProviders(<TransitPortal />, {
      store: storeWithPermissions(['EWALLET:ADMIN:FULL'])
    })

    expect(
      screen.getByRole('heading', { name: /quản lý giao dịch/i, level: 2 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /quản lý phí/i, level: 2 })
    ).toBeInTheDocument()

    const station = screen.getByRole('link', { name: 'Duyệt eKYC' })
    expect(station).toHaveAttribute(
      'href',
      '/secure-panel/wallet-administration/confirm-eKYC'
    )
  })

  it('chỉ vẽ tuyến thuộc module được cấp, không vẽ tuyến bị chặn', () => {
    renderWithProviders(<TransitPortal />, {
      store: storeWithPermissions(['EWALLET:FEE:VIEW'])
    })

    expect(
      screen.getByRole('heading', { name: /quản lý phí/i, level: 2 })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /quản lý giao dịch/i, level: 2 })
    ).not.toBeInTheDocument()
  })

  it('thay toàn bộ bản đồ bằng hướng dẫn khi tài khoản chưa có quyền nào', () => {
    renderWithProviders(<TransitPortal />, {
      store: storeWithPermissions([])
    })

    expect(
      screen.getByRole('heading', { name: /chưa có tuyến nào mở/i })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
