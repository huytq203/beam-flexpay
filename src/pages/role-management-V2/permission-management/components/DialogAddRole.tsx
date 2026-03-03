import { ButtonComponent, CardComponent } from '@components/index'
import { FormInput, FormTextArea } from '@components/form'
import { useEffect, useState, memo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PermissionRoleSchema, PermissionRoleFormData } from '../schemas/Permission.schema'
import { usePostRoleMutation, usePutRoleMutation } from '@services/apiRole'
import { useMessage } from '@hooks/useMessage'
import { SelectedRole } from '../types/PermissionManagement.type'

interface Props {
  role?: SelectedRole | null
  onSuccess: () => void
  onCancel: () => void
}

const DialogAddRole = ({ role, onSuccess, onCancel }: Props) => {
  const isEdit = !!role
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)

  const [postRole] = usePostRoleMutation()
  const [putRole] = usePutRoleMutation()

  const { control, handleSubmit, reset } = useForm<PermissionRoleFormData>({
    resolver: zodResolver(PermissionRoleSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', description: '' }
  })

  useEffect(() => {
    if (role) {
      reset({ name: role.name || '', description: role.description || '' })
    } else {
      reset({ name: '', description: '' })
    }
  }, [role, reset])

  const onSubmit = async (data: PermissionRoleFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await putRole({
          id: role!.id,
          body: { name: data.name, description: data.description }
        }).unwrap()
        successMess('Cập nhật nhóm quyền thành công')
      } else {
        await postRole({
          name: data.name,
          description: data.description
        }).unwrap()
        successMess('Thêm nhóm quyền thành công')
      }
      onSuccess()
    } catch (error: any) {
      errorMess(error?.data?.detail)
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
                  Tên nhóm quyền<span className='text-red-700'>(*)</span>
                </span>
              }
              placeholder='Tên nhóm quyền...'
            />
            <FormTextArea
              control={control}
              name='description'
              label='Mô tả'
              placeholder='Mô tả...'
            />
            <div className='flex justify-end gap-2 mt-4'>
              <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
              <ButtonComponent
                type='primary'
                content={isEdit ? 'Cập nhật' : 'Thêm'}
                htmlType='submit'
                loading={loading}
              />
            </div>
          </div>
        </form>
      }
    />
  )
}

export default memo(DialogAddRole)
