import { describe, expect, it } from 'vitest'
import {
  getOutputBeneficiaryOptions,
  outputBeneficiaryFor
} from '../constants/feeComponentParties'
import {
  buildDialogDefaults,
  getComponentPartyOptions
} from '../utils/feeComponentParties'
import { toSetupRequest } from '../utils/feeConfigPayload'
import { baseForm } from './feeConfigPayload.fixtures'

describe('người hưởng phí đầu ra theo loại phí', () => {
  it('VAT về Ngân hàng, loại phí khác về Hệ thống', () => {
    expect(outputBeneficiaryFor('VAT')).toBe('BANK')
    expect(outputBeneficiaryFor('TRANSACTION_FEE')).toBe('SYSTEM')
    expect(outputBeneficiaryFor('')).toBe('SYSTEM')
    expect(getOutputBeneficiaryOptions('VAT')).toEqual([
      { value: 'BANK', label: 'Ngân hàng' }
    ])
    expect(getOutputBeneficiaryOptions('REFUND_FEE')).toEqual([
      { value: 'SYSTEM', label: 'Hệ thống' }
    ])
  })

  it('mở sửa bản ghi cũ: VAT lưu Hệ thống chuyển thành Ngân hàng, phí thường lưu Ngân hàng về Hệ thống', () => {
    const parties = getComponentPartyOptions(false, 'EWALLET_WITHDRAWAL')
    const [component] = baseForm().components
    const open = (componentType: string, beneficiaryType: string) =>
      buildDialogDefaults({
        parties,
        feeScope: 'OUTPUT_FEE',
        initialValue: { ...component, componentType, beneficiaryType },
        hasPartner: false
      }).beneficiaryType

    expect(open('VAT', 'SYSTEM')).toBe('BANK')
    expect(open('TRANSACTION_FEE', 'BANK')).toBe('SYSTEM')
  })

  it('payload gửi đúng người hưởng theo loại phí, phí đầu vào giữ lựa chọn', () => {
    const form = baseForm()
    const [fee] = form.components
    form.components = [
      { ...fee, componentType: 'TRANSACTION_FEE', beneficiaryType: 'BANK' },
      {
        ...fee,
        key: 'vat',
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        beneficiaryType: 'SYSTEM'
      },
      {
        ...fee,
        key: 'cost',
        feeScope: 'INPUT_COST',
        componentType: 'BANK_FEE',
        payerType: 'SYSTEM',
        beneficiaryType: 'PARTNER'
      }
    ]

    expect(
      toSetupRequest(form).components.map(
        ({ componentType, beneficiaryType }) => [componentType, beneficiaryType]
      )
    ).toEqual([
      ['TRANSACTION_FEE', 'SYSTEM'],
      ['VAT', 'BANK'],
      ['BANK_FEE', 'PARTNER']
    ])
  })
})
