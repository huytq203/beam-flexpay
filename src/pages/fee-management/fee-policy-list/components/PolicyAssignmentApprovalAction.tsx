import { useGetAssignmentsByPolicyQuery } from '@services/apiFeeAssignment'
import { FeeAssignmentApprovalAction } from '@components/index'

interface PolicyAssignmentApprovalActionProps {
  feePolicyId: string
  policyStatus: string
}

/**
 * Cầu nối giữa danh sách cấu hình phí mới và vòng đời duyệt riêng của bản gán.
 *
 * Backend chỉ cho duyệt bản gán khi chính sách cha đã ACTIVE. Màn mới vì vậy
 * hiện lần lượt hai hành động trong cùng một vị trí: duyệt chính sách trước,
 * rồi mới đến duyệt bản gán còn ở trạng thái INIT.
 */
export const PolicyAssignmentApprovalAction = ({
  feePolicyId,
  policyStatus
}: PolicyAssignmentApprovalActionProps) => {
  const canApproveAssignment = policyStatus === 'ACTIVE'
  const { data } = useGetAssignmentsByPolicyQuery(feePolicyId, {
    skip: !canApproveAssignment
  })

  if (!canApproveAssignment) return null

  const assignment = data?.find((item) => item.status === 'INIT')
  if (!assignment) return null

  return <FeeAssignmentApprovalAction assignment={assignment} />
}
