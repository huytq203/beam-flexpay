import { describe, expect, it } from 'vitest'

import {
  subMerchantFormSchema,
  type SubMerchantFormValue
} from '../subMerchant.schema'

const validValue: SubMerchantFormValue = {
  parentMerchantId: 'merchant-0142',
  name: 'HLC Lê Lợi',
  phoneInherited: false,
  phone: '028 3822 9988',
  addressInherited: false,
  address: '12 Lê Lợi, TP. Hồ Chí Minh',
  businessField: 'F&B'
}

describe('subMerchantFormSchema', () => {
  it('chỉ yêu cầu địa chỉ khi tắt kế thừa', () => {
    expect(
      subMerchantFormSchema.safeParse({
        ...validValue,
        addressInherited: false,
        address: ''
      }).success
    ).toBe(false)
    expect(
      subMerchantFormSchema.safeParse({
        ...validValue,
        addressInherited: true,
        address: ''
      }).success
    ).toBe(true)
  })

  it('chỉ yêu cầu số điện thoại hợp lệ khi tắt kế thừa', () => {
    expect(
      subMerchantFormSchema.safeParse({
        ...validValue,
        phoneInherited: false,
        phone: '123'
      }).success
    ).toBe(false)
    expect(
      subMerchantFormSchema.safeParse({
        ...validValue,
        phoneInherited: true,
        phone: ''
      }).success
    ).toBe(true)
  })

  it('từ chối số điện thoại chỉ gồm dấu câu và khoảng trắng', () => {
    const result = subMerchantFormSchema.safeParse({
      ...validValue,
      phoneInherited: false,
      phone: '+ (---) ...'
    })

    expect(result.success).toBe(false)
  })

  it('yêu cầu Merchant cha, tên và lĩnh vực kinh doanh', () => {
    const result = subMerchantFormSchema.safeParse({
      ...validValue,
      parentMerchantId: '',
      name: '',
      businessField: ''
    })

    expect(result.success).toBe(false)
  })
})
