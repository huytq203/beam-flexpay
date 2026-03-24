import { ButtonComponent, CardComponent } from '@components/index'
import { FormInput, FormTextArea } from '@components/form'
import { useEffect, useState, memo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RoleManagementSchema, RoleManagementFormData } from '../schema/role-management.schema'
import { usePostPermissionMutation, usePutPermissionMutation } from '@services/apiPermission'
import { useMessage } from '@hooks/useMessage'
import { SelectedPermission } from '../types/RoleManagement.type'

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

  const { control, handleSubmit, reset } = useForm<RoleManagementFormData>({
    resolver: zodResolver(RoleManagementSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', description: '' }
  })

  useEffect(() => {
    if (permission) {
      reset({ name: permission.name, description: permission.description })
    } else {
      reset({ name: '', description: '' })
    }
  }, [permission, reset])

  const onSubmit = async (data: RoleManagementFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await putPermission({
          permissionName: permission!.name,
          body: { description: data.description }
        }).unwrap()
        successMess('Sửa thành công')
      } else {
        await postPermission({
          name: data.name,
          description: data.description
        }).unwrap()
        successMess('Thêm thành công')
      }
      onSuccess()
    } catch (error: any) {
      // errorMess(error?.data?.detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardComponent
      content={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-2'>
            <FormInput
              control={control}
              name='name'
              label={
                <span>
                  Mã quyền <span className='text-red-700'>*</span>
                </span>
              }
              placeholder='Mã quyền...'
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
              content={isEdit ? 'Cập nhật' : 'Thêm mới'}
              htmlType='submit'
              loading={loading}
            />
          </div>
        </form>
      }
    />
  )
}

export default memo(DialogAddPermission)
