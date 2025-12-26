import { CardComponent } from '@components/common'
import { FormInput, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormAdd = () => {
    const { control } = useForm()
    return (
        <div>
            <CardComponent content={
                <>
                    <div className="flex flex-col gap-2">
                        <FormInput control={control} name='' label={<span>Tên nhóm quyền<span className='text-red-700'>(*)</span></span>} placeholder='Tên nhóm quyền...' />
                        <FormTextArea control={control} name='' label={'Mô tả'} placeholder='Mô tả...' />
                    </div>
                </>
            } />
        </div>
    )
}

export default FormAdd