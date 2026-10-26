import { useGetMerchantAssignmentsQuery } from '@/app/services/merchantAssignmentApi'
import type { AssignmentScope } from '../types/merchantAssignment.types'

/** Chưa chọn phạm vi thì bỏ qua truy vấn: BE trả 500 khi `id` rỗng. */
export function useAssignmentList(scope?: AssignmentScope) {
  const query = useGetMerchantAssignmentsQuery(
    { level: scope?.level ?? 'master', id: scope?.id ?? '' },
    { skip: !scope }
  )
  return { query, rows: query.data ?? [] }
}
