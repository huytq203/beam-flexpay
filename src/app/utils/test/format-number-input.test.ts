import { describe, expect, it } from 'vitest'
import {
  formatThousands,
  parseThousands
} from '../format-number-input'

describe('formatThousands', () => {
  it('chèn dấu phẩy phân cách hàng nghìn cho số nguyên', () => {
    expect(formatThousands(222222222222)).toBe('222,222,222,222')
    expect(formatThousands('1000')).toBe('1,000')
    expect(formatThousands(999)).toBe('999')
  })
  it('chỉ định dạng phần nguyên, giữ nguyên phần thập phân', () => {
    expect(formatThousands('12345.6789')).toBe('12,345.6789')
    expect(formatThousands('1.5')).toBe('1.5')
  })
  it('giữ dấu chấm đang gõ dở', () => {
    expect(formatThousands('1000.')).toBe('1,000.')
  })
  it('giữ dấu âm', () => {
    expect(formatThousands(-1234567)).toBe('-1,234,567')
  })
  it('ô trống trả chuỗi rỗng', () => {
    expect(formatThousands(undefined)).toBe('')
    expect(formatThousands('')).toBe('')
  })
})

describe('parseThousands', () => {
  it('bỏ dấu phẩy để lấy lại số', () => {
    expect(parseThousands('222,222,222,222')).toBe('222222222222')
    expect(parseThousands('12,345.67')).toBe('12345.67')
  })
  it('ô trống trả chuỗi rỗng', () => {
    expect(parseThousands(undefined)).toBe('')
  })
})
