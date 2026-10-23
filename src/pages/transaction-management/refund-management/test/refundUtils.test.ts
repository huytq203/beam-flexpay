import { describe, expect, it } from 'vitest'
import { getRefundRowNumber } from '../columns/refund.columns'
import {
  rejectRefundSchema,
  settleRefundSchema
} from '../schemas/refundForm.schema'
import {
  buildRefundParams,
  getRefundActions,
  getRefundErrorText,
  getSettleLabel
} from '../utils/refund.utils'
import { describeApproveOutcome } from '../utils/refundOutcome'
import { makeRefund, toListItem } from './refund.setup'

const ctx = {
  username: 'me',
  canApprove: true,
  canSettle: false,
  canPayoutRefresh: false,
  canPayoutApprove: false
}

describe('getRefundErrorText', () => {
  it('lấy detail tiếng Việt nguyên văn', () => {
    expect(
      getRefundErrorText({
        status: 400,
        data: {
          message: 'BUSINESS_ERROR',
          detail: 'GD đang bị đóng băng toàn bộ'
        }
      })
    ).toBe('GD đang bị đóng băng toàn bộ')
  })

  it('lỗi VALIDATION_ERROR đọc map data thay cho detail tiếng Anh', () => {
    expect(
      getRefundErrorText({
        status: 400,
        data: {
          message: 'VALIDATION_ERROR',
          detail: 'Validation failed',
          data: { reason: 'Vui lòng nhập lý do' }
        }
      })
    ).toBe('Vui lòng nhập lý do')
  })

  it('không trả tên enum thô khi thiếu detail', () => {
    expect(
      getRefundErrorText({ status: 400, data: { message: 'BUSINESS_ERROR' } })
    ).toBe('Có lỗi xảy ra, vui lòng thử lại.')
  })

  it('lỗi mạng và lỗi không rõ có câu mặc định', () => {
    expect(getRefundErrorText({ status: 'FETCH_ERROR', error: 'x' })).toContain(
      'Không kết nối'
    )
    expect(getRefundErrorText(new Error('boom'))).toContain('Có lỗi xảy ra')
  })
})

describe('getRefundActions', () => {
  it('chỉ cho duyệt khi chờ duyệt, có quyền và không phải người tạo', () => {
    const base = makeRefund({ createdBy: 'other' })
    expect(getRefundActions(base, ctx).decide).toBe(true)
    expect(getRefundActions({ ...base, createdBy: 'me' }, ctx).decide).toBe(
      false
    )
    expect(getRefundActions(base, { ...ctx, canApprove: false }).decide).toBe(
      false
    )
    expect(getRefundActions({ ...base, status: 'SUCCESS' }, ctx).decide).toBe(
      false
    )
    expect(
      getRefundActions({ ...base, createdBy: undefined }, ctx).decide
    ).toBe(false)
  })

  it('so sánh maker/checker bỏ khoảng trắng và không phân biệt hoa thường', () => {
    const own = getRefundActions(makeRefund({ createdBy: ' Me ' }), ctx)
    expect(own.isOwnRequest).toBe(true)
    expect(own.decide).toBe(false)
  })

  it('dòng danh sách (không có createdBy) không có Duyệt/Từ chối', () => {
    const item = toListItem(makeRefund())
    expect(getRefundActions(item, ctx).decide).toBe(false)
  })

  it('quyết toán cho TO_WALLET, làm mới lệnh chi cho TO_BANK', () => {
    const full = { ...ctx, canSettle: true, canPayoutRefresh: true }
    const wallet = makeRefund({ status: 'PROCESSING' })
    const bank = makeRefund({ status: 'WAITING_FUNDS', channel: 'TO_BANK' })
    expect(getRefundActions(wallet, full)).toMatchObject({
      settle: true,
      payoutRefresh: false
    })
    expect(getRefundActions(bank, full)).toMatchObject({
      settle: false,
      payoutRefresh: true
    })
    expect(
      getRefundActions(makeRefund({ status: 'PENDING_APPROVAL' }), full)
    ).toMatchObject({ settle: false, payoutRefresh: false })
  })

  it('duyệt chi chỉ khi Chờ duyệt chi và có quyền, không chặn người tạo', () => {
    const accountant = { ...ctx, canApprove: false, canPayoutApprove: true }
    const waiting = makeRefund({
      status: 'PENDING_PAYOUT_APPROVAL',
      channel: 'TO_BANK',
      createdBy: 'me'
    })
    expect(getRefundActions(waiting, accountant)).toMatchObject({
      payoutDecide: true,
      decide: false
    })
    expect(getRefundActions(waiting, ctx).payoutDecide).toBe(false)
    expect(
      getRefundActions(makeRefund({ status: 'PROCESSING' }), accountant)
        .payoutDecide
    ).toBe(false)
  })

  it('đổi nhãn Quyết toán lại khi đang PROCESSING kèm lỗi', () => {
    expect(getSettleLabel({ status: 'PROCESSING', failureReason: 'x' })).toBe(
      'Quyết toán lại'
    )
    expect(
      getSettleLabel({ status: 'WAITING_FUNDS', failureReason: 'x' })
    ).toBe('Quyết toán')
  })
})

describe('phân trang và tham số', () => {
  it('số thứ tự tính theo trang và kích thước trang', () => {
    expect(getRefundRowNumber(1, 20, 0)).toBe(1)
    expect(getRefundRowNumber(3, 20, 4)).toBe(45)
  })

  it('đổi trang sang chỉ số 0 và dựng khoảng ngày', () => {
    expect(
      buildRefundParams(
        {
          status: 'SUCCESS',
          createdFrom: '2026-10-01',
          createdTo: '2026-10-09',
          channel: 'bad'
        },
        2,
        20
      )
    ).toMatchObject({
      page: 1,
      size: 20,
      status: 'SUCCESS',
      channel: undefined,
      createdFrom: '2026-10-01T00:00:00',
      createdTo: '2026-10-09T23:59:59'
    })
  })
})

describe('schema form', () => {
  it('từ chối: lý do 5-500', () => {
    expect(rejectRefundSchema.safeParse({ reason: '   ' }).success).toBe(false)
    expect(rejectRefundSchema.safeParse({ reason: 'abcd' }).success).toBe(false)
    expect(rejectRefundSchema.safeParse({ reason: 'abcde' }).success).toBe(true)
    expect(
      rejectRefundSchema.safeParse({ reason: 'a'.repeat(501) }).success
    ).toBe(false)
  })

  it('quyết toán thất bại cần lý do, thành công thì không', () => {
    expect(
      settleRefundSchema.safeParse({ result: 'SUCCESS', failureReason: '' })
        .success
    ).toBe(true)
    expect(
      settleRefundSchema.safeParse({ result: 'FAILED', failureReason: '' })
        .success
    ).toBe(false)
    expect(
      settleRefundSchema.safeParse({
        result: 'FAILED',
        failureReason: 'lỗi ví lõi'
      }).success
    ).toBe(true)
  })
})

describe('describeApproveOutcome', () => {
  it('đọc data.status sau duyệt', () => {
    expect(describeApproveOutcome(makeRefund({ status: 'SUCCESS' })).kind).toBe(
      'success'
    )
    expect(
      describeApproveOutcome(
        makeRefund({ status: 'PROCESSING', payoutCode: 'RF-P1' })
      ).text
    ).toContain('RF-P1')
    expect(
      describeApproveOutcome(
        makeRefund({
          status: 'PROCESSING',
          failureReason:
            'Đã duyệt nhưng chưa chuyển được tiền, cần quyết toán lại: quá hạn'
        })
      ).kind
    ).toBe('warning')
    expect(
      describeApproveOutcome(
        makeRefund({
          status: 'WAITING_FUNDS',
          failureReason: 'Đang chờ đủ số dư: còn thiếu 10'
        })
      ).text
    ).toContain('còn thiếu 10')
    expect(
      describeApproveOutcome(
        makeRefund({
          status: 'PENDING_APPROVAL',
          failureReason: 'Thao tác trên ví thất bại'
        })
      ).kind
    ).toBe('warning')
  })
})
