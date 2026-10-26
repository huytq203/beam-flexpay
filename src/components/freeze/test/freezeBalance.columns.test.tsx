import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FreezeItem } from '@type/freeze.type'
import { getFreezeBalanceColumns } from '../freezeBalance.columns'

const columns = getFreezeBalanceColumns({})
const titles = columns.map((column) => column.title)

const typeColumn = columns.find((column) => column.key === 'type')!
const codeColumn = columns.find((column) => column.key === 'freezeCode')!

const renderCell = (
  column: (typeof columns)[number],
  overrides: Partial<FreezeItem>
) => {
  const record = {
    freezeCode: null,
    sourceTransactionId: null,
    sourceTransactionCode: null,
    reason: null,
    ...overrides
  } as FreezeItem
  render(<>{column.render?.(undefined, record, 0)}</>)
}

describe('getFreezeBalanceColumns', () => {
  it('có cột Mã đóng băng, không còn cột Cách mở băng', () => {
    expect(titles).toContain('Mã đóng băng')
    expect(titles).toContain('Loại đóng băng')
    expect(titles).not.toContain('Cách mở băng')
    expect(titles).not.toContain('Lý do đóng băng')
  })

  it('hiện mã đóng băng', () => {
    renderCell(codeColumn, { freezeCode: 'FZ7K4M9Q2H' })
    expect(screen.getByText('FZ7K4M9Q2H')).toBeInTheDocument()
  })

  it('thiếu mã thì hiện --', () => {
    renderCell(codeColumn, { freezeCode: null })
    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('đóng băng không gắn giao dịch gốc là Đóng băng số dư', () => {
    renderCell(typeColumn, { reason: 'Nghi ngờ gian lận' })
    expect(screen.getByText('Đóng băng số dư')).toBeInTheDocument()
    expect(screen.getByText(/Nghi ngờ gian lận/)).toBeInTheDocument()
    expect(screen.queryByText(/Mã giao dịch gốc/)).not.toBeInTheDocument()
  })

  it('đóng băng gắn giao dịch gốc là Đóng băng giao dịch kèm mã giao dịch', () => {
    renderCell(typeColumn, {
      sourceTransactionId: 'tx-1',
      sourceTransactionCode: 'TXN20260825A1'
    })
    expect(screen.getByText('Đóng băng giao dịch')).toBeInTheDocument()
    expect(screen.getByText(/TXN20260825A1/)).toBeInTheDocument()
  })
})
