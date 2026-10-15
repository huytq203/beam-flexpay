import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { apiMerchant } from '@/app/services/apiService'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import { SettlementConfigForm } from '../components/SettlementConfigForm'
import { cfg, renderWithStore } from './settlement.setup'

const URL_CFG = '*/sub-merchants/sub-1/settlement-config'
const CAN_EDIT = [
  PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW,
  PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_UPDATE
]

const chooseMode = async (
  user: ReturnType<typeof userEvent.setup>,
  option: string
) => {
  await user.click(screen.getByLabelText('Chế độ quyết toán'))
  await user.click(await screen.findByTitle(option))
}

describe('SettlementConfigForm', { timeout: 20000 }, () => {
  it('PUT nới lỏng trả pendingChangeId thì báo chờ duyệt, không báo đã áp dụng', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    server.use(
      http.get(URL_CFG, () => HttpResponse.json({ data: cfg() })),
      http.put(URL_CFG, () =>
        HttpResponse.json({ data: cfg({ pendingChangeId: 'chg-1' }) })
      )
    )
    renderWithStore(<SettlementConfigForm subId='sub-1' />, CAN_EDIT)
    await user.type(
      await screen.findByLabelText('Lý do thay đổi'),
      'Merchant đủ điều kiện'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        expect.stringContaining('chờ phê duyệt')
      )
    )
    expect(success).not.toHaveBeenCalledWith(
      expect.stringContaining('Đã áp dụng')
    )
    success.mockRestore()
  })

  it('PUT áp ngay thì báo đã áp dụng', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    server.use(
      http.get(URL_CFG, () => HttpResponse.json({ data: cfg() })),
      http.put(URL_CFG, () => HttpResponse.json({ data: cfg() }))
    )
    renderWithStore(<SettlementConfigForm subId='sub-1' />, CAN_EDIT)
    await user.type(
      await screen.findByLabelText('Lý do thay đổi'),
      'Tăng số ngày chờ'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        expect.stringContaining('Đã áp dụng')
      )
    )
    success.mockRestore()
  })

  it('HOLD với lý do ngắn không gọi API', async () => {
    const user = userEvent.setup()
    let putCalled = false
    server.use(
      http.get(URL_CFG, () => HttpResponse.json({ data: cfg() })),
      http.put(URL_CFG, () => {
        putCalled = true
        return HttpResponse.json({ data: cfg() })
      })
    )
    renderWithStore(<SettlementConfigForm subId='sub-1' />, CAN_EDIT)
    await screen.findByLabelText('Lý do thay đổi')
    await chooseMode(user, 'Tạm dừng')
    await user.type(screen.getByLabelText('Lý do tạm dừng'), 'ngắn')
    await user.type(screen.getByLabelText('Lý do thay đổi'), 'Rủi ro cao')
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    expect(
      await screen.findByText(
        'Tạm dừng quyết toán phải nhập lý do tối thiểu 10 ký tự'
      )
    ).toBeInTheDocument()
    expect(putCalled).toBe(false)
  })

  it('lỗi 5707 hiện câu detail của BE', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const detail =
      'Điểm bán đã có một đề xuất nới lỏng cấu hình quyết toán đang chờ phê duyệt'
    server.use(
      http.get(URL_CFG, () => HttpResponse.json({ data: cfg() })),
      http.put(URL_CFG, () =>
        HttpResponse.json(
          {
            success: false,
            status: '5707',
            message: 'MERCHANT_SETTLEMENT_CHANGE_PENDING',
            detail
          },
          { status: 409 }
        )
      )
    )
    renderWithStore(<SettlementConfigForm subId='sub-1' />, CAN_EDIT)
    await user.type(
      await screen.findByLabelText('Lý do thay đổi'),
      'Merchant đủ điều kiện'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() => expect(error).toHaveBeenCalledWith(detail))
    error.mockRestore()
  })

  it('thiếu quyền UPDATE thì ẩn nút Lưu', async () => {
    server.use(http.get(URL_CFG, () => HttpResponse.json({ data: cfg() })))
    renderWithStore(<SettlementConfigForm subId='sub-1' />, [
      PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
    ])
    await screen.findByText('Cấu hình đang hiệu lực')
    expect(screen.queryByRole('button', { name: 'Lưu cấu hình' })).toBeNull()
  })

  it('hiện ba hạn mức rút ở chế độ chỉ đọc, không có ô nhập', async () => {
    server.use(
      http.get(URL_CFG, () =>
        HttpResponse.json({
          data: cfg({
            dailyWithdrawalLimit: { value: 50000000, source: 'SYSTEM' }
          })
        })
      )
    )
    renderWithStore(<SettlementConfigForm subId='sub-1' />, CAN_EDIT)
    expect(await screen.findByText('50.000.000')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hạn mức rút trong ngày')).toBeNull()
  })

  it('refetch (vd. sau khi duyệt đề xuất) không xóa nội dung đang nhập', async () => {
    const user = userEvent.setup()
    let pendingId: string | null = null
    server.use(
      http.get(URL_CFG, () =>
        HttpResponse.json({ data: cfg({ pendingChangeId: pendingId }) })
      )
    )
    const { store } = renderWithStore(
      <SettlementConfigForm subId='sub-1' />,
      CAN_EDIT
    )
    await user.type(
      await screen.findByLabelText('Lý do thay đổi'),
      'đang gõ dở'
    )
    pendingId = 'chg-9'
    store.dispatch(
      apiMerchant.util.invalidateTags([
        { type: 'merchant', id: 'settlement-sub-1' }
      ])
    )
    expect(
      await screen.findByText('Có đề xuất đang chờ duyệt')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Lý do thay đổi')).toHaveValue('đang gõ dở')
  })
})
