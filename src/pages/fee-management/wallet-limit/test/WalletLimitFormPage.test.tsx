import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { walletLimitPaths } from '../utils/walletLimit.paths'
import {
  basePolicy,
  mockScopes,
  ok,
  pickWallet,
  renderForm,
  typeInto
} from './WalletLimitFormTestHelpers'

describe('WalletLimitFormPage - Thêm mới', () => {
  it('gửi đúng body tạo mới (không có trường cũ) rồi về trang chi tiết', async () => {
    const user = userEvent.setup()
    mockScopes()
    let body: unknown
    server.use(
      http.post('*/wallet-limit-policies', async ({ request }) => {
        body = await request.json()
        return ok({ ...basePolicy, id: 'new-1' })
      })
    )
    renderForm(walletLimitPaths.create)

    await pickWallet(user)
    expect(
      screen.getByPlaceholderText('Chọn ví theo số điện thoại')
    ).toHaveValue('0912345678')
    await typeInto(user, /^Số tiền tối thiểu mỗi giao dịch/, '10000')
    await typeInto(user, /^Số tiền tối đa mỗi giao dịch/, '5000000')
    await user.click(screen.getByRole('button', { name: 'Lưu hạn mức' }))

    expect(await screen.findByText('Trang chi tiết')).toBeInTheDocument()
    expect(body).toEqual({
      scopeType: 'WALLET',
      targetId: 'w-1',
      walletType: 'ALL',
      transactionType: 'WITHDRAWAL',
      minPerTransaction: 10000,
      maxPerTransaction: 5000000,
      dailyMaximum: null,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null,
      walletBalanceMaximum: null,
      outflowDailyMaximum: null,
      outflowMonthlyMaximum: null,
      outboundMaxTimesPerDay: null,
      approvalThreshold: null,
      bankOverrides: []
    })
  })

  it('không gọi API khi thiếu mã định danh và hiện lỗi cạnh ô', async () => {
    const user = userEvent.setup()
    renderForm(walletLimitPaths.create)

    await user.click(screen.getByRole('button', { name: 'Lưu hạn mức' }))

    expect(
      await screen.findByText('Vui lòng chọn mã định danh.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Số tiền tối thiểu mỗi giao dịch phải lớn hơn 0.')
    ).toBeInTheDocument()
  })

  it('hiện lỗi từng ô khi BE trả 400 "Validation failed"', async () => {
    const user = userEvent.setup()
    mockScopes()
    server.use(
      http.post('*/wallet-limit-policies', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'VALIDATION_ERROR',
            detail: 'Validation failed',
            status: '3001',
            data: {
              outflowDailyMaximum: 'Tổng chi trong ngày phải lớn hơn 0.',
              'bankOverrides[0].dailyMaximum':
                'Hạn mức ngày của ngân hàng phải lớn hơn 0.'
            }
          },
          { status: 400 }
        )
      )
    )
    renderForm(walletLimitPaths.create)

    await pickWallet(user)
    await typeInto(user, /^Số tiền tối thiểu mỗi giao dịch/, '10000')
    await typeInto(user, /^Số tiền tối đa mỗi giao dịch/, '5000000')
    await user.click(
      screen.getByRole('button', { name: 'Thêm dòng ngân hàng / phương thức' })
    )
    await user.click(screen.getByLabelText('Ngân hàng'))
    await user.click(await screen.findByTitle('VCB'))
    await typeInto(user, /^Số tiền tối thiểu mỗi giao dịch/, '10000', 1)
    await typeInto(user, /^Số tiền tối đa mỗi giao dịch/, '5000000', 1)
    await typeInto(user, /^Hạn mức trong ngày/, '5000000', 1)
    await user.click(screen.getByRole('button', { name: 'Lưu hạn mức' }))

    expect(
      await screen.findByText('Tổng chi trong ngày phải lớn hơn 0.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Hạn mức ngày của ngân hàng phải lớn hơn 0.')
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Vui lòng kiểm tra lại các ô được đánh dấu.')
    ).toBeInTheDocument()
  })

  it('toast câu lỗi BE khi trùng cấu hình (3006)', async () => {
    const user = userEvent.setup()
    mockScopes()
    server.use(
      http.post('*/wallet-limit-policies', () =>
        HttpResponse.json(
          {
            success: false,
            detail:
              'Cấu hình hạn mức cho đối tượng và loại giao dịch này đã tồn tại.',
            status: '3006'
          },
          { status: 400 }
        )
      )
    )
    renderForm(walletLimitPaths.create)

    await pickWallet(user)
    await typeInto(user, /^Số tiền tối thiểu mỗi giao dịch/, '10000')
    await typeInto(user, /^Số tiền tối đa mỗi giao dịch/, '5000000')
    await user.click(screen.getByRole('button', { name: 'Lưu hạn mức' }))

    expect(
      await screen.findByText(
        'Cấu hình hạn mức cho đối tượng và loại giao dịch này đã tồn tại.'
      )
    ).toBeInTheDocument()
  })
})
