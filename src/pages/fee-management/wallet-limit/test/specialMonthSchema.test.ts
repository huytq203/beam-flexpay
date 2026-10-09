import { describe, expect, it } from 'vitest'
import {
  renameSpecialMonthSchema,
  specialMonthSchema
} from '../schemas/specialMonth.schema'

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message

describe('specialMonthSchema', () => {
  it('nhận tháng yyyy-MM và tên hợp lệ, cắt khoảng trắng đầu cuối', () => {
    const result = specialMonthSchema.safeParse({
      month: '2027-02',
      name: '  Tết Nguyên đán 2027  '
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      month: '2027-02',
      name: 'Tết Nguyên đán 2027'
    })
  })

  it('bắt buộc chọn tháng', () => {
    const result = specialMonthSchema.safeParse({ month: '', name: 'Tết' })
    expect(firstMessage(result)).toBe('Vui lòng chọn tháng.')
  })

  it.each(['2027-13', '2027-00', '02/2027', '2027-2'])(
    'từ chối tháng sai dạng %s',
    (month) => {
      expect(specialMonthSchema.safeParse({ month, name: 'Tết' }).success).toBe(
        false
      )
    }
  )

  it('bắt buộc có tên, kể cả chỉ toàn khoảng trắng', () => {
    const result = specialMonthSchema.safeParse({
      month: '2027-02',
      name: '   '
    })
    expect(firstMessage(result)).toBe('Vui lòng nhập tên tháng đặc biệt.')
  })

  it('cho phép đúng 200 ký tự, từ chối 201 ký tự', () => {
    const ok = specialMonthSchema.safeParse({
      month: '2027-02',
      name: 'a'.repeat(200)
    })
    const tooLong = specialMonthSchema.safeParse({
      month: '2027-02',
      name: 'a'.repeat(201)
    })
    expect(ok.success).toBe(true)
    expect(firstMessage(tooLong)).toBe('Tên tháng đặc biệt tối đa 200 ký tự.')
  })
})

describe('renameSpecialMonthSchema', () => {
  it('chỉ kiểm tra tên', () => {
    expect(
      renameSpecialMonthSchema.safeParse({ name: 'Tên mới' }).success
    ).toBe(true)
    expect(renameSpecialMonthSchema.safeParse({ name: '' }).success).toBe(false)
  })
})
