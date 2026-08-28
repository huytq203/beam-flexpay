import { describe, expect, it } from 'vitest'
import type { FreezeItem } from '@type/freeze.type'
import {
  FreezeRowAction,
  getCommittedUnfreezeAmount,
  getFreezeAmountSummary,
  getFreezeRowAction,
  getFreezeRowActionFlags,
  isAwaitingUnfreezeApproval,
  resolveFreezeBadgeKey
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

describe('isAwaitingUnfreezeApproval', () => {
  it('chỉ đúng khi lệnh mở băng đang ở PENDING_APPROVAL', () => {
    expect(isAwaitingUnfreezeApproval(pending())).toBe(true)
    expect(isAwaitingUnfreezeApproval(freeze())).toBe(false)
    expect(
      isAwaitingUnfreezeApproval(
        freeze({ unfreezeCommandId: 'command-1', unfreezeCommandStatus: 'EXECUTED' })
      )
    ).toBe(false)
  })
})

describe('resolveFreezeBadgeKey', () => {
  it('lệnh chờ duyệt được ưu tiên hơn displayStatus của BE', () => {
    expect(resolveFreezeBadgeKey(pending())).toBe('PENDING_APPROVAL')
  })

  it('không có lệnh chờ duyệt thì giữ nguyên displayStatus', () => {
    expect(resolveFreezeBadgeKey(freeze())).toBe('FROZEN')
    expect(
      resolveFreezeBadgeKey(freeze({ displayStatus: 'PARTIALLY_RELEASED' }))
    ).toBe('PARTIALLY_RELEASED')
    expect(
      resolveFreezeBadgeKey(
        freeze({
          displayStatus: 'RELEASED',
          unfreezeCommandId: 'command-1',
          unfreezeCommandStatus: 'EXECUTED'
        })
      )
    ).toBe('RELEASED')
  })
})

describe('getCommittedUnfreezeAmount', () => {
  it('cộng tổng amount của các lệnh PENDING và EXECUTED', () => {
    expect(
      getCommittedUnfreezeAmount([
        { id: 'c1', amount: 10_000, status: 'PENDING_APPROVAL' } as never,
        { id: 'c2', amount: 20_000, status: 'EXECUTED' } as never,
        { id: 'c3', amount: 5_000, status: 'REJECTED' } as never
      ])
    ).toBe(30_000)
  })

  it('trả về 0 khi không có lệnh active', () => {
    expect(getCommittedUnfreezeAmount([])).toBe(0)
    expect(
      getCommittedUnfreezeAmount([
        { id: 'c1', amount: 15_000, status: 'REJECTED' } as never
      ])
    ).toBe(0)
  })
})

describe('getFreezeRowAction', () => {
  it('bản ghi ACTIVE chưa có lệnh thì mở bước tạo yêu cầu', () => {
    expect(getFreezeRowAction(freeze())).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('đang chờ duyệt thì chuyển sang bước duyệt / từ chối', () => {
    expect(getFreezeRowAction(pending())).toBe(FreezeRowAction.DECIDE_UNFREEZE)
  })

  it('chờ duyệt mà thiếu commandId thì canDecide=false nhưng vẫn cho tạo lệnh mới', () => {
    expect(
      getFreezeRowAction(pending({ unfreezeCommandId: null }))
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
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
        freeze({ unfreezeCommandId: 'command-1', unfreezeCommandStatus: 'REJECTED' })
      )
    ).toBe(FreezeRowAction.REQUEST_UNFREEZE)
  })

  it('đã committed một phần thì vẫn cho phép tạo thêm lệnh mở băng', () => {
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

  it('tổng committed bằng releasable thì ẩn nút mở băng', () => {
    expect(
      getFreezeRowAction(
        freeze({
          remainingAmount: 50_000,
          shortfallAmount: 0,
          unfreezeCommands: [
            { id: 'c1', amount: 30_000, status: 'EXECUTED' } as never,
            { id: 'c2', amount: 20_000, status: 'PENDING_APPROVAL' } as never
          ]
        })
      )
    ).toBe(FreezeRowAction.NONE)
  })

  it('lệnh REJECTED không được tính vào committed nên vẫn cho mở băng', () => {
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
})

describe('getFreezeRowActionFlags', () => {
  it('bản ghi kết thúc thì cả hai flag đều false', () => {
    expect(getFreezeRowActionFlags(freeze({ status: 'RELEASED' }))).toEqual({
      canRequestUnfreeze: false,
      canDecideUnfreeze: false
    })
  })

  it('ACTIVE chưa có lệnh: chỉ canRequestUnfreeze', () => {
    expect(getFreezeRowActionFlags(freeze())).toEqual({
      canRequestUnfreeze: true,
      canDecideUnfreeze: false
    })
  })

  it('pending mà committed đủ releasable: chỉ canDecideUnfreeze', () => {
    expect(
      getFreezeRowActionFlags(
        freeze({
          remainingAmount: 50_000,
          unfreezeCommandId: 'c1',
          unfreezeCommandStatus: 'PENDING_APPROVAL',
          unfreezeCommands: [{ id: 'c1', amount: 50_000, status: 'PENDING_APPROVAL' } as never]
        })
      )
    ).toEqual({ canRequestUnfreeze: false, canDecideUnfreeze: true })
  })

  it('pending partial (committed < releasable): canDecide=true nhưng canRequest=false vì BE chưa hỗ trợ parallel', () => {
    expect(
      getFreezeRowActionFlags(
        freeze({
          remainingAmount: 100_000,
          unfreezeCommandId: 'c1',
          unfreezeCommandStatus: 'PENDING_APPROVAL',
          unfreezeCommands: [{ id: 'c1', amount: 1_000, status: 'PENDING_APPROVAL' } as never]
        })
      )
    ).toEqual({ canRequestUnfreeze: false, canDecideUnfreeze: true })
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
    expect(getFreezeAmountSummary(freeze({ shortfallAmount: 15_000 })).shortfall).toBe(
      15_000
    )
  })
})
