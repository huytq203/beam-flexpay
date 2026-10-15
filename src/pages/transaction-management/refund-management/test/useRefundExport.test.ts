import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRefundExport } from '../hooks/useRefundExport'

const mocks = vi.hoisted(() => ({ exportFile: vi.fn() }))

vi.mock('@services/apiExportCsv', () => ({
  useExportRefundsMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

describe('useRefundExport', () => {
  beforeEach(() => mocks.exportFile.mockClear())

  it('gửi đúng bộ lọc của lưới và bỏ page/size/sort', () => {
    const { result } = renderHook(() =>
      useRefundExport({
        keyword: ' RF-1 ',
        status: 'SUCCESS',
        channel: 'TO_BANK',
        createdFrom: '2026-10-01',
        createdTo: '2026-10-14'
      })
    )

    act(() => result.current.exportFile())

    const params = mocks.exportFile.mock.calls[0][0]
    expect(params).toMatchObject({
      keyword: 'RF-1',
      status: 'SUCCESS',
      channel: 'TO_BANK',
      createdFrom: '2026-10-01T00:00:00',
      createdTo: '2026-10-14T23:59:59'
    })
    expect(params).not.toHaveProperty('page')
    expect(params).not.toHaveProperty('size')
    expect(params).not.toHaveProperty('sort')
  })
})
