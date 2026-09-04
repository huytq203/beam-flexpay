import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM
} from '../business-wallet.schema'

const futureDate = dayjs()
  .add(2, 'year')
  .startOf('day')
  .format('YYYY-MM-DDTHH:mm:ss.SSS')
const pastDate = dayjs()
  .subtract(1, 'day')
  .startOf('day')
  .format('YYYY-MM-DDTHH:mm:ss.SSS')
const file = { uid: '-1', name: 'tep.pdf', status: 'done' as const }

const validValues = {
  email: 'finance@highlandscoffee.com.vn',
  contactPhone: '0283822456',
  businessName: 'Công ty CP Việt Thái International',
  taxCode: '0301234567',
  headOfficeAddress: '115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  legalRepName: 'Nguyễn Văn Hải',
  legalRepIdNumber: '079090001234',
  managerName: 'Nguyễn Văn Hải',
  managerPosition: 'Tổng Giám đốc',
  managerIdNumber: '079090001234',
  managerIdExpiry: futureDate,
  otpPhone: '0903221456',
  businessLicense: [file],
  authorizationLetter: [],
  idCardFront: [file],
  idCardBack: [file],
  isInternalWallet: false
}

const errorFor = (values: unknown, field: string): string | undefined => {
  const result = businessWalletFormSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('businessWalletFormSchema', () => {
  it('chấp nhận bộ giá trị hợp lệ', () => {
    expect(businessWalletFormSchema.safeParse(validValues).success).toBe(true)
  })

  it('mã số thuế nhận 10 và 13 số, từ chối 11 số', () => {
    expect(errorFor({ ...validValues, taxCode: '0301234567' }, 'taxCode')).toBeUndefined()
    expect(errorFor({ ...validValues, taxCode: '0301234567001' }, 'taxCode')).toBeUndefined()
    expect(errorFor({ ...validValues, taxCode: '03012345670' }, 'taxCode')).toBe(
      'Mã số thuế gồm 10 hoặc 13 số'
    )
  })

  it('CCCD nhận 9 và 12 số, từ chối độ dài khác', () => {
    expect(errorFor({ ...validValues, legalRepIdNumber: '079090001' }, 'legalRepIdNumber')).toBeUndefined()
    expect(errorFor({ ...validValues, legalRepIdNumber: '079090001234' }, 'legalRepIdNumber')).toBeUndefined()
    expect(errorFor({ ...validValues, legalRepIdNumber: '07909000123' }, 'legalRepIdNumber')).toBe(
      'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'
    )
  })

  it('số điện thoại phải bắt đầu bằng 0 và có 10–11 số', () => {
    expect(errorFor({ ...validValues, contactPhone: '02838224567' }, 'contactPhone')).toBeUndefined()
    expect(errorFor({ ...validValues, contactPhone: '2838224567' }, 'contactPhone')).toBe(
      'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
    )
    expect(errorFor({ ...validValues, otpPhone: '090322145' }, 'otpPhone')).toBe(
      'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
    )
  })

  it('từ chối ngày hết hạn CCCD trong quá khứ', () => {
    expect(errorFor({ ...validValues, managerIdExpiry: pastDate }, 'managerIdExpiry')).toBe(
      'Ngày hết hạn CCCD phải sau hôm nay'
    )
  })

  it('bắt buộc ba tệp hồ sơ pháp lý', () => {
    expect(errorFor({ ...validValues, businessLicense: [] }, 'businessLicense')).toBe(
      'Vui lòng tải lên Giấy phép ĐKKD'
    )
    expect(errorFor({ ...validValues, idCardFront: [] }, 'idCardFront')).toBe(
      'Vui lòng tải lên ảnh CCCD mặt trước'
    )
    expect(errorFor({ ...validValues, idCardBack: [] }, 'idCardBack')).toBe(
      'Vui lòng tải lên ảnh CCCD mặt sau'
    )
  })

  it('bắt buộc giấy ủy quyền khi người quản lý ví khác người đại diện', () => {
    const values = {
      ...validValues,
      managerIdNumber: '079090009999',
      authorizationLetter: []
    }
    expect(errorFor(values, 'authorizationLetter')).toBe(
      'Người quản lý ví khác người đại diện pháp luật — bắt buộc có giấy ủy quyền'
    )
  })

  it('không bắt buộc giấy ủy quyền khi người quản lý ví là người đại diện', () => {
    expect(errorFor({ ...validValues, authorizationLetter: [] }, 'authorizationLetter')).toBeUndefined()
  })

  it('giá trị rỗng không hợp lệ và không có tệp nào', () => {
    expect(businessWalletFormSchema.safeParse(EMPTY_BUSINESS_WALLET_FORM).success).toBe(false)
    expect(EMPTY_BUSINESS_WALLET_FORM.businessLicense).toEqual([])
    expect(EMPTY_BUSINESS_WALLET_FORM.isInternalWallet).toBe(false)
  })
})
