import { ButtonComponent } from '@components/index'
import { useState, memo } from 'react'
import { useDeleteRoleMutation } from '@services/apiRole'
import { useMessage } from '@hooks/useMessage'

interface Props {
  roleId?: string
  roleName?: string
  onSuccess: () => void
  onCancel: () => void
}

const DialogDeleteRole = ({ roleId, roleName, onSuccess, onCancel }: Props) => {
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [deleteRole] = useDeleteRoleMutation()

  const handleDelete = async () => {
    if (!roleId) return
    setLoading(true)
    try {
      await deleteRole(roleId).unwrap()
      successMess('Xóa thành công')
      onSuccess()
    } catch (error: any) {
      errorMess(error?.data?.detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='mb-4'>
        <span>
          Bạn có chắc chắn muốn xóa nhóm quyền{' '}
          <span className='font-bold'>{roleName}</span> không? Hành động này không
          thể hoàn tác.
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

export default memo(DialogDeleteRole)
