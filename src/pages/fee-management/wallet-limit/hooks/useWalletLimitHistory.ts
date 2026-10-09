import { useState } from 'react'
import {
  useGetWalletLimitHistoryQuery,
  useGetWalletLimitPolicyQuery
} from '@services/apiWalletLimit'
import {
  SCOPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  WALLET_LIMIT_HISTORY_PAGE_SIZE
} from '../constants/walletLimit.constants'
import { describePolicyTarget } from '../utils/walletLimit.paths'

/** Lịch sử phân trang server: `page` 1-based, chỉ dùng `totalElements`. */
export const useWalletLimitHistory = (id: string) => {
  const [page, setPage] = useState(1)
  const size = WALLET_LIMIT_HISTORY_PAGE_SIZE
  const query = useGetWalletLimitHistoryQuery({ id, page, size }, { skip: !id })
  // Chỉ để dựng nhãn breadcrumb; dùng chung cache với màn Chi tiết.
  const { data: policy } = useGetWalletLimitPolicyQuery(id, { skip: !id })

  return {
    page,
    size,
    setPage,
    query,
    rows: query.data?.content ?? [],
    total: query.data?.totalElements ?? 0,
    policyTitle: policy
      ? describePolicyTarget(
          SCOPE_LABELS[policy.scopeType],
          policy.targetDisplay,
          TRANSACTION_TYPE_LABELS[policy.transactionType]
        )
      : 'Chi tiết'
  }
}
