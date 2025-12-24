import { CardComponent } from '@components/common'
import { FormInput, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'


export const FormAdd = () => {
    const{control}=useForm()
    return (
        <div><CardComponent content={
            <>
            <form action="">
                <div className="flex flex-col gap-1">
                <FormInput label={ <span>Tên quyền <span className='text-red-700'>(*)</span> </span> } name='name'  control={control} placeholder='Tên quyền...'/>
                <FormTextArea label="Mô tả" name=''  control={control} placeholder='Mô tả...' />
                </div>
            </form>
            </>
        } /></div>
    )
}
