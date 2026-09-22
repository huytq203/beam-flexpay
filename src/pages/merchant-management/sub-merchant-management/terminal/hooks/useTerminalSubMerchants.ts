import { SUB_MERCHANT_FIXTURES } from '../../sub-merchant/constants/subMerchant.fixture'
import {
  getSubMerchantById,
  useSubMerchants
} from '../../sub-merchant/hooks/useSubMerchants'
import type { SubMerchantRow } from '../../sub-merchant/types/subMerchant.type'

export const getCurrentSubMerchant = (id: string): SubMerchantRow | undefined =>
  getSubMerchantById(id) ?? SUB_MERCHANT_FIXTURES.find((row) => row.id === id)

const mergeCurrentRows = (
  repositoryPage: readonly SubMerchantRow[]
): SubMerchantRow[] => {
  const rows = new Map<string, SubMerchantRow>()
  SUB_MERCHANT_FIXTURES.forEach((seed) => {
    rows.set(seed.id, getCurrentSubMerchant(seed.id) ?? seed)
  })
  repositoryPage.forEach((row) => rows.set(row.id, row))
  return Array.from(rows.values())
}

export const useCurrentSubMerchants = (): readonly SubMerchantRow[] => {
  const repository = useSubMerchants()
  return mergeCurrentRows(repository.rows)
}
