import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import { resetSubMerchantRepository } from '../hooks/useSubMerchants'
import SubMerchantDetailPage from '../pages/SubMerchantDetailPage'
import { suppressAntPseudoElementWarning } from './domTestSetup'

suppressAntPseudoElementWarning()

const renderDetail = (id: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/secure-panel/merchant/sub-merchant/detail/${id}`]}>
        <Routes>
          <Route path='/secure-panel/merchant/sub-merchant/detail/:id' element={<SubMerchantDetailPage />} />
          <Route path='/secure-panel/merchant/sub-merchant' element={<p>Đã về danh sách</p>} />
          <Route path='/secure-panel/merchant/sub-merchant/edit/:id' element={<p>Đã sang màn sửa</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('SubMerchantDetailPage', () => {
  beforeEach(() => resetSubMerchantRepository())

  it('che số tài khoản và key tích hợp', async () => {
    renderDetail('sub-001', [PERMISSION.MERCHANT_VIEW])

    expect((await screen.findAllByText(/••••/)).length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByText('9704361234567890')).not.toBeInTheDocument()
  })

  it('không mở khóa Sub-merchant bị tạm ngưng theo Merchant cha', async () => {
    const user = userEvent.setup()
    renderDetail('sub-suspended', [PERMISSION.MERCHANT_UPDATE])

    await user.click(await screen.findByRole('button', { name: 'Mở khóa Sub-merchant' }))
    expect(screen.getByText('Cần mở khóa Merchant cha trước')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('chiếu parent cascade cho Sub raw LOCKED và ẩn hành động sửa', async () => {
    const user = userEvent.setup()
    renderDetail('sub-locked', [PERMISSION.MERCHANT_UPDATE])

    expect((await screen.findAllByText('Tạm ngưng theo cấp cha')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Sửa Sub-merchant' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mở khóa Sub-merchant' }))

    expect(screen.getByText('Cần mở khóa Merchant cha trước')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('ẩn hành động sửa và khóa với người chỉ có quyền xem', async () => {
    renderDetail('sub-001', [PERMISSION.MERCHANT_VIEW])

    expect(await screen.findByRole('heading', { name: 'HLC Nguyễn Huệ' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sửa Sub-merchant' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Khóa Sub-merchant' })).not.toBeInTheDocument()
  })

  it('khóa bản ghi và cập nhật trạng thái sau xác nhận có lý do', async () => {
    const user = userEvent.setup()
    renderDetail('sub-001', [PERMISSION.MERCHANT_UPDATE])

    await user.click(await screen.findByRole('button', { name: 'Khóa Sub-merchant' }))
    await user.type(screen.getByLabelText('Lý do khóa'), 'Tạm khóa để đối soát')
    await user.click(screen.getByRole('button', { name: 'Khóa' }))

    expect((await screen.findAllByText('Đã khóa')).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'Mở khóa Sub-merchant' })).toBeInTheDocument()
  })

  it('hiển thị not-found và cho quay lại danh sách', async () => {
    const user = userEvent.setup()
    renderDetail('missing', [PERMISSION.MERCHANT_VIEW])

    expect(await screen.findByText('Không tìm thấy Sub-merchant')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Về danh sách Sub-merchant' }))
    expect(await screen.findByText('Đã về danh sách')).toBeInTheDocument()
  })
})
