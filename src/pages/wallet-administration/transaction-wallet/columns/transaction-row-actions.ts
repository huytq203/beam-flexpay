import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { StatusEnum } from '../constants/Transaction.constant'

export interface FreezeTargetParty {
  ownerId: string
  ownerName: string
  ownerType: 'USER' | 'MERCHANT'
  roleLabel: 'Người chuyển' | 'Người nhận'
}

const isWalletParty = (
  party: UnifiedContentJournal['from'] | UnifiedContentJournal['to']
): party is UnifiedContentJournal['from'] & {
  id: string
  type: 'USER' | 'MERCHANT'
} =>
  Boolean(party?.id) && (party.type === 'USER' || party.type === 'MERCHANT')

/** POSTED là trạng thái thành công của journal và luôn phải có GL transaction để đóng băng. */
export const canShowFreezeTransactionAction = (
  transaction: UnifiedContentJournal
): boolean =>
  transaction.status === StatusEnum.POSTED && Boolean(transaction.transactionId)

export type FreezeTransactionAction = 'freeze' | 'unfreeze'

export const getFreezeTransactionAction = (
  transaction: UnifiedContentJournal
): FreezeTransactionAction | null => {
  if (!canShowFreezeTransactionAction(transaction)) return null
  return transaction.frozen ? 'unfreeze' : 'freeze'
}

/**
 * Một giao dịch có thể chạm hai ví nội bộ (P2P). Trả cả hai để người vận hành chọn
 * đúng ví, thay vì suy đoán ownerId nào là accountId.
 */
export const getFreezeTargetParties = (
  transaction: UnifiedContentJournal
): FreezeTargetParty[] => {
  const candidates = [
    { party: transaction.to, roleLabel: 'Người nhận' as const },
    { party: transaction.from, roleLabel: 'Người chuyển' as const }
  ]

  const seenOwnerIds = new Set<string>()
  return candidates.flatMap(({ party, roleLabel }) => {
    if (!isWalletParty(party) || seenOwnerIds.has(party.id)) return []
    seenOwnerIds.add(party.id)

    return [{
      ownerId: party.id,
      ownerName: party.username || party.displayName || '--',
      ownerType: party.type,
      roleLabel
    }]
  })
}
