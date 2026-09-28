import { describe, expect, it } from 'vitest'
import { CreateMerchantSchema } from '../Merchant.schema'

const validForm = {
  walletType: 'BUSINESS',
  walletId: 'wallet-vtqt',
  signSeparateSubMerchantContract: true,
  merchantContract: [],
  mcc: '5814',
  merchantType: 'BUSINESS',
  merchantName: 'Highlands Coffee',
  merchantLogo: [],
  productImages: [],
  website: 'https://www.highlandscoffee.com.vn',
  productDescription: 'Chuỗi cửa hàng cà phê và đồ uống.'
}

describe('CreateMerchantSchema', () => {
  it('chấp nhận hồ sơ ký hợp đồng riêng tại Sub-merchant', () => {
    expect(CreateMerchantSchema.safeParse(validForm).success).toBe(true)
  })

  it('bắt buộc hợp đồng khi ký ở cấp Master', () => {
    const result = CreateMerchantSchema.safeParse({
      ...validForm,
      signSeparateSubMerchantContract: false
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.merchantContract).toContain(
        'Vui lòng tải lên hợp đồng ĐVCNTT cấp Master'
      )
    }
  })

  it('từ chối website không dùng giao thức HTTP hoặc HTTPS', () => {
    const result = CreateMerchantSchema.safeParse({
      ...validForm,
      website: 'highlandscoffee.com.vn'
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.website).toContain(
        'Địa chỉ website không đúng định dạng'
      )
    }
  })

  it('cho phép nhiều ảnh sản phẩm và kiểm tra định dạng từng ảnh', () => {
    const images = [
      { uid: 'a', name: 'a.png', type: 'image/png', size: 1024 },
      { uid: 'b', name: 'b.jpg', type: 'image/jpeg', size: 2048 }
    ]
    expect(
      CreateMerchantSchema.safeParse({ ...validForm, productImages: images })
        .success
    ).toBe(true)
    const invalid = CreateMerchantSchema.safeParse({
      ...validForm,
      productImages: [
        ...images,
        { uid: 'c', name: 'c.pdf', type: 'application/pdf', size: 1024 }
      ]
    })
    expect(invalid.success).toBe(false)
  })
})
