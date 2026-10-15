import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import SubMerchantFormPage from '../pages/SubMerchantFormPage'

const PARENT = {
  id: 'merchant-101',
  code: 'MC000101',
  name: 'Highlands Coffee',
  status: 'ACTIVE',
  contactPhone: '02873001122',
  address: '123 Nguyễn Đình Chiểu, TP. Hồ Chí Minh'
}

const merchantRequests: URL[] = []

beforeEach(() => {
  merchantRequests.length = 0
  server.use(
    http.get('*/merchants', ({ request }) => {
      merchantRequests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [PARENT], totalElements: 250, number: 0, size: 10 }
      })
    }),
    http.get('*/merchants/merchant-101', () =>
      HttpResponse.json({ data: PARENT })
    ),
    http.get('*/sub-merchants/sub-1', () =>
      HttpResponse.json({
        data: {
          id: 'sub-1',
          code: 'SUB-1',
          name: 'Chi nhánh Quận 1',
          status: 'ACTIVE',
          merchantId: 'merchant-101',
          phone: { value: '02873001122', inherited: true },
          address: { value: PARENT.address, inherited: true }
        }
      })
    )
  )
})

const renderForm = (route: string) => {
  const store = createAppStore()
  store.dispatch(
    savePermissions([
      PERMISSION.SUB_MERCHANT_VIEW,
      PERMISSION.SUB_MERCHANT_CREATE,
      PERMISSION.SUB_MERCHANT_UPDATE
    ])
  )
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path='/sub-merchant/create'
              element={<SubMerchantFormPage />}
            />
            <Route
              path='/sub-merchant/edit/:id'
              element={<SubMerchantFormPage />}
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

describe('SubMerchantFormPage — chọn Merchant cha', () => {
  it('chưa chọn Merchant cha thì ô kế thừa báo cần chọn trước, không gọi danh sách', () => {
    renderForm('/sub-merchant/create')

    expect(screen.getByLabelText('Số điện thoại')).toBeDisabled()
    expect(screen.getByLabelText('Số điện thoại')).toHaveAttribute(
      'placeholder',
      'Chọn Merchant cha trước'
    )
    expect(merchantRequests).toHaveLength(0)
  })

  it('tìm Merchant cha trên server theo trang và hiện giá trị kế thừa sau khi chọn', async () => {
    const user = userEvent.setup()
    renderForm('/sub-merchant/create')

    await user.click(screen.getByRole('button', { name: 'Chọn Merchant cha' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Chọn Merchant cha'
    })
    await user.type(
      within(dialog).getByLabelText('Tìm theo tên Merchant'),
      'Highlands'
    )
    await waitFor(() => {
      const last = merchantRequests.at(-1)
      expect(last?.searchParams.get('name')).toBe('Highlands')
      expect(last?.searchParams.get('status')).toBe('ACTIVE')
      expect(last?.searchParams.get('size')).toBe('10')
    })
    await user.click(
      await within(dialog).findByRole('button', {
        name: 'Chọn Merchant Highlands Coffee'
      })
    )

    await waitFor(() =>
      expect(screen.getByLabelText('Số điện thoại')).toHaveValue(
        PARENT.contactPhone
      )
    )
    expect(
      screen.getByText('Mã Merchant').nextElementSibling
    ).toHaveTextContent('MC000101')
    expect(screen.getByLabelText('Địa chỉ')).toHaveValue(PARENT.address)
  })

  it('tắt kế thừa thì mở ô nhập riêng và bắt buộc nhập', async () => {
    const user = userEvent.setup()
    renderForm('/sub-merchant/create')

    await user.click(
      screen.getByLabelText('Kế thừa số điện thoại Merchant cha')
    )

    expect(screen.getByLabelText(/Số điện thoại/)).toBeEnabled()
    await user.click(
      document.querySelector('button[form="sub-merchant-form"]')!
    )
    expect(
      await screen.findByText('Vui lòng nhập số điện thoại')
    ).toBeInTheDocument()
  })

  it('chế độ sửa nạp Merchant cha theo id và khóa việc đổi', async () => {
    renderForm('/sub-merchant/edit/sub-1')

    expect(await screen.findByText('Highlands Coffee')).toBeInTheDocument()
    expect(
      screen.getByText('Không thể đổi Merchant cha sau khi tạo.')
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Đổi Merchant cha' })
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Địa chỉ')).toHaveValue(PARENT.address)
  })

  it('tạo Sub có settlementBankAccountWarning vẫn thành công và hiện cảnh báo', async () => {
    const user = userEvent.setup()
    const warning =
      'Master chưa có tài khoản nhận doanh thu mặc định. Sub-merchant này chưa tạo được lệnh rút.'
    server.use(
      http.post('*/sub-merchants', () =>
        HttpResponse.json(
          {
            success: true,
            data: {
              id: 'sub-new',
              code: 'SUB-NEW',
              settlementBankAccountId: null,
              settlementBankAccountWarning: warning
            }
          },
          { status: 201 }
        )
      )
    )
    renderForm('/sub-merchant/create')
    await user.click(screen.getByRole('button', { name: 'Chọn Merchant cha' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Chọn Merchant cha'
    })
    await user.click(
      await within(dialog).findByRole('button', {
        name: 'Chọn Merchant Highlands Coffee'
      })
    )
    await user.type(screen.getByLabelText(/Tên Sub-merchant/), 'Chi nhánh mới')
    await user.click(
      document.querySelector('button[form="sub-merchant-form"]')!
    )
    expect(await screen.findByText(warning)).toBeInTheDocument()
    expect(screen.queryByText('Không thể lưu Sub-merchant')).toBeNull()
  })
})
