import { describe, expect, it } from 'vitest'
import { getBaseOnOptions } from '../utils/feeComponentBaseOptions'

const optionValues = (
  options: ReturnType<typeof getBaseOnOptions>
): string[] => options.map(({ value }) => value)

describe('FeeComponentDialog base-on options', () => {
  it('chỉ cho tính trên số tiền giao dịch khi chưa có thành phần phía trước', () => {
    expect(
      optionValues(
        getBaseOnOptions({
          isBank: false,
          isVat: false,
          hasPrecedingComponents: false
        })
      )
    ).toEqual(['AMOUNT'])
  })

  it('cho tính trên thành phần khác khi đã có thành phần phía trước', () => {
    expect(
      optionValues(
        getBaseOnOptions({
          isBank: false,
          isVat: false,
          hasPrecedingComponents: true
        })
      )
    ).toEqual(['AMOUNT', 'FEE_COMPONENT'])
  })
})
