import { beforeEach, describe, expect, it } from 'vitest'
import { findSensitiveElements, isSensitiveText } from '../engine/sensitive'

describe('isSensitiveText', () => {
  it.each([
    '2,000,000 VND',
    '100.000',
    '9,000,000',
    '500000 VNĐ',
    '0962341913',
    '0962 341 913',
    '012345678901'
  ])('nhận ra "%s" là dữ liệu nhạy cảm', (text) =>
    expect(isSensitiveText(text)).toBe(true)
  )

  it.each([
    'Rút tiền',
    'FW26IMPGB',
    '23/10/2026 18:15:27',
    '688',
    '477',
    'Tài khoản liên kết',
    '',
    '   '
  ])('không coi "%s" là nhạy cảm', (text) =>
    expect(isSensitiveText(text)).toBe(false)
  )

  it('đoạn văn dài không bị coi là nhạy cảm dù có số', () => {
    expect(isSensitiveText(`${'chữ '.repeat(30)} 2,000,000`)).toBe(false)
  })
})

describe('findSensitiveElements', () => {
  beforeEach(() => {
    document.body.innerHTML = `<table><tbody><tr>
      <td id="amount">2,000,000 VND</td>
      <td id="phone">0962341913</td>
      <td id="type">Rút tiền</td>
      <td id="action"><button type="button">Hoàn tiền</button></td>
      <td id="plain">Ví điện tử</td>
    </tr></tbody></table><div class="ant-statistic-content" id="stat">688</div>`
  })

  it('đánh dấu ô số tiền, số điện thoại và ô có nút thao tác', () => {
    const ids = findSensitiveElements().map((el) => el.id)
    expect(ids).toEqual(expect.arrayContaining(['amount', 'phone', 'action']))
  })

  it('bỏ qua ô thường và thẻ thống kê chỉ có số đếm', () => {
    const ids = findSensitiveElements().map((el) => el.id)
    expect(ids).not.toContain('type')
    expect(ids).not.toContain('plain')
    expect(ids).not.toContain('stat')
  })
})
