import { describe, expect, it } from 'vitest'
import { PUBLISHABLE_SERVICE_TYPES } from '@utils/fee-execution'
import {
  FEE_SCREEN_CONFIG,
  feeScreenOfPolicy,
  visibleServiceTypesFor
} from '../constants/feeScreen'

describe('visibleServiceTypesFor', () => {
  it('màn ĐVCNTT chỉ hiện hai loại thu hộ / chi hộ', () => {
    expect(
      visibleServiceTypesFor('MERCHANT_FEE', PUBLISHABLE_SERVICE_TYPES)
    ).toEqual(['MERCHANT_VA_BILL_COLLECTION', 'PAYOUT_BANK_TRANSFER'])
  })

  it('màn phí đầu ra ẩn thu hộ, chi hộ và hoàn tiền', () => {
    const visible = visibleServiceTypesFor(
      'CUSTOMER_FEE',
      PUBLISHABLE_SERVICE_TYPES
    )
    expect(visible).not.toContain('MERCHANT_VA_BILL_COLLECTION')
    expect(visible).not.toContain('PAYOUT_BANK_TRANSFER')
    expect(visible).not.toContain('EWALLET_REFUND')
  })

  it('giữ loại đang chọn ở màn đầu ra dù đang bị ẩn', () => {
    expect(
      visibleServiceTypesFor(
        'CUSTOMER_FEE',
        PUBLISHABLE_SERVICE_TYPES,
        'PAYOUT_BANK_TRANSFER'
      )
    ).toContain('PAYOUT_BANK_TRANSFER')
  })

  it('giữ loại đang chọn ở màn ĐVCNTT để chính sách lạc màn vẫn hiện đúng nhãn', () => {
    expect(
      visibleServiceTypesFor(
        'MERCHANT_FEE',
        PUBLISHABLE_SERVICE_TYPES,
        'EWALLET_DEPOSIT'
      )
    ).toContain('EWALLET_DEPOSIT')
  })
})

describe('feeScreenOfPolicy', () => {
  it('chỉ phí đầu ra miền MERCHANT thuộc màn ĐVCNTT', () => {
    expect(feeScreenOfPolicy('CUSTOMER_FEE', 'MERCHANT')).toBe('MERCHANT_FEE')
    expect(feeScreenOfPolicy('CUSTOMER_FEE', 'EWALLET')).toBe('CUSTOMER_FEE')
    expect(feeScreenOfPolicy('CUSTOMER_FEE', 'BANK')).toBe('CUSTOMER_FEE')
    expect(feeScreenOfPolicy('INPUT_COST', 'MERCHANT')).toBe('INPUT_COST')
  })
})

describe('FEE_SCREEN_CONFIG', () => {
  it('màn ĐVCNTT dùng chính sách đầu ra, quyền và đường dẫn riêng', () => {
    expect(FEE_SCREEN_CONFIG.MERCHANT_FEE).toMatchObject({
      policyKind: 'CUSTOMER_FEE',
      permissionScreen: 'MERCHANT_FEE_CONFIG',
      feeDomain: 'MERCHANT',
      csvPrefix: 'cau-hinh-phi-dvcntt'
    })
    expect(FEE_SCREEN_CONFIG.MERCHANT_FEE.editPath('x')).toBe(
      '/secure-panel/merchant/fee-config/edit/x'
    )
  })
})
