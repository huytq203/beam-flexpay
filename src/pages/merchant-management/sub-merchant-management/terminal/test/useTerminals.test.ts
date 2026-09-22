import { beforeEach, describe, expect, it } from 'vitest'

import {
  createFixtureSubMerchant,
  resetSubMerchantRepository,
  toggleSubMerchantStatus
} from '../../sub-merchant/hooks/useSubMerchants'
import {
  changeTerminalStatus,
  createTerminal,
  getTerminalById,
  resetTerminalRepository,
  updateTerminal
} from '../hooks/useTerminals'

const EDITED_TERMINAL = {
  parentMerchantId: 'merchant-0142',
  subMerchantId: 'sub-001',
  name: 'QR đã sửa',
  type: 'STATIC_QR' as const,
  address: '42 Nguyễn Huệ',
  phone: '',
  note: ''
}

beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

describe('Terminal repository kết hợp trạng thái Sub-merchant hiện tại', () => {
  it('chiếu trạng thái tạm ngưng và chặn tạo/sửa/mở khóa khi Sub bị khóa', () => {
    expect(toggleSubMerchantStatus('sub-001', 'Khóa để đối soát')).toBe(true)

    expect(getTerminalById('terminal-001')?.status).toBe('SUSPENDED_BY_SUB')
    expect(() => createTerminal(EDITED_TERMINAL)).toThrow(
      'Sub-merchant đang tạm ngưng'
    )
    expect(updateTerminal('terminal-001', EDITED_TERMINAL)).toBeUndefined()
    expect(
      changeTerminalStatus('terminal-locked', 'Không được mở khóa riêng')
    ).toBe(false)
    expect(getTerminalById('terminal-locked')?.status).toBe('SUSPENDED_BY_SUB')
  })

  it('khôi phục trạng thái riêng và cho phép mutation sau khi Sub mở lại', () => {
    toggleSubMerchantStatus('sub-001', 'Khóa để đối soát')
    toggleSubMerchantStatus('sub-001', 'Mở lại sau đối soát')

    expect(getTerminalById('terminal-001')?.status).toBe('ACTIVE')
    expect(getTerminalById('terminal-locked')?.status).toBe('LOCKED')
    expect(
      changeTerminalStatus('terminal-locked', 'Thiết bị đã sẵn sàng')
    ).toBe(true)
    expect(getTerminalById('terminal-locked')?.status).toBe('ACTIVE')
  })

  it('cho phép tạo Terminal cho Sub vừa tạo trong cùng phiên SPA', () => {
    const sub = createFixtureSubMerchant({
      parentMerchantId: 'merchant-0142',
      name: 'HLC Rooftop',
      phoneInherited: true,
      phone: '',
      addressInherited: true,
      address: '',
      businessField: 'F&B'
    })

    const terminal = createTerminal({
      ...EDITED_TERMINAL,
      subMerchantId: sub.id,
      name: 'POS Rooftop'
    })

    expect(terminal.subMerchantName).toBe('HLC Rooftop')
    expect(terminal.parentMerchantName).toBe('Highlands Coffee')
  })
})
