import { describe, expect, it } from 'vitest'
import {
  createWalletLimitFormSchema,
  INCOMPLETE_OVERRIDE_MESSAGE,
  MISMATCHED_METHOD_MESSAGE,
  MISSING_BANK_OR_METHOD_MESSAGE,
  MISSING_TARGET_MESSAGE,
  walletLimitFormSchema,
  type WalletLimitFormValues
} from '../schemas/walletLimitForm.schema'
import {
  buildEmptyFormValues,
  buildEmptyOverride
} from '../utils/walletLimit.formMapper'

const valid = (
  patch: Partial<WalletLimitFormValues> = {}
): WalletLimitFormValues => ({
  ...buildEmptyFormValues(),
  scopeType: 'SYSTEM',
  transactionType: 'ALL',
  minPerTransaction: 10000,
  maxPerTransaction: 50000,
  dailyMaximum: 100000,
  normalMonthlyMaximum: 500000,
  specialMonthlyMaximum: 800000,
  ...patch
})

const errorsOf = (
  values: WalletLimitFormValues,
  schema = walletLimitFormSchema
): Record<string, string> => {
  const result = schema.safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
  )
}

describe('walletLimitFormSchema', () => {
  it('chấp nhận cấu hình hợp lệ', () => {
    expect(errorsOf(valid())).toEqual({})
  })

  it('min và max bắt buộc và phải lớn hơn 0', () => {
    const errors = errorsOf(
      valid({ minPerTransaction: null, maxPerTransaction: 0 })
    )
    expect(errors.minPerTransaction).toBe(
      'Số tiền tối thiểu/GD phải lớn hơn 0.'
    )
    expect(errors.maxPerTransaction).toBe('Số tiền tối đa/GD phải lớn hơn 0.')
  })

  it('kiểm thứ tự max >= min, ngày >= max, tháng >= ngày', () => {
    const errors = errorsOf(
      valid({
        minPerTransaction: 60000,
        maxPerTransaction: 50000,
        dailyMaximum: 40000,
        normalMonthlyMaximum: 30000,
        specialMonthlyMaximum: 10000
      })
    )
    expect(errors.maxPerTransaction).toBe(
      'Tối đa/GD phải lớn hơn hoặc bằng tối thiểu/GD.'
    )
    expect(errors.dailyMaximum).toBe(
      'Hạn mức ngày phải lớn hơn hoặc bằng hạn mức tối đa/GD.'
    )
    expect(errors.normalMonthlyMaximum).toBe(
      'Hạn mức tháng (thường) phải lớn hơn hoặc bằng hạn mức ngày.'
    )
    expect(errors.specialMonthlyMaximum).toContain('Hạn mức tháng (đặc biệt)')
  })

  it('khi ngày trống thì hai trần tháng so với max', () => {
    const errors = errorsOf(
      valid({ dailyMaximum: null, normalMonthlyMaximum: 40000 })
    )
    expect(errors.normalMonthlyMaximum).toBe(
      'Hạn mức tháng (thường) phải lớn hơn hoặc bằng hạn mức tối đa/GD.'
    )
    expect(errors.dailyMaximum).toBeUndefined()
  })

  it('hai trần tháng không bị ràng buộc với nhau', () => {
    expect(
      errorsOf(
        valid({ normalMonthlyMaximum: 900000, specialMonthlyMaximum: 200000 })
      )
    ).toEqual({})
  })

  it('đối tượng Ví/Nhóm bắt buộc chọn mã định danh theo đúng phạm vi', () => {
    expect(errorsOf(valid({ scopeType: 'WALLET' })).targetId).toBe(
      MISSING_TARGET_MESSAGE
    )
    const stale = valid({
      scopeType: 'GROUP',
      targetScope: 'WALLET',
      targetId: 'w-1'
    })
    expect(errorsOf(stale).targetId).toBe(MISSING_TARGET_MESSAGE)
    const picked = valid({
      scopeType: 'GROUP',
      targetScope: 'GROUP',
      targetId: 'g-1'
    })
    expect(errorsOf(picked)).toEqual({})
  })

  describe('dòng override', () => {
    it('bắt buộc đủ min/max/ngày', () => {
      const row = { ...buildEmptyOverride('WITHDRAWAL'), bankCode: 'VCB' }
      const errors = errorsOf(
        valid({ bankOverrides: [{ ...row, minPerTransaction: 1000 }] })
      )
      expect(errors['bankOverrides.0.minPerTransaction']).toBe(
        INCOMPLETE_OVERRIDE_MESSAGE
      )
    })

    it('phải chọn ngân hàng hoặc phương thức', () => {
      const row = {
        ...buildEmptyOverride('WITHDRAWAL'),
        minPerTransaction: 1,
        maxPerTransaction: 2,
        dailyMaximum: 3
      }
      expect(errorsOf(valid({ bankOverrides: [row] }))).toEqual({
        'bankOverrides.0.bankCode': MISSING_BANK_OR_METHOD_MESSAGE
      })
      const transfer = { ...row, transactionType: 'TRANSFER' as const }
      expect(errorsOf(valid({ bankOverrides: [transfer] }))).toEqual({
        'bankOverrides.0.paymentMethod': MISSING_BANK_OR_METHOD_MESSAGE
      })
    })

    it('chuyển tiền không được chọn ngân hàng hay LINKED_ACCOUNT', () => {
      const base = {
        ...buildEmptyOverride('TRANSFER'),
        minPerTransaction: 1,
        maxPerTransaction: 2,
        dailyMaximum: 3
      }
      expect(
        errorsOf(valid({ bankOverrides: [{ ...base, bankCode: 'VCB' }] }))
      ).toEqual({ 'bankOverrides.0.bankCode': MISMATCHED_METHOD_MESSAGE })
      expect(
        errorsOf(
          valid({
            bankOverrides: [{ ...base, paymentMethod: 'LINKED_ACCOUNT' }]
          })
        )
      ).toEqual({ 'bankOverrides.0.paymentMethod': MISMATCHED_METHOD_MESSAGE })
      expect(
        errorsOf(
          valid({
            bankOverrides: [{ ...base, paymentMethod: 'WALLET_BALANCE' }]
          })
        )
      ).toEqual({})
    })

    it('nạp/rút không được dùng WALLET_BALANCE', () => {
      const row = {
        ...buildEmptyOverride('DEPOSIT'),
        paymentMethod: 'WALLET_BALANCE' as const,
        minPerTransaction: 1,
        maxPerTransaction: 2,
        dailyMaximum: 3
      }
      expect(errorsOf(valid({ bankOverrides: [row] }))).toEqual({
        'bankOverrides.0.paymentMethod': MISMATCHED_METHOD_MESSAGE
      })
    })
  })

  describe('cấu hình Hệ thống khi cập nhật', () => {
    const schema = createWalletLimitFormSchema({
      requiredKeys: ['dailyMaximum', 'walletBalanceMaximum']
    })

    it('ô đang có giá trị không được bỏ trống', () => {
      const errors = errorsOf(
        valid({ dailyMaximum: null, walletBalanceMaximum: null }),
        schema
      )
      expect(errors.dailyMaximum).toBe(
        'Không được bỏ trống Hạn mức ngày của cấu hình Hệ thống.'
      )
      expect(errors.walletBalanceMaximum).toBe(
        'Không được bỏ trống Số dư tối đa của ví của cấu hình Hệ thống.'
      )
    })

    it('ô có giá trị thì hợp lệ; ô trống ở bản gốc vẫn được để trống', () => {
      expect(
        errorsOf(
          valid({ walletBalanceMaximum: 900000, outflowDailyMaximum: null }),
          schema
        )
      ).toEqual({})
    })
  })
})
