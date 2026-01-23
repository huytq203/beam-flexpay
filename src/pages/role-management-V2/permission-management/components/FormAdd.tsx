import { ButtonComponent, CardComponent } from '@components/index'
import { FormInput, FormTextArea } from '@components/form'
import { DataRoleItem } from '@type/roleManagement'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface FormData {
  name: string
  description: string
}

interface Props {
  onSubmit?: (data: Omit<DataRoleItem, 'id'> | DataRoleItem) => Promise<void>
  onCancel?: () => void
  defaultValues?: { name: string; description: string } | null
  isEdit?: boolean
}

const FormAdd = ({ onSubmit, onCancel, defaultValues, isEdit = false }: Props) => {
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: ''
    }
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        description: defaultValues.description || ''
      })
    }
  }, [defaultValues, reset])

  const handleSubmitForm = async (data: FormData) => {
    if (onSubmit) {
      const payload: Omit<DataRoleItem, 'id'> = {
        name: data.name,
        description: data.description
      }
      await onSubmit(payload)
    }
  }

  return (
    <div>
      <CardComponent
        content={
          <form onSubmit={handleSubmit(handleSubmitForm)}>
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
                // disabled={isEdit}
              />
              <FormTextArea
                control={control}
                name='description'
                label='Mô tả'
                placeholder='Mô tả...'
              />
              <div className='flex justify-end gap-2 mt-4'>
                <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
                <ButtonComponent type='primary' content={isEdit ? 'Cập nhật' : 'Thêm'} htmlType='submit' />
              </div>
            </div>
          </form>
        }
      />
    </div>
  )
}

export default FormAdd

