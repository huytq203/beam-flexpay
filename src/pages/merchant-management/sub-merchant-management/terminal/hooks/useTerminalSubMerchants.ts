import {
  getSubMerchantById,
  useAllSubMerchants
} from '../../sub-merchant/hooks/useSubMerchants'
import type { SubMerchantRow } from '../../sub-merchant/types/subMerchant.type'

export const getCurrentSubMerchant = (id: string): SubMerchantRow | undefined =>
  getSubMerchantById(id)

export const useCurrentSubMerchants = (): readonly SubMerchantRow[] =>
  useAllSubMerchants()
