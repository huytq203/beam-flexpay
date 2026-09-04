import { describe, expect, it } from 'vitest'

import type { BusinessWalletFormValues } from '@pages/merchant-management/business-wallet-account/schemas/business-wallet.schema'
import { toBusinessWalletPayload } from '../apiBusinessWallet.api'

const file = (
  name: string
): BusinessWalletFormValues['businessLicense'][number] => ({
  uid: `uid-${name}`,
  name,
  status: 'done'
})

const values: BusinessWalletFormValues = {
  email: 'finance@highlandscoffee.com.vn',
  contactPhone: '0283822456',
  businessName: '  Công ty CP Việt Thái International  ',
  taxCode: '0301234567',
  headOfficeAddress: '115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  legalRepName: 'Nguyễn Văn Hải',
  legalRepIdNumber: '079090001234',
  managerName: 'Nguyễn Văn Hải',
  managerPosition: 'Tổng Giám đốc',
  managerIdNumber: '079090001234',
  managerIdExpiry: '2030-12-12T00:00:00.000',
  otpPhone: '0903221456',
  businessLicense: [file('GiayPhep_DKKD.pdf')],
  authorizationLetter: [],
  idCardFront: [file('CCCD_MatTruoc.jpg')],
  idCardBack: [file('CCCD_MatSau.jpg')],
  isInternalWallet: true
}

describe('toBusinessWalletPayload', () => {
  it('cắt khoảng trắng và giữ nguyên các trường định danh', () => {
    const payload = toBusinessWalletPayload(values)

    expect(payload.businessName).toBe('Công ty CP Việt Thái International')
    expect(payload.email).toBe('finance@highlandscoffee.com.vn')
    expect(payload.taxCode).toBe('0301234567')
    expect(payload.isInternalWallet).toBe(true)
  })

  it('chuẩn hóa ngày hết hạn CCCD về YYYY-MM-DD', () => {
    expect(toBusinessWalletPayload(values).managerIdExpiry).toBe('2030-12-12')
  })

  it('quy đổi danh sách tệp thành tên tệp', () => {
    const payload = toBusinessWalletPayload(values)

    expect(payload.attachments.businessLicense).toEqual(['GiayPhep_DKKD.pdf'])
    expect(payload.attachments.authorizationLetter).toEqual([])
    expect(payload.attachments.idCardFront).toEqual(['CCCD_MatTruoc.jpg'])
    expect(payload.attachments.idCardBack).toEqual(['CCCD_MatSau.jpg'])
  })
})
