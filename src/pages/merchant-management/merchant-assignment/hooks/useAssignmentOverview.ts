import { useState } from 'react'
import { useListMerchantAssignmentsQuery } from '@/app/services/merchantAssignmentApi'
import type { AssignmentListLevel } from '@/app/services/merchantAssignmentApi'

export interface OverviewFilters {
  search: string
  level?: AssignmentListLevel
}

const EMPTY: OverviewFilters = { search: '' }

/** Danh sách mọi dòng gán trong phạm vi của người xem; BE xếp cố định nên không có sort. */
export function useAssignmentOverview() {
  const [draft, setDraft] = useState<OverviewFilters>(EMPTY)
  const [applied, setApplied] = useState<OverviewFilters>(EMPTY)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const query = useListMerchantAssignmentsQuery({
    page,
    size: pageSize,
    search: applied.search.trim() || undefined,
    level: applied.level
  })

  return {
    query,
    draft,
    setDraft,
    page,
    pageSize,
    apply: (): void => {
      setApplied(draft)
      setPage(1)
    },
    reset: (): void => {
      setDraft(EMPTY)
      setApplied(EMPTY)
      setPage(1)
    },
    paginate: (nextPage: number, nextSize: number): void => {
      setPage(nextSize !== pageSize ? 1 : nextPage)
      setPageSize(nextSize)
    }
  }
}
