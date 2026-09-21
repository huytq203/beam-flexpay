import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'

import { MerchantGatewayPage } from '../MerchantGatewayPage'
import { MerchantGatewayToolbar } from '../MerchantGatewayToolbar'

const renderPage = (permissions: string[], onCreate = vi.fn()) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return {
    onCreate,
    ...renderWithProviders(
      <MerchantGatewayPage
        createLabel='Thêm cấu hình'
        description='Cấu hình vận hành merchant.'
        onCreate={onCreate}
        screen='MERCHANT_KEY_CONNECTION'
        title='Key kết nối'
        total={1}
      >
        <MerchantGatewayToolbar search={<input aria-label='Tìm kiếm key' />}>
          <button type='button'>Lọc trạng thái</button>
        </MerchantGatewayToolbar>
        <div>Danh sách key</div>
      </MerchantGatewayPage>,
      { store }
    )
  }
}

describe('Merchant gateway shared shell', () => {
  it('shows and invokes the create CTA with create permission', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderPage(['EWALLET:MERCHANT:CREATE'])

    await user.click(screen.getByRole('button', { name: 'Thêm cấu hình' }))

    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('hides the create CTA without create permission', () => {
    renderPage(['EWALLET:MERCHANT:VIEW'])

    expect(
      screen.queryByRole('button', { name: 'Thêm cấu hình' })
    ).not.toBeInTheDocument()
  })

  it('exposes the toolbar as a named search landmark', () => {
    renderPage(['EWALLET:MERCHANT:VIEW'])

    expect(
      screen.getByRole('search', {
        name: 'Tìm kiếm và lọc cấu hình merchant'
      })
    ).toBeInTheDocument()
  })
})
