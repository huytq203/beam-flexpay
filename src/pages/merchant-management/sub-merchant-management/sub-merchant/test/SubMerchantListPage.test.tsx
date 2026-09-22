import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import { createFixtureSubMerchant, resetSubMerchantRepository } from '../hooks/useSubMerchants'
import SubMerchantListPage from '../pages/SubMerchantListPage'
import { suppressAntPseudoElementWarning } from './domTestSetup'

suppressAntPseudoElementWarning()

const findRenderedOption = async (name: RegExp | string): Promise<HTMLElement> => {
  const matches = await screen.findAllByText(name)
  const option = matches.find((element) =>
    element.classList.contains('ant-select-item-option-content')
  )
  if (!option) throw new Error(`Không tìm thấy option hiển thị: ${String(name)}`)
  return option
}

type ListState = 'loading' | 'error' | 'empty' | 'success'

interface RenderListOptions {
  permissions?: string[]
  initialListState?: ListState
}

const renderList = ({
  permissions = [PERMISSION.MERCHANT_VIEW],
  initialListState
}: RenderListOptions = {}) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/secure-panel/merchant/sub-merchant']}>
        <Routes>
          <Route
            path='/secure-panel/merchant/sub-merchant'
            element={<SubMerchantListPage initialListState={initialListState} />}
          />
          <Route
            path='/secure-panel/merchant/sub-merchant/create'
            element={<p>Màn tạo Sub-merchant</p>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('SubMerchantListPage', () => {
  beforeEach(() => resetSubMerchantRepository())

  it('lọc theo mã và đặt lại trang về đầu', async () => {
    const user = userEvent.setup()
    renderList()

    await user.type(screen.getByRole('textbox', { name: 'Từ khóa' }), 'SUB-0142-01')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(screen.getByText('SUB-0142-01')).toBeInTheDocument()
    expect(screen.queryByText('SUB-0220-02')).not.toBeInTheDocument()
  })

  it('đặt lại trang một khi tìm kiếm sau khi đang ở trang hai', async () => {
    const user = userEvent.setup()
    for (let index = 1; index <= 12; index += 1) {
      createFixtureSubMerchant({
        parentMerchantId: 'merchant-0142',
        name: `Pagination ${index}`,
        phoneInherited: true,
        phone: '',
        addressInherited: true,
        address: '',
        businessField: 'F&B'
      })
    }
    renderList()

    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('Pagination 2')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Từ khóa' }), 'Pagination')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(await screen.findByText('Pagination 12')).toBeInTheDocument()
    expect(screen.queryByText('Pagination 2')).not.toBeInTheDocument()
  })

  it('dùng thao tác icon và ẩn quyền thay đổi với người chỉ được xem', async () => {
    renderList()

    expect(
      await screen.findByRole('button', { name: 'Xem Sub-merchant HLC Nguyễn Huệ' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Sửa Sub-merchant/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Khóa Sub-merchant/ })).not.toBeInTheDocument()
  })

  it('hiển thị loading, error và thử lại về danh sách', async () => {
    const loadingView = renderList({ initialListState: 'loading' })
    expect(screen.getByRole('status', { name: /Đang tải danh sách Sub-merchant/ })).toBeInTheDocument()
    loadingView.unmount()

    const user = userEvent.setup()
    renderList({ initialListState: 'error' })
    expect(screen.getByText('Không tải được danh sách Sub-merchant')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('SUB-0142-01')).toBeInTheDocument()
  })

  it('hiển thị empty và vô hiệu hóa xuất CSV khi bộ lọc không có kết quả', async () => {
    const user = userEvent.setup()
    renderList()

    await user.type(screen.getByRole('textbox', { name: 'Từ khóa' }), 'không tồn tại')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeDisabled()
  })

  it('chặn mở khóa khi Sub-merchant bị tạm ngưng theo Merchant cha', async () => {
    const user = userEvent.setup()
    renderList({ permissions: [PERMISSION.MERCHANT_UPDATE] })

    await user.click(await screen.findByRole('button', { name: /Mở khóa Sub-merchant GS25 Nguyễn Trãi/ }))
    expect(screen.getByText('Cần mở khóa Merchant cha trước')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('chiếu cascade và chặn mở khóa Sub raw LOCKED khi Merchant cha bị khóa', async () => {
    const user = userEvent.setup()
    renderList({ permissions: [PERMISSION.MERCHANT_UPDATE] })

    const row = (await screen.findByText('SUB-0220-02')).closest('tr')
    expect(row).not.toBeNull()
    expect(within(row!).getByText('Tạm ngưng theo cấp cha')).toBeInTheDocument()
    expect(within(row!).queryByRole('button', { name: /Sửa Sub-merchant/ })).not.toBeInTheDocument()
    await user.click(within(row!).getByRole('button', { name: /Mở khóa Sub-merchant/ }))

    expect(screen.getByText('Cần mở khóa Merchant cha trước')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('lọc được Sub vừa tạo theo parent FlexPay Mart từ parent source chung', async () => {
    const user = userEvent.setup()
    createFixtureSubMerchant({
      parentMerchantId: 'merchant-0301',
      name: 'FlexPay Mart Lê Lợi',
      phoneInherited: true,
      phone: '',
      addressInherited: true,
      address: '',
      businessField: 'Bán lẻ'
    })
    renderList()

    await user.click(screen.getByRole('combobox', { name: 'Merchant cha' }))
    await user.click(await findRenderedOption(/FlexPay Mart \(MC000301\)/))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(await screen.findByText('FlexPay Mart Lê Lợi')).toBeInTheDocument()
    expect(screen.queryByText('HLC Nguyễn Huệ')).not.toBeInTheDocument()
  })

  it('điều hướng sang màn tạo khi có quyền', async () => {
    const user = userEvent.setup()
    renderList({ permissions: [PERMISSION.MERCHANT_CREATE] })

    await user.click(screen.getByRole('button', { name: 'Thêm Sub-merchant' }))
    expect(await screen.findByText('Màn tạo Sub-merchant')).toBeInTheDocument()
  })
})
