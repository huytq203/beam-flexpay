import { describe, expect, it } from 'vitest'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import {
  buildCreateBody,
  buildUpdateBody,
  isIdentityChanged,
  toDraft
} from '../utils/bankAccount.utils'

const otp = { otpSessionId: 'session-1', otp: '123456' }

const masterRow: BankAccountDto = {
  id: 'bank-1',
  version: 3,
  merchantId: 'merchant-1',
  level: 'MASTER',
  bankCode: 'VCB',
  accountNumber: '0071000124821',
  accountName: 'CONG TY A',
  isDefault: false,
  holderNameExempt: false,
  status: 'ACTIVE',
  linkStatus: 'LINKED'
}

const subRow: BankAccountDto = {
  ...masterRow,
  id: 'bank-2',
  level: 'SUB',
  subMerchantId: 'sub-1'
}

// Quyết định 22/10 (FR-MER-0608-01): chỉ TK Master mới có ô "dùng tên khác pháp nhân".
describe('Ô dùng tên chủ TK khác pháp nhân', () => {
  it('tạo TK Master có tích thì gửi allowDifferentHolderName=true', () => {
    const draft = { ...toDraft(null), bankCode: 'VCB', accountNumber: '0071000124821', accountName: 'Nguyen Van B', allowDifferentHolderName: true }
    expect(buildCreateBody(draft, { merchantId: 'merchant-1', isDefault: false }, otp))
      .toMatchObject({ merchantId: 'merchant-1', allowDifferentHolderName: true })
  })

  it('tạo TK Master không tích thì không gửi trường này', () => {
    const draft = { ...toDraft(null), bankCode: 'VCB', accountNumber: '0071000124821', accountName: 'Cong ty A' }
    expect(buildCreateBody(draft, { merchantId: 'merchant-1', isDefault: false }, otp))
      .not.toHaveProperty('allowDifferentHolderName')
  })

  it('tạo TK Sub thì bỏ trường này dù draft còn tích (TK Sub không bị so tên)', () => {
    const draft = { ...toDraft(null), bankCode: 'VCB', accountNumber: '0071000124821', accountName: 'X', allowDifferentHolderName: true }
    expect(buildCreateBody(draft, { merchantId: 'merchant-1', subMerchantId: 'sub-1', isDefault: false }, otp))
      .not.toHaveProperty('allowDifferentHolderName')
  })

  it('sửa TK Master lấy giá trị đang lưu làm mặc định', () => {
    expect(toDraft({ ...masterRow, holderNameExempt: true }).allowDifferentHolderName).toBe(true)
    expect(toDraft(masterRow).allowDifferentHolderName).toBe(false)
  })

  it('bật/tắt ô trên TK Master là thay đổi cần OTP và chỉ gửi khi đổi', () => {
    const draft = { ...toDraft(masterRow), allowDifferentHolderName: true }
    expect(isIdentityChanged(masterRow, draft)).toBe(true)
    expect(buildUpdateBody(masterRow, draft, otp)).toMatchObject({ allowDifferentHolderName: true })
    expect(buildUpdateBody(masterRow, toDraft(masterRow))).not.toHaveProperty('allowDifferentHolderName')
    expect(isIdentityChanged(masterRow, toDraft(masterRow))).toBe(false)
  })

  it('TK Sub không gửi và không đòi OTP vì ô này', () => {
    const draft = { ...toDraft(subRow), allowDifferentHolderName: true }
    expect(isIdentityChanged(subRow, draft)).toBe(false)
    expect(buildUpdateBody(subRow, draft)).not.toHaveProperty('allowDifferentHolderName')
  })
})
