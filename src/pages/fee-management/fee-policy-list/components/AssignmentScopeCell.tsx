import { useGetAssignmentsByPolicyQuery } from '@services/apiFeeAssignment'

interface AssignmentScopeCellProps {
  feePolicyId: string
}

/**
 * Phạm vi của chính sách: một người dùng, một đơn vị, hay áp chung.
 *
 * Đọc từ bản gán vì chính sách không mang thông tin này. Gọi theo từng dòng nên
 * bảng giữ số dòng nhỏ; đổi trang là bộ nhớ đệm của RTK Query trả lại ngay.
 */
export const AssignmentScopeCell = ({ feePolicyId }: AssignmentScopeCellProps) => {
  const { data, isLoading } = useGetAssignmentsByPolicyQuery(feePolicyId)

  if (isLoading) {
    return <span className='inline-block h-4 w-20 animate-pulse rounded bg-muted' />
  }

  const assignment = data?.[0]
  if (!assignment) {
    return <span className='text-[13px] text-muted-foreground'>Chưa gán</span>
  }

  if (assignment.subjectId) {
    return (
      <span className='inline-flex w-fit items-center rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground'>
        Một người dùng
      </span>
    )
  }

  if (assignment.merchantId) {
    return (
      <span className='inline-flex w-fit items-center rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground'>
        Một đơn vị
      </span>
    )
  }

  return <span className='text-[13px] text-muted-foreground'>Áp chung</span>
}
