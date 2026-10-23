import { describe, expect, it } from 'vitest'
import {
  inputCostReportFilterSchema,
  toInputCostReportParams
} from '../fee-input-cost-report.schema'

const parse = (value: unknown) => inputCostReportFilterSchema.safeParse(value)

describe('inputCostReportFilterSchema', () => {
  it('hợp lệ khi Từ ngày = Đến ngày', () => {
    expect(parse({ from: '2026-10-01', to: '2026-10-01' }).success).toBe(true)
  })

  it('bắt buộc cả hai ngày', () => {
    expect(parse({ from: '', to: '2026-10-01' }).success).toBe(false)
    expect(parse({ from: '2026-10-01' }).success).toBe(false)
  })

  it('từ chối Từ ngày sau Đến ngày', () => {
    const r = parse({ from: '2026-10-02', to: '2026-10-01' })
    expect(r.success).toBe(false)
  })

  it('cho đúng 366 ngày, từ chối 367 ngày', () => {
    expect(parse({ from: '2024-01-01', to: '2024-12-31' }).success).toBe(true)
    expect(parse({ from: '2024-01-01', to: '2025-01-01' }).success).toBe(false)
  })
})

describe('toInputCostReportParams', () => {
  it('bỏ các ô trống', () => {
    expect(
      toInputCostReportParams({
        from: '2026-10-01',
        to: '2026-10-23',
        providerCode: '',
        bankCode: 'VCB',
        serviceType: undefined
      })
    ).toEqual({ from: '2026-10-01', to: '2026-10-23', bankCode: 'VCB' })
  })
})
