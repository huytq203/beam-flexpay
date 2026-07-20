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
      successMess('Xóa thành công')
      onSuccess()
    } catch {
      // errorMess(getApiErrorDetail(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='mb-4'>
        <span>
          Bạn có chắc chắn muốn <span className='font-bold'>xóa quyền</span>{' '}
          <span className='font-bold'>{permissionName}</span> không? Hành động này
          không thể hoàn tác.
        </span>
      </div>
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent
          type='primary'
          danger
          content='Delete'
          onClick={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default memo(DialogDeletePermission)
