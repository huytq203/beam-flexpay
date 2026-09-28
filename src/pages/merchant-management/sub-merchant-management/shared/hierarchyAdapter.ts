import type {
  ApiSubMerchant,
  ApiSubMerchantSummary
} from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

import type {
  SubMerchantRow,
  SubMerchantStatus
} from '../sub-merchant/types/subMerchant.type'

const toStatus = (source: ApiSubMerchantSummary): SubMerchantStatus =>
  source.status === 'INACTIVE' && source.lockSource === 'CASCADE'
    ? 'SUSPENDED_BY_PARENT'
    : source.status

export const toSubMerchantRow = (
  source: ApiSubMerchantSummary | ApiSubMerchant
): SubMerchantRow => ({
  id: source.id,
  code: source.code,
  name: source.name,
  parentMerchantId: source.merchantId,
  parentMerchantCode: source.merchantCode ?? '',
  parentMerchantName: source.merchantName ?? '',
  phone: source.phone?.value ?? '',
  isDefault: source.isDefault ?? false,
  status: toStatus(source),
  createdAt: formatUTCToLocalDateTime(source.createdAt) || '—'
})
