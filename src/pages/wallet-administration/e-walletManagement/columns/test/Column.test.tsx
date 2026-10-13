import { render, screen } from '@testing-library/react'
import { Table } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import type { AcountItem } from '../../types/ResponseWalletAccount.type'
import { getColumn } from '../Column'

const account = {
  id: 'wallet-id',
  ownerId: 'owner-id',
  ownerUsername: '0967770788',
  ownerFullName: 'NGUYỄN VĂN A',
  ownerType: 'USER',
  glCode: 'USER_WALLET_VND',
  currency: 'VND',
  balance: 0,
  holdBalance: 0,
  availableBalance: 0,
  status: 'LOCKED',
  ekycStatus: 'VERIFIED',
  createdAt: '2026-08-24T09:26:38.615585'
} as AcountItem

describe('wallet account columns', () => {
  it('hiển thị ownerFullName, username và trạng thái eKYC từ API', () => {
    render(
      <Table
        columns={getColumn({
          can: () => false,
          onViewDetail: vi.fn()
        })}
        dataSource={[account]}
        pagination={false}
        rowKey='id'
      />
    )

    expect(screen.getByText('NGUYỄN VĂN A')).toBeInTheDocument()
    expect(screen.getByText('0967770788')).toBeInTheDocument()
    expect(screen.getByText('Đã xác thực')).toBeInTheDocument()
  })

  it.each([
    [true, 'Đăng nhập bị khóa', 'Đăng nhập bình thường'],
    [false, 'Đăng nhập bình thường', 'Đăng nhập bị khóa'],
    [null, 'Chưa xác định', 'Đăng nhập bị khóa'],
    [undefined, 'Chưa xác định', 'Đăng nhập bị khóa']
  ])('cột Đăng nhập: loginLocked=%s hiện %s', (loginLocked, shown, hidden) => {
    render(
      <Table
        columns={getColumn({ can: () => false, onViewDetail: vi.fn() })}
        dataSource={[{ ...account, loginLocked }]}
        pagination={false}
        rowKey='id'
      />
    )

    expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    if (shown) expect(screen.getAllByText(shown)).toHaveLength(1)
    expect(screen.queryByText(hidden)).not.toBeInTheDocument()
  })
})
