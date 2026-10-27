import {
  useGetMerchantAssignmentsQuery,
  useGetMyAssignmentAccessQuery
} from '@/app/services/merchantAssignmentApi'
import type { AssignmentScope } from '../types/merchantAssignment.types'

/**
 * Chưa chọn phạm vi thì bỏ qua truy vấn: BE trả 500 khi `id` rỗng. Ở Sub lấy cả
 * người được gán qua Master (`inheritedFromMaster`) để thấy đủ ai đang phụ trách.
 */
export function useAssignmentList(scope?: AssignmentScope) {
  const query = useGetMerchantAssignmentsQuery(
    {
      level: scope?.level ?? 'master',
      id: scope?.id ?? '',
      includeInherited: scope?.level === 'sub'
    },
    { skip: !scope }
  )
  const access = useGetMyAssignmentAccessQuery()
  const rows = query.data ?? []
  return {
    query,
    rows,
    /** Chỉ dòng gán trực tiếp ở đúng cấp đang xem mới gỡ/gán trùng được. */
    directRows: rows.filter((row) => !row.inheritedFromMaster),
    // Hỏi `/me` lỗi thì không chặn: BE vẫn kiểm quyền ở endpoint ghi.
    canManage: access.data?.canManageAssignments ?? true
  }
}
