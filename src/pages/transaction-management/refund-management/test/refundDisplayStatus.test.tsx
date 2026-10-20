import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import { buildRefundParams, getDisplayStatus } from '../utils/refund.utils'
import {
  APPROVER,
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage
} from './refund.setup'

suppressAntPseudoElementWarning()

const FAILED = makeRefund({
  id: 'failed',
  refundCode: 'RF-FAILED',
  channel: 'TO_BANK',
  status: 'SUCCESS',
  displayStatus: 'FAILED_REFUND',
  refundType: 'WITHDRAW_BANK',
  originalType: 'CASH_IN',
  createdBy: 'admin.b'
})

describe('trạng thái hiển thị và loại hoàn', () => {
  it('cột Trạng thái theo displayStatus, kênh kèm loại hoàn', async () => {
    mockList(() => [FAILED])
    renderRefundPage(APPROVER)

    const row = (await screen.findByText('RF-FAILED')).closest('tr')
    if (!row) throw new Error('Không thấy dòng RF-FAILED')
    expect(within(row).getByText('Thất bại hoàn tiền')).toBeInTheDocument()
    expect(within(row).queryByText('Thành công')).not.toBeInTheDocument()
    expect(within(row).getByText('Hoàn nạp tiền')).toBeInTheDocument()
  })

  it('chip Thất bại hoàn tiền lọc theo displayStatus, bỏ status', async () => {
    const seen: URLSearchParams[] = []
    server.use(
      http.get('*/refunds', ({ request }) => {
        seen.push(new URL(request.url).searchParams)
        return HttpResponse.json({ data: { content: [], totalElements: 0 } })
      })
    )
    renderRefundPage(APPROVER)
    await userEvent.click(
      await screen.findByRole('button', { name: 'Thất bại hoàn tiền' })
    )

    await waitFor(() =>
      expect(
        seen.some((params) => params.get('displayStatus') === 'FAILED_REFUND')
      ).toBe(true)
    )
    expect(seen.every((params) => !params.has('status'))).toBe(true)
  })

  it('drawer: badge và ghi chú đối soát theo displayStatus', async () => {
    mockList(() => [FAILED])
    mockDetail(FAILED)
    renderRefundPage(APPROVER)

    await userEvent.click(
      await screen.findByRole('button', { name: /Xem chi tiết RF-FAILED/ })
    )
    const drawer = await screen.findByRole('dialog')
    expect(
      await within(drawer).findByText(/Bản ghi Thất bại hoàn tiền/)
    ).toBeInTheDocument()
    expect(within(drawer).getByText('Loại hoàn')).toBeInTheDocument()
  })
})

describe('getDisplayStatus', () => {
  it('ưu tiên displayStatus, BE chưa trả thì dùng status', () => {
    expect(getDisplayStatus(FAILED)).toBe('FAILED_REFUND')
    expect(
      getDisplayStatus({ status: 'PROCESSING', displayStatus: null })
    ).toBe('PROCESSING')
  })
})

describe('buildRefundParams với bộ lọc mới', () => {
  it('gửi displayStatus và refundType hợp lệ', () => {
    expect(
      buildRefundParams(
        { displayStatus: 'FAILED_REFUND', refundType: 'WITHDRAW_REVERSAL' },
        1,
        20
      )
    ).toMatchObject({
      displayStatus: 'FAILED_REFUND',
      refundType: 'WITHDRAW_REVERSAL'
    })
  })

  it('bỏ giá trị lạ thay vì gửi lên BE', () => {
    const params = buildRefundParams(
      { displayStatus: 'FOO', refundType: 'BAR' },
      1,
      20
    )
    expect(params.displayStatus).toBeUndefined()
    expect(params.refundType).toBeUndefined()
  })
})
