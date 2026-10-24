import { describe, expect, it } from 'vitest'
import {
  EMPTY_DRAFT,
  buildConfig,
  buildProposalBody,
  toActiveFromInstant,
  toDraft,
  validateActiveFrom,
  validateDraft,
  validateReason,
  type HoldRuleDraft
} from '../utils/holdRuleDraft.utils'
import { getHoldRuleErrorMessage } from '../utils/holdRuleError.utils'
import { visibleKeys } from '../utils/holdRuleFields.utils'
import {
  deriveDisplayStatus,
  formatHoldRuleValue
} from '../utils/holdRuleFormat.utils'
import { policy } from './holdRule.setup'

const draft = (
  own: HoldRuleDraft['own'],
  values: HoldRuleDraft['values']
): HoldRuleDraft => ({ own, values })

describe('validateDraft', () => {
  it('chặn sai kiểu và sai khoảng trước khi gửi', () => {
    const errors = validateDraft(
      draft(['ratePercent', 'holdDays', 'fixedAmount', 'capPercent'], {
        ratePercent: 5.123,
        holdDays: 366,
        fixedAmount: 0,
        capPercent: 0.5
      }),
      'SUB'
    )
    expect(Object.keys(errors).sort()).toEqual([
      'capPercent',
      'fixedAmount',
      'holdDays',
      'ratePercent'
    ])
  })

  it('SYSTEM đang bật phải đủ tham số vì không có cấp trên để kế thừa', () => {
    const errors = validateDraft(
      draft(['enabled', 'calculationMode'], {
        enabled: true,
        calculationMode: 'FIXED_PER_TRANSACTION'
      }),
      'SYSTEM'
    )
    expect(errors.config).toContain('Số tiền giữ cố định')
    expect(errors.config).toContain('Số ngày giữ')
  })

  it('Master/Sub để BE kiểm tra kế thừa nên chỉ cần có ít nhất một tham số', () => {
    expect(
      validateDraft(draft(['enabled'], { enabled: true }), 'MASTER')
    ).toEqual({})
    expect(validateDraft(EMPTY_DRAFT, 'SUB').config).toBeDefined()
    expect(validateDraft(EMPTY_DRAFT, 'SYSTEM').config).toBeDefined()
  })

  it('tắt quy tắc không cần tham số khác', () => {
    expect(
      validateDraft(draft(['enabled'], { enabled: false }), 'SYSTEM')
    ).toEqual({})
  })
})

describe('buildConfig / buildProposalBody', () => {
  it('chỉ gửi khóa tự đặt và không bao giờ gửi null', () => {
    const config = buildConfig(
      draft(['holdDays', 'paymentMethods', 'capAmount'], {
        holdDays: 7,
        paymentMethods: null,
        capAmount: null,
        ratePercent: 9
      })
    )
    expect(config).toEqual({ holdDays: 7, paymentMethods: [] })
  })

  it('SYSTEM không gửi targetId, activeFrom bỏ trống thì không gửi', () => {
    expect(
      buildProposalBody(
        { level: 'SYSTEM' },
        { enabled: false },
        ' lý do dài đủ '
      )
    ).toEqual({
      targetLevel: 'SYSTEM',
      config: { enabled: false },
      reason: 'lý do dài đủ'
    })
  })

  it('00:00 giờ Việt Nam đổi sang 17:00Z hôm trước', () => {
    expect(toActiveFromInstant('2026-10-25')).toBe('2026-10-24T17:00:00.000Z')
    const body = buildProposalBody(
      { level: 'SUB', targetId: 's-1' },
      {},
      'gỡ quy tắc riêng',
      '2026-10-25'
    )
    expect(body).toMatchObject({ targetId: 's-1', config: {} })
    expect(body.activeFrom).toBe('2026-10-24T17:00:00.000Z')
  })
})

describe('validate lý do và ngày hiệu lực', () => {
  it('lý do cắt khoảng trắng phải từ 10 đến 500 ký tự', () => {
    expect(validateReason('   ngắn   ')).toBeDefined()
    expect(validateReason('đủ mười ký tự')).toBeUndefined()
    expect(validateReason('a'.repeat(501))).toBeDefined()
  })

  it('ngày quá khứ bị chặn, dung sai 5 phút, bỏ trống thì hợp lệ', () => {
    const now = Date.parse('2026-10-25T00:03:00+07:00')
    expect(validateActiveFrom(undefined, now)).toBeUndefined()
    expect(validateActiveFrom('2026-10-25', now)).toBeUndefined()
    expect(validateActiveFrom('2026-10-24', now)).toBeDefined()
  })
})

describe('toDraft / visibleKeys', () => {
  it('chỉ khóa do chính cấp này đặt là tự đặt', () => {
    const result = toDraft(
      policy({ sources: { enabled: 'SYSTEM', holdDays: 'SUB' } }),
      'SUB'
    )
    expect(result.own).toEqual(['holdDays'])
    expect(result.values.holdDays).toBe(7)
  })

  it('ẩn tham số không liên quan tới chế độ tính và trần', () => {
    const keys = visibleKeys(EMPTY_DRAFT, policy())
    expect(keys).toContain('ratePercent')
    expect(keys).not.toContain('fixedAmount')
    expect(keys).not.toContain('capMode')
    const capOn = visibleKeys(
      EMPTY_DRAFT,
      policy({ capEnabled: true, capMode: 'FIXED_AMOUNT' })
    )
    expect(capOn).toContain('capAmount')
    expect(capOn).not.toContain('capPercent')
  })
})

describe('hiển thị và trạng thái', () => {
  it('suy ra trạng thái hiệu lực của phiên bản đã duyệt', () => {
    const now = Date.parse('2026-10-22T00:00:00Z')
    const approved = { approvalStatus: 'APPROVED' as const, activeUntil: null }
    expect(
      deriveDisplayStatus(
        { ...approved, activeFrom: '2026-10-25T00:00:00Z' },
        now
      )
    ).toBe('SCHEDULED')
    expect(
      deriveDisplayStatus(
        { ...approved, activeFrom: '2026-10-20T00:00:00Z' },
        now
      )
    ).toBe('ACTIVE')
    expect(
      deriveDisplayStatus(
        {
          approvalStatus: 'APPROVED',
          activeFrom: '2026-10-01T00:00:00Z',
          activeUntil: '2026-10-20T00:00:00Z'
        },
        now
      )
    ).toBe('REPLACED')
    expect(
      deriveDisplayStatus(
        {
          approvalStatus: 'PENDING_APPROVAL',
          activeFrom: null,
          activeUntil: null
        },
        now
      )
    ).toBe('PENDING')
  })

  it('định dạng giá trị, capBehaviour giữ nguyên giá trị gốc', () => {
    expect(formatHoldRuleValue('minimumGrossAmount', 100000)).toBe(
      '100.000 đồng'
    )
    expect(formatHoldRuleValue('paymentMethods', [])).toBe('Tất cả hình thức')
    expect(formatHoldRuleValue('capBehaviour', 'FILL_TO_CAP')).toBe(
      'FILL_TO_CAP'
    )
  })

  it('lỗi 5705 hiển thị nguyên detail, VALIDATION_ERROR lấy thông báo đầu tiên', () => {
    expect(
      getHoldRuleErrorMessage(
        {
          data: {
            message: 'MERCHANT_HOLD_RULE_INVALID',
            detail: 'Chi tiết 5705'
          }
        },
        'fallback'
      )
    ).toBe('Chi tiết 5705')
    expect(
      getHoldRuleErrorMessage(
        {
          data: {
            message: 'VALIDATION_ERROR',
            detail: 'Dữ liệu yêu cầu không hợp lệ',
            data: { reason: 'Lý do không được để trống' }
          }
        },
        'fallback'
      )
    ).toBe('Lý do không được để trống')
  })
})
