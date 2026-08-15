import { render, screen } from '@testing-library/react'
import { Table } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import type { AcountItem } from '../../types/ResponseWalletAccount.type'
import { getColumn } from '../Column'

const createAccount = (
  id: string,
  ownerUsername: string,
  verifyEKYC: boolean
): AcountItem => ({
  id,
  createdAt: '2026-08-14T08:00:00Z',
  updatedAt: '2026-08-14T08:00:00Z',
  createdBy: 'admin',
  updatedBy: 'admin',
  ownerId: `owner-${id}`,
  ownerType: 'USER',
  ownerUsername,
  glCode: '1101',
  currency: 'VND',
  totalDebit: 0,
  totalCredit: 0,
  balance: 0,
  holdBalance: 0,
  availableBalance: 0,
  version: 1,
  status: 'ACTIVE',
  enabled: true,
  verifyEKYC,
  checksum: `checksum-${id}`
})

const WalletTable = () => {
  const dataSource = [
    createAccount('verified', 'verified-user', true),
    createAccount('unverified', 'unverified-user', false)
  ]

  return (
    <Table
      columns={getColumn({ onViewDetail: vi.fn(), can: () => false })}
      dataSource={dataSource}
      pagination={false}
      rowKey='id'
    />
  )
}

describe('cột trạng thái eKYC', () => {
  it('hiển thị đúng nhãn cho cả hai giá trị boolean', () => {
    render(<WalletTable />)

    expect(screen.getByText('Đã eKYC')).toBeInTheDocument()
    expect(screen.getByText('Chưa eKYC')).toBeInTheDocument()
  })
})
