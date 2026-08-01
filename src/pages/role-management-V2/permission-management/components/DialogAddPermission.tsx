import { ButtonComponent } from '@components/index'
import { FormInput, FormTextArea } from '@components/form'
import { useEffect, useState, memo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PermissionFormData, PermissionSchema } from '../schema/Permission.schema'
import { usePostPermissionMutation, usePutPermissionMutation } from '@services/apiPermission'
import { useMessage } from '@hooks/useMessage'
import { SelectedPermission } from '../types/PermissionManagement.type'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'

interface Props {
  permission?: SelectedPermission | null
  onSuccess: () => void
  onCancel: () => void
}

const DialogAddPermission = ({ permission, onSuccess, onCancel }: Props) => {
  const isEdit = !!permission
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)

  const [postPermission] = usePostPermissionMutation()
  const [putPermission] = usePutPermissionMutation()

  const { control, handleSubmit, reset } = useForm<PermissionFormData>({
    resolver: zodResolver(PermissionSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', description: '' }
  })

  useEffect(() => {
    if (permission) {
      reset({
        name: permission.name,
        description: permission.description ?? ''
      })
    } else {
      reset({ name: '', description: '' })
    }
  }, [permission, reset])

  const onSubmit = async (data: PermissionFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await putPermission({
          permissionName: permission!.name,
          body: { description: data.description }
        }).unwrap()
        successMess('Cập nhật quyền thành công')
      } else {
        await postPermission({
          name: data.name,
          description: data.description
        }).unwrap()
        successMess('Thêm quyền thành công')
      }
      onSuccess()
    } catch (error) {
      errorMess(getApiErrorDetail(error) || 'Không thể lưu quyền')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col gap-3'>
        <FormInput
          control={control}
          name='name'
          disabled={isEdit}
          label={
            <span>
              Mã quyền <span className='text-red-700'>*</span>
            </span>
          }
          placeholder='Ví dụ: ROLE:VIEW'
        />
        <FormTextArea
          control={control}
          name='description'
          placeholder='Nhập mô tả quyền...'
          label='Mô tả'
        />
      </div>
      <div className='mt-4 flex justify-end gap-2'>
        <ButtonComponent
          type='default'
          content='Hủy'
          htmlType='button'
          onClick={onCancel}
        />
        <ButtonComponent
          type='primary'
          content={isEdit ? 'Cập nhật' : 'Thêm mới'}
          htmlType='submit'
          loading={loading}
        />
      </div>
    </form>
  )
}

export default memo(DialogAddPermission)
