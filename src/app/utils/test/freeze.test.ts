import { describe, expect, it } from 'vitest'
import type { FreezeItem } from '@type/freeze.type'
import {
  FreezeRowAction,
  getFreezeAmountSummary,
  getFreezeRowAction,
  getFreezeRowActionFlags
} from '../freeze'

const freeze = (overrides: Partial<FreezeItem> = {}): FreezeItem => ({
  id: 'freeze-1',
  accountId: 'account-1',
  sourceTransactionId: null,
  sourceTransactionCode: null,
  ownerId: 'owner-1',
  ownerType: 'USER',
  ownerUsername: '0988753731',
  amount: 50_000,
  requestedAmount: 50_000,
  releasedAmount: 0,
  remainingAmount: 50_000,
  shortfallAmount: 0,
  totalHeldAmount: 50_000,
  totalReleasedAmount: 0,
  topUpCount: 0,
  parentFreezeId: null,
  displayStatus: 'FROZEN',
  reason: 'Nghi ngờ gian lận',
  unfreezeReason: null,
  status: 'ACTIVE',
  releaseType: null,
  type: 'ADMIN_LOCK',
  createdAt: '2026-08-25T15:56:05.326622',
  createdBy: 'huytq',
  updatedAt: '2026-08-25T15:56:05.326622',
  updatedBy: 'huytq',
  unfreezeLogs: [],
  unfreezeCommandId: null,
  unfreezeCommandStatus: null,
  unfreezeCommandAmount: null,
  unfreezeCommandMakerId: null,
  unfreezeCommandReason: null,
  unfreezeCommandCreatedAt: null,
  unfreezeCommands: [],
  ...overrides
})

const pending = (overrides: Partial<FreezeItem> = {}) =>
  freeze({
    unfreezeCommandId: 'command-1',
    unfreezeCommandStatus: 'PENDING_APPROVAL',
    ...overrides
  })

describe('getFreezeRowAction', () => {
  it('bản ghi ACTIVE còn tiền thì cho mở băng', () => {
    expect(getFreezeRowAction(freeze())).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('không kiểm tra lệnh maker-checker cũ đang pending', () => {
    expect(getFreezeRowAction(pending())).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('bản ghi đã kết thúc thì không còn hành động', () => {
    expect(getFreezeRowAction(freeze({ status: 'RELEASED' }))).toBe(
      FreezeRowAction.NONE
    )
    expect(getFreezeRowAction(freeze({ status: 'CAPTURED' }))).toBe(
      FreezeRowAction.NONE
    )
  })

  it('lệnh đã bị từ chối thì quay lại bước tạo yêu cầu mới', () => {
    expect(
      getFreezeRowAction(
        freeze({
          unfreezeCommandId: 'command-1',
          unfreezeCommandStatus: 'REJECTED'
        })
      )
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('lịch sử EXECUTED không chặn yêu cầu cho số tiền còn lại', () => {
    expect(
      getFreezeRowAction(
        freeze({
          remainingAmount: 50_000,
          unfreezeCommands: [
            { id: 'c1', amount: 20_000, status: 'EXECUTED' } as never
          ]
        })
      )
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('hiện mở băng khi Đã mở băng 115.000, lệnh mới nhất bị từ chối và còn 30.000', () => {
    expect(
      getFreezeRowAction(
        freeze({
          amount: 145_000,
          requestedAmount: 145_000,
          releasedAmount: 115_000,
          remainingAmount: 30_000,
          shortfallAmount: 0,
          totalHeldAmount: 30_000,
          totalReleasedAmount: 115_000,
          displayStatus: 'PARTIALLY_RELEASED',
          unfreezeCommandId: 'rejected-command',
          unfreezeCommandStatus: 'REJECTED',
          unfreezeCommands: [
            { id: 'c1', amount: 85_000, status: 'EXECUTED' } as never,
            { id: 'c2', amount: 30_000, status: 'EXECUTED' } as never,
            {
              id: 'rejected-command',
              amount: 30_000,
              status: 'REJECTED'
            } as never
          ]
        })
      )
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('lệnh REJECTED không chặn yêu cầu mở băng mới', () => {
    expect(
      getFreezeRowAction(
        freeze({
          remainingAmount: 50_000,
          unfreezeCommands: [
            { id: 'c1', amount: 50_000, status: 'REJECTED' } as never
          ]
        })
      )
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('không hiện mở băng khi không còn khoản nào có thể giải tỏa', () => {
    expect(
      getFreezeRowAction(freeze({ remainingAmount: 0, shortfallAmount: 0 }))
    ).toBe(FreezeRowAction.NONE)
  })
})

describe('getFreezeRowActionFlags', () => {
  it('bản ghi kết thúc thì không thể mở băng', () => {
    expect(getFreezeRowActionFlags(freeze({ status: 'RELEASED' }))).toEqual({
      canRequestUnfreeze: false
    })
  })

  it('ACTIVE còn tiền thì có thể mở băng', () => {
    expect(getFreezeRowActionFlags(freeze())).toEqual({
      canRequestUnfreeze: true
    })
  })

  it('không chặn mở băng bởi trạng thái pending của cơ chế cũ', () => {
    expect(
      getFreezeRowActionFlags(
        freeze({
          remainingAmount: 50_000,
          unfreezeCommandId: 'c1',
          unfreezeCommandStatus: 'PENDING_APPROVAL',
          unfreezeCommands: [
            { id: 'c1', amount: 50_000, status: 'PENDING_APPROVAL' } as never
          ]
        })
      )
    ).toEqual({ canRequestUnfreeze: true })
  })
})

describe('getFreezeAmountSummary', () => {
  it('ưu tiên số tổng của cả lệnh thay vì số của riêng dòng', () => {
    expect(
      getFreezeAmountSummary(
        freeze({
          amount: 50_000,
          remainingAmount: 30_000,
          releasedAmount: 20_000,
          totalHeldAmount: 80_000,
          totalReleasedAmount: 20_000,
          topUpCount: 2
        })
      )
    ).toEqual({ held: 80_000, released: 20_000, shortfall: 0, topUpCount: 2 })
  })

  it('giữ nguyên phần còn thiếu để không giấu việc ví chưa đủ tiền', () => {
    expect(
      getFreezeAmountSummary(freeze({ shortfallAmount: 15_000 })).shortfall
    ).toBe(15_000)
  })
})
