import { describe, expect, it } from 'vitest'
import {
  getReviewView,
  isMarker,
  isReviewCandidate
} from '../utils/transactionReview.utils'
import type { TransactionSnapshot } from '@/app/schemas/transaction-review.schema'

const action = (mode: string, requiredFields: string[] = []) => ({
  mode,
  status: null,
  requiredFields
})

const snapshot = (
  status: string,
  ...modes: ReturnType<typeof action>[]
): TransactionSnapshot => ({ status, allowedActions: modes })

const base = {
  canFull: true,
  canReview: true,
  username: 'nguoi.duyet',
  markedBy: undefined as string | undefined
}

describe('isReviewCandidate', () => {
  it.each([
    'PENDING',
    'AUTHORIZED',
    'POSTING',
    'CREDIT_PENDING',
    'CREDIT_FAILED',
    'RECONCILIATION_REQUIRED'
  ])('lệnh nạp ở %s là ứng viên', (status) =>
    expect(isReviewCandidate('CASH_IN', status)).toBe(true)
  )

  it.each([
    ['CASH_IN', 'PROCESSING'],
    ['CASH_IN', 'POSTED'],
    ['CASH_IN', 'FAILED'],
    ['CASH_OUT', 'PENDING'],
    ['P2P_TRANSFER', 'PENDING']
  ])('%s ở %s không phải ứng viên', (type, status) =>
    expect(isReviewCandidate(type, status)).toBe(false)
  )
})

describe('isMarker', () => {
  it('so khớp bỏ khoảng trắng, không phân biệt hoa thường', () => {
    expect(isMarker('Van.Hanh.A', ' van.hanh.a ')).toBe(true)
    expect(isMarker('van hanh', 'vanhanh')).toBe(true)
  })

  it('không biết người đánh dấu hoặc người đăng nhập thì không ẩn nút', () => {
    expect(isMarker(undefined, 'a')).toBe(false)
    expect(isMarker('a', '')).toBe(false)
  })
})

describe('getReviewView', () => {
  it('nút theo allowedActions; chưa có snapshot thì FULL chưa có nút nào', () => {
    expect(getReviewView({ ...base, snapshot: undefined })).toMatchObject({
      showMark: false,
      showApprove: false,
      showReject: false,
      isStatusUnreadable: false
    })
    expect(
      getReviewView({
        ...base,
        snapshot: snapshot('PENDING', action('MARK_REVIEW'))
      })
    ).toMatchObject({ showMark: true, showApprove: false })
  })

  it('bankConfirmation trong requiredFields quyết định có đòi bằng chứng', () => {
    const view = getReviewView({
      ...base,
      snapshot: snapshot(
        'REVIEW',
        action('REVIEW_APPROVE', ['authCode', 'bankConfirmation']),
        action('REVIEW_REJECT', ['option', 'reason'])
      )
    })
    expect(view).toMatchObject({
      isUnderReview: true,
      approveNeedsBank: true,
      rejectNeedsBank: false
    })
  })

  it('người đánh dấu bị ẩn Duyệt/Từ chối', () => {
    const view = getReviewView({
      ...base,
      markedBy: 'NGUOI.DUYET',
      snapshot: snapshot(
        'REVIEW',
        action('REVIEW_APPROVE'),
        action('REVIEW_REJECT')
      )
    })
    expect(view).toMatchObject({
      isMarker: true,
      showApprove: false,
      showReject: false
    })
  })

  it('người chỉ có TRANSACTION:REVIEW: không đọc được trạng thái, chỉ Đánh dấu cho tới khi đã đánh dấu', () => {
    const reviewOnly = { ...base, canFull: false, snapshot: undefined }
    expect(getReviewView(reviewOnly)).toMatchObject({
      isStatusUnreadable: true,
      showMark: true
    })
    expect(
      getReviewView({ ...reviewOnly, markedBy: 'nguoi.duyet' }).showMark
    ).toBe(false)
  })

  it('không có quyền review thì không có nút nào', () => {
    const view = getReviewView({
      ...base,
      canReview: false,
      snapshot: snapshot(
        'REVIEW',
        action('REVIEW_APPROVE'),
        action('MARK_REVIEW')
      )
    })
    expect(view).toMatchObject({
      showMark: false,
      showApprove: false,
      showReject: false
    })
  })
})
