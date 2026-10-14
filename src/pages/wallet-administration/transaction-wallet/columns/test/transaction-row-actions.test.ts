import { describe, expect, it } from 'vitest'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  canShowFreezeTransactionAction,
  canShowRefundTransactionAction,
  getFreezeTransactionAction,
  getFreezeTargetParties,
  isPendingApprovalTransaction
} from '../transaction-row-actions'

const transaction = (
  overrides: Partial<UnifiedContentJournal> = {}
): UnifiedContentJournal => ({
  id: 'journal-1',
  journalCode: 'JRNL-1',
  transactionCode: 'TXN-1',
  status: 'POSTED',
  transactionType: 'P2P_TRANSFER',
  from: {
    id: 'owner-sender',
    username: 'sender',
    displayName: 'Người chuyển',
    type: 'USER'
  },
  to: {
    id: 'owner-receiver',
    username: 'receiver',
    displayName: 'Người nhận',
    type: 'USER'
  },
  amount: 100_000,
  grossAmount: 100_000,
  feeAmount: 0,
  currency: 'VND',
  paymentMethod: 'WALLET_BALANCE',
  bankCode: null,
  bankRefId: null,
  transactionId: 'gl-transaction-1',
  reversesJournalId: null,
  reversedByJournalId: null,
  description: 'Chuyển tiền',
  failureReason: null,
  createdAt: '2026-08-17T10:00:00',
  postedAt: '2026-08-17T10:00:01',
  archivedAt: null,
  sourceDomain: 'EWALLET',
  frozen: false,
  freeze: null,
  ...overrides
})

describe('canShowFreezeTransactionAction', () => {
  it('chỉ cho hiện action khi journal đã POSTED và có GL transaction', () => {
    expect(canShowFreezeTransactionAction(transaction())).toBe(true)
    expect(
      canShowFreezeTransactionAction(transaction({ status: 'PENDING' }))
    ).toBe(false)
    expect(
      canShowFreezeTransactionAction(transaction({ transactionId: '' }))
    ).toBe(false)
  })
})

describe('getFreezeTransactionAction', () => {
  it('đổi từ đóng băng sang mở băng khi giao dịch đang frozen', () => {
    expect(getFreezeTransactionAction(transaction())).toBe('freeze')
    expect(
      getFreezeTransactionAction(
        transaction({
          frozen: true,
          freeze: {
            heldAmount: 100_000,
            shortfallAmount: 0,
            requestedAmount: 100_000,
            orderCount: 1
          }
        })
      )
    ).toBe('unfreeze')
    expect(
      getFreezeTransactionAction(
        transaction({ status: 'FAILED', frozen: true })
      )
    ).toBeNull()
  })
})

describe('getFreezeTargetParties', () => {
  it('trả cả ví nhận và ví chuyển cho giao dịch P2P', () => {
    expect(getFreezeTargetParties(transaction())).toEqual([
      {
        ownerId: 'owner-receiver',
        ownerName: 'receiver',
        ownerType: 'USER',
        roleLabel: 'Người nhận'
      },
      {
        ownerId: 'owner-sender',
        ownerName: 'sender',
        ownerType: 'USER',
        roleLabel: 'Người chuyển'
      }
    ])
  })

  it('loại bên ngân hàng và không lặp cùng một chủ ví', () => {
    expect(
      getFreezeTargetParties(
        transaction({
          from: {
            id: 'owner-receiver',
            username: 'receiver',
            displayName: 'Người nhận',
            type: 'USER'
          },
          to: {
            id: '',
            username: '',
            displayName: 'VCB',
            type: 'BANK'
          }
        })
      )
    ).toEqual([
      {
        ownerId: 'owner-receiver',
        ownerName: 'receiver',
        ownerType: 'USER',
        roleLabel: 'Người chuyển'
      }
    ])

    expect(
      getFreezeTargetParties(
        transaction({
          to: {
            id: 'owner-sender',
            username: 'sender',
            displayName: 'Người chuyển',
            type: 'USER'
          }
        })
      )
    ).toHaveLength(1)
  })
})

describe('canShowRefundTransactionAction', () => {
  it('chỉ hiện với giao dịch thành công, không đóng băng, có transactionId và loại hoàn được', () => {
    expect(canShowRefundTransactionAction(transaction())).toBe(true)
    expect(
      canShowRefundTransactionAction(
        transaction({ transactionType: 'CASH_IN' })
      )
    ).toBe(true)
  })

  it.each([
    ['đang đóng băng', { frozen: true }],
    ['chưa thành công', { status: 'PENDING' }],
    [
      'thất bại hoàn tiền (status vẫn là FAILED)',
      { status: 'FAILED', displayStatus: 'FAILED_REFUND' }
    ],
    ['thiếu transactionId', { transactionId: null }],
    ['loại REVERSAL', { transactionType: 'REVERSAL' }]
  ])('ẩn khi %s', (_name, overrides) => {
    expect(canShowRefundTransactionAction(transaction(overrides))).toBe(false)
  })
})

describe('isPendingApprovalTransaction', () => {
  it.each([
    [
      'displayStatus là PENDING_APPROVAL (sổ cái vẫn PENDING)',
      { status: 'PENDING', displayStatus: 'PENDING_APPROVAL' }
    ],
    ['status là PENDING_APPROVAL', { status: 'PENDING_APPROVAL' }]
  ])('đúng khi %s', (_name, overrides) => {
    expect(isPendingApprovalTransaction(transaction(overrides))).toBe(true)
  })

  it.each([
    ['PENDING thường', { status: 'PENDING' }],
    ['AUTHORIZED', { status: 'AUTHORIZED' }],
    ['thất bại hoàn tiền', { status: 'FAILED', displayStatus: 'FAILED_REFUND' }]
  ])('sai với %s: nút cập nhật giao dịch treo vẫn hiện', (_name, overrides) => {
    expect(isPendingApprovalTransaction(transaction(overrides))).toBe(false)
  })
})
