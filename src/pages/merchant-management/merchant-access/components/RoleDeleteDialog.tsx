import {
  useDeleteMerchantGroupMutation,
  useListMerchantGroupUsersQuery
} from '@/app/services/merchantAccessApi'
import { DialogModal, feedback } from '@components/index'

import type { MerchantRole } from '../types/merchantAccess.types'
import { MerchantNameText } from './MerchantNameText'

interface Props {
  role: MerchantRole
  onClose: () => void
}

export function RoleDeleteDialog({ role, onClose }: Props) {
  const assignedUsersQuery = useListMerchantGroupUsersQuery({
    id: role.id,
    page: 1,
    size: 1
  })
  const [deleteGroup, { isLoading }] = useDeleteMerchantGroupMutation()
  const assignedCount = assignedUsersQuery.data?.totalElements ?? 0
  const blocked =
    assignedUsersQuery.isFetching ||
    assignedUsersQuery.isError ||
    assignedCount > 0

  const remove = async (): Promise<void> => {
    try {
      await deleteGroup(role.id).unwrap()
      feedback.success('Đã xóa nhóm quyền')
      onClose()
    } catch {
      feedback.error('Không thể xóa nhóm quyền')
    }
  }

  return (
    <DialogModal
      onCancel={onClose}
      onOk={() => void remove()}
      okButtonProps={{ disabled: blocked, loading: isLoading }}
      okText='Xóa nhóm quyền'
      open
      title='Xóa nhóm quyền'
    >
      <p className='text-sm'>
        Xóa nhóm <strong>{role.name}</strong>{' '}
        {role.merchantId ? (
          <>
            của <MerchantNameText merchantId={role.merchantId} />
          </>
        ) : (
          'dùng chung toàn hệ thống'
        )}
        ?
      </p>
      {assignedCount > 0 && (
        <p className='mt-2 text-sm text-danger-strong'>
          Nhóm đang được gán cho {assignedCount} User. Hãy gỡ khỏi User trước
          khi xóa.
        </p>
      )}
      {assignedUsersQuery.isError && (
        <p className='mt-2 text-sm text-danger-strong'>
          Không thể kiểm tra User trong nhóm. Vui lòng thử lại.
        </p>
      )}
    </DialogModal>
  )
}
