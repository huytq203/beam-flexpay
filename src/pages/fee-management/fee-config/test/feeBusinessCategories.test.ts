import { describe, expect, it } from 'vitest'
import {
  FEE_BUSINESS_CATEGORY,
  FEE_SCOPE,
  getComponentTypesForCategory,
  getFeeBusinessCategories,
  getFeeScopeOfPayer,
  getVatBaseForCategory,
  inferFeeBusinessCategory,
  resolveFeeScope
} from '../constants/feeConfigFields'

describe('nhóm phí nghiệp vụ trên form', () => {
  it('phí đầu vào chỉ dùng phí Bank và VAT tính trên phí Bank', () => {
    expect(getFeeBusinessCategories(FEE_SCOPE.INPUT_COST)).toEqual([
      FEE_BUSINESS_CATEGORY.BANK_PROVIDER
    ])
    expect(
      getComponentTypesForCategory(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)
    ).toEqual(['BANK_FEE', 'VAT'])
    expect(getVatBaseForCategory(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)).toBe(
      'BANK_FEE'
    )
  })

  it('phí đầu ra cho chọn phí xử lý hoặc phí nền tảng', () => {
    expect(getFeeBusinessCategories(FEE_SCOPE.OUTPUT_FEE)).toEqual([
      FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING,
      FEE_BUSINESS_CATEGORY.PLATFORM
    ])
  })

  it('phí xử lý chỉ dùng phí giao dịch và VAT tính trên phí giao dịch', () => {
    expect(
      getComponentTypesForCategory(FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING)
    ).toEqual(['TRANSACTION_FEE', 'VAT'])
    expect(
      getVatBaseForCategory(FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING)
    ).toBe('TRANSACTION_FEE')
  })

  it('phí nền tảng cho VAT tính trên PLATFORM_FEE', () => {
    expect(
      getComponentTypesForCategory(FEE_BUSINESS_CATEGORY.PLATFORM)
    ).toEqual(['PLATFORM_FEE', 'VAT'])
    expect(getVatBaseForCategory(FEE_BUSINESS_CATEGORY.PLATFORM)).toBe(
      'PLATFORM_FEE'
    )
  })

  it('suy đúng nhóm từ dữ liệu backend khi mở màn sửa', () => {
    expect(
      inferFeeBusinessCategory(FEE_SCOPE.INPUT_COST, [
        { componentType: 'BANK_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.BANK_PROVIDER)
    expect(
      inferFeeBusinessCategory(FEE_SCOPE.OUTPUT_FEE, [
        { componentType: 'PLATFORM_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.PLATFORM)
    expect(
      inferFeeBusinessCategory(FEE_SCOPE.OUTPUT_FEE, [
        { componentType: 'TRANSACTION_FEE' }
      ])
    ).toBe(FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING)
  })
})

describe('luồng phí', () => {
  it('Hệ thống chịu là phí đầu vào, mọi người chịu khác là phí đầu ra', () => {
    expect(getFeeScopeOfPayer('SYSTEM')).toBe(FEE_SCOPE.INPUT_COST)
    for (const payer of ['USER', 'MERCHANT', 'SENDER', 'RECEIVER']) {
      expect(getFeeScopeOfPayer(payer)).toBe(FEE_SCOPE.OUTPUT_FEE)
    }
  })

  it('ưu tiên luồng backend trả về, bản ghi cũ thì suy từ người chịu', () => {
    expect(resolveFeeScope('INPUT_COST', 'USER')).toBe(FEE_SCOPE.INPUT_COST)
    expect(resolveFeeScope(undefined, 'SYSTEM')).toBe(FEE_SCOPE.INPUT_COST)
    expect(resolveFeeScope(null, 'MERCHANT')).toBe(FEE_SCOPE.OUTPUT_FEE)
    expect(resolveFeeScope('rác', 'USER')).toBe(FEE_SCOPE.OUTPUT_FEE)
  })
})
