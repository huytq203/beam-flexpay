import { describe, expect, it } from 'vitest'

import {
  bankAccountFormSchema,
  bankAccountLockSchema,
  EMPTY_BANK_ACCOUNT_FORM,
  type BankAccountFormValues
} from '../bank-account.schema'
import { WithdrawCycle, WithdrawMode } from '../../types/bank-account.type'

const validForm: BankAccountFormValues = {
  ...EMPTY_BANK_ACCOUNT_FORM,
  masterMerchantId: 'MC000142',
  bankCode: 'VCB',
  accountNumber: '0071000124821',
  accountName: 'NGUYEN VAN HAI'
}

const firstIssuePath = (values: BankAccountFormValues): string[] => {
  const result = bankAccountFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('bankAccountFormSchema', () => {
  it('nhận form hợp lệ ở chế độ rút thủ công', () => {
    expect(bankAccountFormSchema.safeParse(validForm).success).toBe(true)
  })

  it.each(['12345', '1'.repeat(21), '00710a0124821', ''])(
    'từ chối số tài khoản không hợp lệ: %s',
    (accountNumber) => {
      expect(firstIssuePath({ ...validForm, accountNumber })).toContain(
        'accountNumber'
      )
    }
  )

  it('bắt buộc chu kỳ khi chọn rút tự động', () => {
    expect(
      firstIssuePath({
        ...validForm,
        withdrawMode: WithdrawMode.AUTO,
        withdrawCycle: null
      })
    ).toContain('withdrawCycle')
  })

  it('bỏ qua chu kỳ khi rút thủ công', () => {
    expect(
      firstIssuePath({
        ...validForm,
        withdrawMode: WithdrawMode.MANUAL,
        withdrawCycle: null
      })
    ).toHaveLength(0)
  })

  it('chấp nhận chu kỳ khi rút tự động', () => {
    expect(
      firstIssuePath({
        ...validForm,
        withdrawMode: WithdrawMode.AUTO,
        withdrawCycle: WithdrawCycle.T1
      })
    ).toHaveLength(0)
  })

  it('từ chối hạn mức tối đa nhỏ hơn tối thiểu', () => {
    expect(
      firstIssuePath({
        ...validForm,
        minAmount: 5_000_000,
        maxAmount: 1_000_000
      })
    ).toContain('maxAmount')
  })

  it('cho phép bỏ trống cả hai đầu hạn mức', () => {
    expect(
      firstIssuePath({ ...validForm, minAmount: null, maxAmount: null })
    ).toHaveLength(0)
  })

  it('bắt buộc chọn Master Merchant và ngân hàng', () => {
    const paths = firstIssuePath({
      ...validForm,
      masterMerchantId: '',
      bankCode: ''
    })
    expect(paths).toContain('masterMerchantId')
    expect(paths).toContain('bankCode')
  })
})

describe('bankAccountLockSchema', () => {
  it('từ chối lý do dưới 10 ký tự', () => {
    expect(bankAccountLockSchema.safeParse({ reason: 'sai quy ' }).success).toBe(
      false
    )
  })

  it('nhận lý do từ 10 ký tự trở lên', () => {
    expect(
      bankAccountLockSchema.safeParse({ reason: 'Sai thông tin thụ hưởng' })
        .success
    ).toBe(true)
  })
})
