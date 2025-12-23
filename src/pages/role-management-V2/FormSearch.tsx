import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
    const {
        control
    } = useForm()
    return (
        <>
            <div className="flex">
                <form>
                    <FormInput control={control} name={'username '} />
                    <FormSelect control={control} name={'group '} options={[]} />
                    <FormSelect control={control} name={'status '} options={[]} />
                </form>
                <ButtonComponent content={"Tìm kiếm"}/>
                <ButtonComponent content={"Thêm mới"}/>
                <ButtonComponent content={"Bỏ lọc"}/>
            </div>
        </>
    )
}

export default FormSearch