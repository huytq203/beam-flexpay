import { SUB_MERCHANT_FIXTURES } from '../../sub-merchant/constants/subMerchant.fixture'
import {
  getSubMerchantById,
  useAllSubMerchants
} from '../../sub-merchant/hooks/useSubMerchants'
import type { SubMerchantRow } from '../../sub-merchant/types/subMerchant.type'

export const getCurrentSubMerchant = (id: string): SubMerchantRow | undefined =>
  getSubMerchantById(id) ?? SUB_MERCHANT_FIXTURES.find((row) => row.id === id)

export const useCurrentSubMerchants = (): readonly SubMerchantRow[] =>
  useAllSubMerchants()
