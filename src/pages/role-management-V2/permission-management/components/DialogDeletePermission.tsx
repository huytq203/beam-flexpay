import { ButtonComponent } from '@components/index'
import { useState, memo } from 'react'
import { useDeletePermissionMutation } from '@services/apiPermission'
import { useMessage } from '@hooks/useMessage'

interface Props {
  permissionName?: string
  onSuccess: () => void
  onCancel: () => void
}

const DialogDeletePermission = ({ permissionName, onSuccess, onCancel }: Props) => {
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [deletePermission] = useDeletePermissionMutation()

  const handleDelete = async () => {
    if (!permissionName) return
    setLoading(true)
    try {
      await deletePermission(permissionName).unwrap()
      successMess('Xóa quyền thành công')
      onSuccess()
    } catch {
      errorMess('Không thể xóa quyền. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className='mb-4'>
        Bạn có chắc chắn muốn xóa quyền{' '}
        <span className='font-semibold'>{permissionName}</span>? Hành động này
        không thể hoàn tác.
      </p>
      <div className='flex items-center justify-end gap-2'>
        <ButtonComponent
          type='default'
          content='Hủy'
          onClick={onCancel}
        />
        <ButtonComponent
          type='primary'
          danger
          content='Xóa'
          onClick={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default memo(DialogDeletePermission)
