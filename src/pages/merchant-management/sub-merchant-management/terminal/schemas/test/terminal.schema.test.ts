import { describe, expect, it } from 'vitest'

import { terminalFormSchema } from '../terminal.schema'

const validTerminal = {
  parentMerchantId: 'merchant-0142',
  subMerchantId: 'sub-001',
  name: 'POS quầy chính',
  type: 'POS' as const,
  address: '42 Nguyễn Huệ, TP. Hồ Chí Minh',
  phone: '028 3822 9988',
  note: 'Thiết bị tại quầy chính.'
}

describe('terminalFormSchema', () => {
  it.each([
    ['parentMerchantId', ''],
    ['subMerchantId', ''],
    ['name', '   '],
    ['address', '   ']
  ] as const)('từ chối trường bắt buộc %s bị trống', (field, value) => {
    expect(
      terminalFormSchema.safeParse({ ...validTerminal, [field]: value }).success
    ).toBe(false)
  })

  it('chấp nhận đủ bốn loại Terminal', () => {
    for (const type of ['STATIC_QR', 'DYNAMIC_QR', 'POS', 'SOFTPOS'] as const) {
      expect(
        terminalFormSchema.safeParse({ ...validTerminal, type }).success
      ).toBe(true)
    }
  })

  it('giới hạn tên 255 ký tự và ghi chú 500 ký tự', () => {
    expect(
      terminalFormSchema.safeParse({ ...validTerminal, name: 'T'.repeat(256) })
        .success
    ).toBe(false)
    expect(
      terminalFormSchema.safeParse({ ...validTerminal, note: 'N'.repeat(501) })
        .success
    ).toBe(false)
  })
})
