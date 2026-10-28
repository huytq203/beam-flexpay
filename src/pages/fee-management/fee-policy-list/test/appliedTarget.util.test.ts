import type { AppliedSubject, AppliedTarget } from '@type/fee.type'
import { describe, expect, it } from 'vitest'
import {
  getAppliedSubjectLines,
  getAppliedSubjectName,
  getAppliedTargetLabel
} from '../utils/appliedTarget'

const customerSegmentNames = { VIP: 'Khách hàng VIP' }

describe('helper đối tượng áp dụng', () => {
  it.each([
    [
      { fullName: 'Nguyễn Văn A', displayName: '0912345678' },
      'Nguyễn Văn A · 0912345678'
    ],
    [{ fullName: 'Nguyễn Văn A', displayName: null }, 'Nguyễn Văn A'],
    [{ fullName: null, displayName: '0912345678' }, '0912345678'],
    [{ fullName: null, displayName: null }, 'u-1']
  ])('dựng nhãn chủ thể từ họ tên và tên hiển thị', (names, expected) => {
    const subject: AppliedSubject = {
      subjectType: 'USER',
      subjectId: 'u-1',
      ...names
    }

    expect(getAppliedSubjectName(subject)).toBe(expected)
  })

  it('thêm tiền tố cho chủ thể merchant', () => {
    const subject: AppliedSubject = {
      subjectType: 'MERCHANT',
      subjectId: 'm-1',
      fullName: 'Cửa hàng A',
      displayName: 'merchant-a'
    }

    expect(getAppliedSubjectName(subject)).toBe(
      'Merchant · Cửa hàng A · merchant-a'
    )
  })

  it('hiện tên chủ thể cho đúng một ví riêng có displayName', () => {
    const target: AppliedTarget = {
      type: 'ACCOUNT',
      code: null,
      count: 1,
      subjectCount: 1,
      subjects: [
        {
          subjectType: 'USER',
          subjectId: 'u-1',
          fullName: 'Nguyễn Văn A',
          displayName: '0912345678'
        }
      ]
    }

    expect(getAppliedTargetLabel(target, customerSegmentNames)).toBe(
      'Ví riêng · Nguyễn Văn A · 0912345678'
    )
  })

  it('giữ nhãn theo số ví khi một chủ thể không có displayName', () => {
    const target: AppliedTarget = {
      type: 'ACCOUNT',
      code: null,
      count: 1,
      subjects: [
        {
          subjectType: 'USER',
          subjectId: 'u-1',
          fullName: null,
          displayName: null
        }
      ]
    }

    expect(getAppliedTargetLabel(target, customerSegmentNames)).toBe(
      '1 ví riêng'
    )
  })

  it('giữ nhãn theo số ví khi có nhiều chủ thể', () => {
    const target: AppliedTarget = {
      type: 'ACCOUNT',
      code: null,
      count: 2,
      subjects: [
        {
          subjectType: 'USER',
          subjectId: 'u-1',
          fullName: null,
          displayName: '0912345678'
        },
        {
          subjectType: 'USER',
          subjectId: 'u-2',
          fullName: null,
          displayName: '0987654321'
        }
      ]
    }

    expect(getAppliedTargetLabel(target, customerSegmentNames)).toBe(
      '2 ví riêng'
    )
  })

  it('dựng các dòng USER, fallback subjectId, MERCHANT và phần còn lại', () => {
    const target: AppliedTarget = {
      type: 'CUSTOMER_GROUP',
      code: 'VIP',
      count: 3,
      subjectCount: 6,
      subjects: [
        {
          subjectType: 'USER',
          subjectId: 'u-1',
          fullName: 'Nguyễn Văn A',
          displayName: '0912345678'
        },
        {
          subjectType: 'USER',
          subjectId: 'u-2',
          fullName: null,
          displayName: null
        },
        {
          subjectType: 'MERCHANT',
          subjectId: 'm-1',
          fullName: null,
          displayName: null
        }
      ]
    }

    expect(getAppliedSubjectLines(target)).toEqual([
      'Nguyễn Văn A · 0912345678',
      'u-2',
      'Merchant · m-1',
      '… và 3 chủ thể khác'
    ])
  })

  it('không dựng tooltip cho ALL', () => {
    const target: AppliedTarget = {
      type: 'ALL',
      code: null,
      count: 1,
      subjectCount: 1,
      subjects: [
        {
          subjectType: 'USER',
          subjectId: 'u-1',
          fullName: null,
          displayName: '0912345678'
        }
      ]
    }

    expect(getAppliedSubjectLines(target)).toEqual([])
  })

  it('không dựng tooltip khi BE cũ chưa trả subjects', () => {
    const target: AppliedTarget = {
      type: 'CUSTOMER_GROUP',
      code: 'VIP',
      count: 1
    }

    expect(getAppliedSubjectLines(target)).toEqual([])
  })

  describe('chính sách thu hộ / chi hộ gọi đối tượng riêng là merchant', () => {
    const merchantSubject: AppliedSubject = {
      subjectType: 'MERCHANT',
      subjectId: 'm-1',
      fullName: 'Cửa hàng A',
      displayName: 'merchant-a'
    }

    it('một merchant: "Merchant cụ thể" kèm tên, không lặp tiền tố Merchant', () => {
      const target: AppliedTarget = {
        type: 'ACCOUNT',
        code: null,
        count: 1,
        subjectCount: 1,
        subjects: [merchantSubject]
      }

      expect(
        getAppliedTargetLabel(
          target,
          customerSegmentNames,
          'MERCHANT_VA_BILL_COLLECTION'
        )
      ).toBe('Merchant cụ thể · Cửa hàng A · merchant-a')
    })

    it('nhiều merchant: "N merchant cụ thể"; loại ví vẫn "N ví riêng"', () => {
      const target: AppliedTarget = { type: 'ACCOUNT', code: null, count: 3 }

      expect(
        getAppliedTargetLabel(
          target,
          customerSegmentNames,
          'PAYOUT_BANK_TRANSFER'
        )
      ).toBe('3 merchant cụ thể')
      expect(
        getAppliedTargetLabel(target, customerSegmentNames, 'EWALLET_DEPOSIT')
      ).toBe('3 ví riêng')
    })
  })
})
