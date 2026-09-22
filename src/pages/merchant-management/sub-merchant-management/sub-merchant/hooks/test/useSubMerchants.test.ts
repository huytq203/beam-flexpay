import { beforeEach, describe, expect, it } from 'vitest'

import type { SubMerchantFormValue } from '../../schemas/subMerchant.schema'
import {
  createFixtureSubMerchant,
  getSubMerchantById,
  getSubMerchantSnapshot,
  resetSubMerchantRepository,
  updateFixtureSubMerchant
} from '../useSubMerchants'

const formValue = (overrides: Partial<SubMerchantFormValue> = {}): SubMerchantFormValue => ({
  parentMerchantId: 'merchant-0142',
  name: 'Sub-merchant thử nghiệm',
  phoneInherited: true,
  phone: '',
  addressInherited: true,
  address: '',
  businessField: 'F&B',
  ...overrides
})

describe('Sub-merchant repository inheritance', () => {
  beforeEach(() => resetSubMerchantRepository())

  it('luôn lấy dữ liệu kế thừa từ Merchant cha dù Sub override được prepend và edit', () => {
    const overridden = createFixtureSubMerchant(formValue({
      name: 'Điểm A',
      phoneInherited: false,
      phone: '0909999999',
      addressInherited: false,
      address: 'Địa chỉ override A'
    }))
    updateFixtureSubMerchant(overridden, formValue({
      name: 'Điểm A đã sửa',
      phoneInherited: false,
      phone: '0918888888',
      addressInherited: false,
      address: 'Địa chỉ override A đã sửa'
    }))

    const inherited = createFixtureSubMerchant(formValue({ name: 'Điểm B' }))

    expect(inherited.phone).toBe('028 7300 1122')
    expect(inherited.address).toBe('123 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh')
    expect(inherited.taxCode).toBe('0312345678')
    expect(inherited.maskedIntegrationKey).toBe('••••A142')
  })

  it('cập nhật dữ liệu kế thừa từ nguồn Merchant cha, không từ Sub đứng đầu', () => {
    createFixtureSubMerchant(formValue({
      phoneInherited: false,
      phone: '0909999999',
      addressInherited: false,
      address: 'Địa chỉ override'
    }))
    const record = getSubMerchantById('sub-001')
    expect(record).toBeDefined()

    const updated = updateFixtureSubMerchant(record!, formValue({ name: record!.name }))

    expect(updated.phone).toBe('028 7300 1122')
    expect(updated.address).toBe('123 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh')
  })

  it('giữ seed inherited đồng nhất với dữ liệu hiệu lực của Merchant cha', () => {
    expect(getSubMerchantById('sub-002')?.phone).toBe('028 7300 1122')
    expect(getSubMerchantById('sub-locked')?.address).toBe(
      '12 Nguyễn Thị Minh Khai, Phường Sài Gòn, TP. Hồ Chí Minh'
    )
    expect(getSubMerchantById('sub-suspended')).toMatchObject({
      phone: '028 7302 2525',
      address: '106 Nguyễn Giản Thanh, Phường Hòa Hưng, TP. Hồ Chí Minh'
    })
  })

  it.each(['merchant-0160', 'merchant-0220'])(
    'chặn mutation tạo mới trực tiếp khi Merchant cha %s không hoạt động',
    (parentMerchantId) => {
      expect(() => createFixtureSubMerchant(formValue({
        parentMerchantId,
        name: 'Không được tạo'
      }))).toThrow('Merchant cha phải đang hoạt động để tạo Sub-merchant')
    }
  )

  it('trả đầy đủ snapshot repository không bị giới hạn bởi phân trang', () => {
    for (let index = 1; index <= 12; index += 1) {
      createFixtureSubMerchant(formValue({ name: `Snapshot ${index}` }))
    }

    const snapshot = getSubMerchantSnapshot()

    expect(snapshot).toHaveLength(16)
    expect(snapshot.map((row) => row.name)).toEqual(expect.arrayContaining([
      'Snapshot 1',
      'Snapshot 12'
    ]))
  })
})
