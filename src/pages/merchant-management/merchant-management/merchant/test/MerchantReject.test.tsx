import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'

import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import {
  detailMerchant,
  mockMerchantDetail,
  renderMerchantDetail
} from './merchantDetail.setup'

const reasons = [
  {
    code: 'BLURRED_IMAGE',
    label: 'Ảnh mờ',
    defaultNote: 'Ảnh giấy tờ bị mờ, vui lòng tải lại'
  },
  { code: 'OTHER', label: 'Lý do khác', defaultNote: '' }
]

const openRejectDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Từ chối' }))
  return screen.findByRole('dialog')
}

describe('Từ chối hồ sơ merchant', { timeout: 20000 }, () => {
  it('chọn lý do mẫu điền sẵn ghi chú và gửi đúng reasonCode + detail', async () => {
    let rejectBody: unknown
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/rejection-reasons', () =>
        HttpResponse.json({ data: reasons, success: true })
      ),
      http.post('*/merchants/m1/reject', async ({ request }) => {
        rejectBody = await request.json()
        return HttpResponse.json({
          data: { ...detailMerchant, status: 'REJECTED' },
          success: true
        })
      })
    )
    const user = userEvent.setup()
    renderMerchantDetail([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_APPROVE
    ])

    const dialog = await openRejectDialog(user)
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Lý do mẫu' })
    )
    await user.click(await screen.findByTitle('Ảnh mờ'))
    const note = within(dialog).getByLabelText('Ghi chú chi tiết')
    expect(note).toHaveValue('Ảnh giấy tờ bị mờ, vui lòng tải lại')

    await user.type(note, ' mặt sau')
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() =>
      expect(rejectBody).toEqual({
        reasonCode: 'BLURRED_IMAGE',
        detail: 'Ảnh giấy tờ bị mờ, vui lòng tải lại mặt sau'
      })
    )
  })

  it('không chọn lý do mẫu thì chỉ gửi detail; lỗi BE hiện detail', async () => {
    let rejectBody: unknown
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/rejection-reasons', () =>
        HttpResponse.json({ data: reasons, success: true })
      ),
      http.post('*/merchants/m1/reject', async ({ request }) => {
        rejectBody = await request.json()
        return HttpResponse.json(
          {
            success: false,
            status: '4305',
            message: 'MERCHANT_INVALID_STATUS_TRANSITION',
            detail: 'Merchant không ở trạng thái chờ duyệt'
          },
          { status: 409 }
        )
      })
    )
    const user = userEvent.setup()
    renderMerchantDetail([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_APPROVE
    ])

    const dialog = await openRejectDialog(user)
    await user.type(
      within(dialog).getByLabelText('Ghi chú chi tiết'),
      'Thiếu hợp đồng'
    )
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() =>
      expect(rejectBody).toEqual({ detail: 'Thiếu hợp đồng' })
    )
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Merchant không ở trạng thái chờ duyệt'
      )
    )
    error.mockRestore()
  })
})
