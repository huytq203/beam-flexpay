import { describe, expect, it } from 'vitest'
import { CreateMerchantSchema, EditMerchantSchema } from '../Merchant.schema'

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
  productDescription: 'Chuỗi cửa hàng cà phê và đồ uống.',
  escrowAmount: 50_000_000
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

describe('Số tiền ký quỹ khi tạo ĐVCNTT', () => {
  const escrowErrors = (
    schema: typeof CreateMerchantSchema,
    value: unknown
  ) => {
    const result = schema.safeParse({ ...validForm, escrowAmount: value })
    return result.success
      ? []
      : (result.error.flatten().fieldErrors.escrowAmount ?? [])
  }

  it('bắt buộc nhập khi tạo', () => {
    expect(escrowErrors(CreateMerchantSchema, null)).toContain(
      'Vui lòng nhập số tiền ký quỹ'
    )
  })

  it('từ chối số âm và số thập phân', () => {
    expect(escrowErrors(CreateMerchantSchema, -1)).toContain(
      'Số tiền ký quỹ không được âm'
    )
    expect(escrowErrors(CreateMerchantSchema, 1.5)).toContain(
      'Số tiền ký quỹ phải là số nguyên'
    )
  })

  it('chấp nhận 0 (không phải ký quỹ) và số dương', () => {
    expect(escrowErrors(CreateMerchantSchema, 0)).toEqual([])
    expect(escrowErrors(CreateMerchantSchema, 50_000_000)).toEqual([])
  })

  it('schema cập nhật không bắt buộc ký quỹ', () => {
    expect(escrowErrors(EditMerchantSchema, null)).toEqual([])
  })
})
