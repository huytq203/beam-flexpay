import { FeeDomain } from '@components/fee/feeDomain'
import { describe, expect, it } from 'vitest'
import {
  FEE_BUSINESS_CATEGORY,
  getComponentTypesForCategory,
  getFeeBusinessCategories,
  getVatBaseForCategory,
  inferFeeBusinessCategory
} from '../constants/feeConfigFields'

describe('nhóm phí nghiệp vụ trên form', () => {
  it('miền Bank/NCC chỉ dùng phí Bank và VAT tính trên phí Bank', () => {
    expect(getFeeBusinessCategories(FeeDomain.BANK)).toEqual([
      FEE_BUSINESS_CATEGORY.BANK_PROVIDER
    ])
    expect(
      getComponentTypesForCategory(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)
    ).toEqual(['BANK_FEE', 'VAT'])
    expect(
      getVatBaseForCategory(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)
    ).toBe('BANK_FEE')
  })

  it('miền ví và ĐVCNTT cho chọn phí xử lý hoặc phí nền tảng', () => {
    const expected = [
      FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING,
      FEE_BUSINESS_CATEGORY.PLATFORM
    ]

    expect(getFeeBusinessCategories(FeeDomain.EWALLET)).toEqual(expected)
    expect(getFeeBusinessCategories(FeeDomain.MERCHANT)).toEqual(expected)
  })

  it('phí xử lý chỉ dùng phí giao dịch và VAT tính trên phí giao dịch', () => {
    expect(
      getComponentTypesForCategory(
        FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING
      )
    ).toEqual(['TRANSACTION_FEE', 'VAT'])
    expect(
      getVatBaseForCategory(
        FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING
      )
    ).toBe('TRANSACTION_FEE')
  })

  it('phí nền tảng chỉ dùng PLATFORM_FEE và không có VAT', () => {
    expect(
      getComponentTypesForCategory(FEE_BUSINESS_CATEGORY.PLATFORM)
    ).toEqual(['PLATFORM_FEE'])
    expect(getVatBaseForCategory(FEE_BUSINESS_CATEGORY.PLATFORM)).toBeNull()
  })

  it('suy đúng nhóm từ dữ liệu backend khi mở màn sửa', () => {
    expect(
      inferFeeBusinessCategory(FeeDomain.BANK, [
        { componentType: 'BANK_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)
    expect(
      inferFeeBusinessCategory(FeeDomain.EWALLET, [
        { componentType: 'PLATFORM_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.PLATFORM)
    expect(
      inferFeeBusinessCategory(FeeDomain.MERCHANT, [
        { componentType: 'TRANSACTION_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING)
  })
})
