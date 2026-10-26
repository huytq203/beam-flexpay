import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { TerminateMerchantDialog } from '../components/TerminateMerchantDialog'

const merchant = {
  id: 'm1',
  name: 'Công ty A',
  code: 'MC0001',
  status: 'ACTIVE' as const
}

const obligation = {
  code: 'SUB_AVAILABLE',
  subMerchantId: 'sub-1',
  subCode: 'SUB01',
  amount: 150000,
  message: 'Sub-merchant còn số dư khả dụng',
  guidance: 'Rút hoặc chuyển hết số dư trước khi chấm dứt'
}

const renderDialog = () =>
  render(
    <Provider store={createAppStore()}>
      <TerminateMerchantDialog
        merchant={merchant}
        onClose={vi.fn()}
      />
    </Provider>
  )

const otpButton = () => screen.getByRole('button', { name: 'Gửi mã OTP' })

describe('Nghĩa vụ tồn đọng khi chấm dứt hợp tác', { timeout: 20000 }, () => {
  it('liệt kê nghĩa vụ kèm hướng dẫn và khóa nút xác nhận', async () => {
    let requested = 0
    server.use(
      http.get('*/merchants/m1/termination-obligations', () => {
        requested += 1
        return HttpResponse.json({ data: [obligation], success: true })
      })
    )
    renderDialog()

    expect(
      await screen.findByText(/Sub-merchant còn số dư khả dụng/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('Rút hoặc chuyển hết số dư trước khi chấm dứt')
    ).toBeInTheDocument()
    expect(requested).toBe(1)
    expect(otpButton()).toBeDisabled()
  })

  it('danh sách rỗng thì mở nút xác nhận', async () => {
    server.use(
      http.get('*/merchants/m1/termination-obligations', () =>
        HttpResponse.json({ data: [], success: true })
      )
    )
    renderDialog()

    expect(
      await screen.findByText('Không còn nghĩa vụ tồn đọng.')
    ).toBeInTheDocument()
    await waitFor(() => expect(otpButton()).toBeEnabled())
  })

  it('lỗi kiểm tra số dư hiện detail của BE, giữ nút khóa và cho thử lại', async () => {
    let calls = 0
    server.use(
      http.get('*/merchants/m1/termination-obligations', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json(
              {
                success: false,
                status: '6012',
                message: 'MERCHANT_TERMINATE_BALANCE_UNVERIFIABLE',
                detail: 'Không xác minh được số dư Sub-merchant'
              },
              { status: 503 }
            )
          : HttpResponse.json({ data: [], success: true })
      })
    )
    const user = userEvent.setup()
    renderDialog()

    expect(
      await screen.findByText('Không xác minh được số dư Sub-merchant')
    ).toBeInTheDocument()
    expect(otpButton()).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    await waitFor(() => expect(otpButton()).toBeEnabled())
  })
})
