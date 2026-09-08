import { describe, expect, it } from 'vitest'
import type { FeeComponent } from '../../types/FeeComponent.types'
import { groupFeeComponentsByBeneficiary } from '../feeComponentGroups'

const component = (
  componentType: string,
  beneficiaryType: string
): FeeComponent => ({
  id: `${componentType}-${beneficiaryType}`,
  componentType,
  beneficiaryType,
  baseOn: 'AMOUNT',
  calculationMethod: 'DIRECT',
  roundMode: 'HALF_UP',
  payerType: 'USER'
})

describe('nhóm thành phần phí theo bên hưởng', () => {
 

  it('gom nhiều thành phần cùng bên hưởng vào một nhóm', () => {
    const groups = groupFeeComponentsByBeneficiary([
      component('TRANSACTION_FEE', 'SYSTEM'),
      component('PLATFORM_FEE', 'SYSTEM')
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].items).toHaveLength(2)
  })

  it('không giấu thành phần có bên hưởng lạ — đẩy xuống cuối', () => {
    const groups = groupFeeComponentsByBeneficiary([
      component('SOMETHING_NEW', 'INSURER'),
      component('BANK_FEE', 'BANK')
    ])

    expect(groups.map((group) => group.beneficiaryType)).toEqual([
      'BANK',
      'INSURER'
    ])
  })

  it('trả mảng rỗng khi chưa có thành phần nào', () => {
    expect(groupFeeComponentsByBeneficiary([])).toEqual([])
    expect(groupFeeComponentsByBeneficiary(undefined)).toEqual([])
  })
})
