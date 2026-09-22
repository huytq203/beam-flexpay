import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createFixtureSubMerchant,
  getSubMerchantById,
  resetSubMerchantRepository,
  updateFixtureSubMerchant
} from '../../sub-merchant/hooks/useSubMerchants'
import {
  createTerminal,
  getTerminalById,
  resetTerminalRepository,
  useTerminal,
  useTerminalRecords,
  useTerminals
} from '../hooks/useTerminals'

const NEW_SUB = {
  parentMerchantId: 'merchant-0142', name: 'HLC Rooftop',
  phoneInherited: true, phone: '', addressInherited: true, address: '', businessField: 'F&B'
}
const NEW_TERMINAL = {
  parentMerchantId: 'merchant-0142', subMerchantId: 'sub-001', name: 'POS mới',
  type: 'POS' as const, address: '42 Nguyễn Huệ', phone: '', note: ''
}
const PAYMENT_METHODS = ['QR động', 'Ví điện tử', 'Thẻ nội địa', 'Visa', 'Mastercard']

beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

describe('Terminal đọc cấu hình và quan hệ hiện tại từ Sub', () => {
  it.each(['terminal-001', 'terminal-locked'])(
    'QR và POS cùng Sub dùng cấu hình Sub, không lấy cấu hình riêng của %s', (id) => {
      expect(getTerminalById(id)?.inheritedPaymentMethods).toEqual(PAYMENT_METHODS)
      expect(getTerminalById(id)?.inheritedLimitLabel).toBe('Tối đa 50.000.000 VND/giao dịch')
    }
  )

  it('Terminal đầu tiên của Sub mới kế thừa cấu hình cụ thể từ Merchant cha', () => {
    const sub = createFixtureSubMerchant(NEW_SUB)
    const terminal = createTerminal({ ...NEW_TERMINAL, subMerchantId: sub.id })

    expect(terminal.inheritedPaymentMethods).toEqual(PAYMENT_METHODS)
    expect(terminal.inheritedLimitLabel).toBe('Tối đa 50.000.000 VND/giao dịch')
    expect(getTerminalById(terminal.id)?.inheritedPaymentMethods).toEqual(PAYMENT_METHODS)
  })

  it('mọi read API phản ứng với đổi tên Sub trong cùng phiên SPA', () => {
    const { result } = renderHook(() => ({
      list: useTerminals(), records: useTerminalRecords(), detail: useTerminal('terminal-001')
    }))
    act(() => {
      updateFixtureSubMerchant(getSubMerchantById('sub-001')!, {
        ...NEW_SUB, name: 'HLC Nguyễn Huệ mới'
      })
    })

    const expected = {
      subMerchantName: 'HLC Nguyễn Huệ mới', subMerchantCode: 'SUB-0142-01',
      parentMerchantId: 'merchant-0142', parentMerchantCode: 'MC000142',
      parentMerchantName: 'Highlands Coffee'
    }
    expect(getTerminalById('terminal-001')).toMatchObject(expected)
    expect(result.current.detail).toMatchObject(expected)
    expect(result.current.records.find((row) => row.id === 'terminal-001')).toMatchObject(expected)
    expect(result.current.list.rows.find((row) => row.id === 'terminal-001')).toMatchObject(expected)
  })
})
