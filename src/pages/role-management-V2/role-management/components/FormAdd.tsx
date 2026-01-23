import { ButtonComponent, CardComponent } from '@components/index'
import { FormInput, FormTextArea } from '@components/form'
import { PermissionItem } from '@type/permissionManagement'
import { RoleDataItem } from '@type/roleManagementV2'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ModeAction } from '../hooks/useRoleManagement'

interface FormData {
  name: string
  roleName: string
  description: string
}

interface Props {
  modeAction: ModeAction
  selectedUser: RoleDataItem | undefined
  onSubmit?: (data: Omit<PermissionItem, 'id' | 'name'> | RoleDataItem) => Promise<void>
  onCancel?: () => void
}

const FormAdd = ({ modeAction, selectedUser, onSubmit, onCancel }: Props) => {
  const { control, reset, handleSubmit } = useForm<FormData>()

  useEffect(() => {
    if (modeAction === 'update' && selectedUser) {
      reset({
        name: selectedUser.name,
        description: selectedUser.description
      })
    } else if (modeAction === 'add') {
      reset({
        name: '',
        roleName: '',
        description: ''
      })
    }
  }, [modeAction, selectedUser, reset])

  const handleFormSubmit = async (data: FormData) => {
    if (onSubmit) {
      if (modeAction === 'update' && selectedUser) {
        const payload: Omit<PermissionItem, 'id' | 'name'> = {
          description: data.description
        }
        await onSubmit(payload)
      } else if (modeAction === 'add') {
        const payload: Omit<PermissionItem, 'id'> = {
          name: data.name,
          description: data.description
        }
        await onSubmit(payload)
      }
    }
  }

  return (
    <div>
      <CardComponent
        content={
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className='flex flex-col gap-2'>
              <FormInput
                control={control}
                name='name'
                label={
                  <span>
                    Mã quyền <span className='text-red-700'>(*)</span>
                  </span>
                }
                placeholder='Mã quyền...'
              />
              <FormInput
                control={control}
                name='roleName'
                label={
                  <span>
                    Tên quyền <span className='text-red-700'>(*)</span>
                  </span>
                }
                placeholder='Tên quyền...'
              />
              <FormTextArea
                control={control}
                name='description'
                placeholder='Mô tả...'
                label='Mô tả'
              />
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
              <ButtonComponent
                type='primary'
                content={modeAction === 'update' ? 'Cập nhật' : 'Thêm mới'}
                htmlType='submit'
              />
            </div>
          </form>
        }
      />
    </div>
  )
}

export default FormAdd
