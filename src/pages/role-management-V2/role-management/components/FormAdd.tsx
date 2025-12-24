import { CardComponent } from '@components/common'
import { FormInput } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormAdd = () => {
  const { control } = useForm()
  return (
    <div>
      <CardComponent
        content={
          <>
            <div className='flex flex-col gap-2'>
              <FormInput
                control={control}
                name=''
                label={
                  <span>
                    Mã quyền <span className='text-red-700'>(*)</span>
                  </span>
                }
                placeholder='Mã quyền...'
              />
              <FormInput
                control={control}
                name=''
                label={
                  <span>
                    Tên quyền <span className='text-red-700'>(*)</span>
                  </span>
                }
                placeholder='Tên quyền...'
              />
            </div>
          </>
        }
      />
    </div>
  )
}

export default FormAdd
