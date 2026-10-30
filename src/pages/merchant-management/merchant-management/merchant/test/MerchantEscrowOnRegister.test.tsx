import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import CreateMerchant from '../pages/CreateMerchant'

const renderAt = (path: string) =>
  render(
    <Provider store={createAppStore()}>
      <MessageProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path='/merchants/create'
              element={<CreateMerchant />}
            />
            <Route
              path='/merchants/:id/edit'
              element={<CreateMerchant />}
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )

describe('Số tiền ký quỹ trên form ĐVCNTT', () => {
  it('chế độ tạo hiển thị ô ký quỹ bắt buộc cùng ghi chú hạn nộp', async () => {
    renderAt('/merchants/create')

    expect(await screen.findByLabelText(/Số tiền ký quỹ/)).toBeInTheDocument()
    expect(
      screen.getByText(/Hạn nộp 30 ngày tính từ khi ĐVCNTT được duyệt/)
    ).toBeInTheDocument()

    // Gửi form khi chưa nhập: phải báo lỗi bắt buộc, không gọi API.
    const user = userEvent.setup()
    await user.click(
      screen
        .getByText('Đăng ký ĐVCNTT', { selector: 'span' })
        .closest('button')!
    )
    expect(
      await screen.findByText('Vui lòng nhập số tiền ký quỹ')
    ).toBeInTheDocument()
  })

  it('gửi escrowAmount trong body POST khi đăng ký', async () => {
    let postedBody: Record<string, unknown> | undefined
    server.use(
      http.get('*/merchants/selectable-wallets', () =>
        HttpResponse.json({
          success: true,
          data: {
            content: [
              {
                id: 'wallet-1',
                legalName: 'Công ty Sao Việt',
                registeredEmail: 'finance@example.com',
                taxCode: '0301234567',
                businessType: 'ENTERPRISE'
              }
            ],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10
          }
        })
      ),
      http.post('*/merchants', async ({ request }) => {
        postedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true, data: { id: 'merchant-9' } })
      })
    )
    const user = userEvent.setup()
    renderAt('/merchants/create')

    await user.click(await screen.findByText('Chọn ví'))
    await user.click(
      await screen.findByRole('button', { name: 'Chọn ví Công ty Sao Việt' })
    )
    // Ký hợp đồng ở Sub để khỏi phải tải PDF Master.
    await user.click(screen.getByRole('switch'))
    const [mccSelect] = screen
      .getAllByRole('combobox')
      .filter((el) =>
        el.closest('.ant-select')?.textContent?.includes('ngành nghề')
      )
    await user.click(mccSelect)
    await user.click(await screen.findByText('Dịch vụ phần mềm (MCC 5734)'))
    await user.type(
      screen.getByPlaceholderText('Tên hiển thị khi thu/chi hộ'),
      'Cửa hàng A'
    )
    await user.type(screen.getByLabelText(/Số tiền ký quỹ/), '50000000')
    await user.click(
      screen
        .getByText('Đăng ký ĐVCNTT', { selector: 'span' })
        .closest('button')!
    )

    await waitFor(() => expect(postedBody).toBeDefined())
    expect(postedBody?.escrowAmount).toBe(50000000)
  }, 20_000) // luồng dài (chọn ví, MCC, nhập liệu) nên chậm khi máy tải

  it('chế độ sửa không hiển thị ô ký quỹ và PUT không kèm escrowAmount', async () => {
    let savedPayload: Record<string, unknown> | undefined
    server.use(
      http.get('*/merchants/merchant-1', () =>
        HttpResponse.json({
          success: true,
          data: {
            id: 'merchant-1',
            name: 'Cửa hàng thử nghiệm',
            mccCode: '5734',
            merchantType: 'ENTERPRISE',
            enterpriseWalletId: 'wallet-1',
            enterpriseWallet: {
              id: 'wallet-1',
              legalName: 'Công ty thử nghiệm',
              registeredEmail: 'owner@example.com',
              businessType: 'ENTERPRISE'
            },
            contractSignedWithSub: true
          }
        })
      ),
      http.put('*/merchants/merchant-1', async ({ request }) => {
        savedPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true, data: { id: 'merchant-1' } })
      })
    )
    renderAt('/merchants/merchant-1/edit')

    await screen.findByDisplayValue('Cửa hàng thử nghiệm')
    expect(screen.queryByLabelText(/Số tiền ký quỹ/)).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByText('Lưu thay đổi').closest('button')!)
    await waitFor(() => expect(savedPayload).toBeDefined())
    expect(savedPayload).not.toHaveProperty('escrowAmount')
  })
})
