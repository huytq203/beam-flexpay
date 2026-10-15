import { describe, expect, it } from 'vitest'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import {
  buildCreateBody,
  buildUpdateBody,
  isDraftValid,
  isIdentityChanged,
  isLockReasonMissing,
  maskAccountNumber,
  toDraft
} from '../bankAccount.utils'

const row: BankAccountDto = {
  id: 'bank-1',
  version: 3,
  merchantId: 'merchant-1',
  level: 'MASTER',
  bankCode: 'VCB',
  accountNumber: '0071000124821',
  accountName: 'CONG TY A',
  branchName: 'HCM',
  isDefault: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED'
}
const otp = { otpSessionId: 'session-1', otp: '123456' }

describe('bankAccount.utils', () => {
  it('che số tài khoản, chỉ giữ 4 số cuối', () => {
    expect(maskAccountNumber('0071000124821')).toBe('••••4821')
  })

  it('chỉ hợp lệ khi đủ ngân hàng, số tài khoản 6–20 chữ số và tên chủ', () => {
    expect(isDraftValid(toDraft(row))).toBe(true)
    expect(isDraftValid({ ...toDraft(row), accountNumber: '12345' })).toBe(
      false
    )
    expect(isDraftValid({ ...toDraft(row), accountName: '  ' })).toBe(false)
  })

  it('yêu cầu OTP khi tạo mới hoặc đổi thông tin định danh', () => {
    expect(isIdentityChanged(null, toDraft(null))).toBe(true)
    expect(isIdentityChanged(row, toDraft(row))).toBe(false)
    expect(isIdentityChanged(row, { ...toDraft(row), branchName: 'HN' })).toBe(
      false
    )
    expect(isIdentityChanged(row, { ...toDraft(row), bankCode: 'TCB' })).toBe(
      true
    )
  })

  it('payload cập nhật chỉ gửi field thực sự đổi kèm version', () => {
    expect(
      buildUpdateBody(row, { ...toDraft(row), branchName: ' HN ', reason: '' })
    ).toEqual({
      version: 3,
      branchName: 'HN',
      reason: undefined,
      otp: undefined
    })
  })

  it('payload tạo gắn Sub-merchant thay cho Master khi có chọn Sub', () => {
    const draft = {
      ...toDraft(null),
      bankCode: 'VCB',
      accountNumber: '123456',
      accountName: 'cong ty a'
    }
    expect(
      buildCreateBody(
        draft,
        { merchantId: 'merchant-1', subMerchantId: 'sub-1', isDefault: true },
        otp
      )
    ).toEqual({
      subMerchantId: 'sub-1',
      bankCode: 'VCB',
      accountNumber: '123456',
      accountName: 'CONG TY A',
      branchName: undefined,
      isDefault: true,
      otp
    })
    expect(
      buildCreateBody(
        draft,
        { merchantId: 'merchant-1', isDefault: false },
        otp
      )
    ).toMatchObject({ merchantId: 'merchant-1' })
  })
})

describe('isLockReasonMissing', () => {
  it('khóa tài khoản đang hoạt động cần lý do tối thiểu 10 ký tự', () => {
    const draft = { ...toDraft(row), status: 'INACTIVE' as const }
    expect(isLockReasonMissing(row, { ...draft, reason: 'ngắn' })).toBe(true)
    expect(isLockReasonMissing(row, { ...draft, reason: '  ngắn     ' })).toBe(
      true
    )
    expect(
      isLockReasonMissing(row, { ...draft, reason: 'Nghi ngờ gian lận' })
    ).toBe(false)
  })
  it('không áp dụng khi không phải thao tác khóa', () => {
    expect(isLockReasonMissing(row, toDraft(row))).toBe(false)
    expect(isLockReasonMissing(null, toDraft(null))).toBe(false)
  })
})
