import { ButtonComponent } from '@components/index'
import { FormField, FormInput, FormSelect } from '@components/form'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
    const formSearch = useForm()
    const {svg}=useSVG()
    return (
        <div>
            <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                    <FormInput control={formSearch.control} name='' label='Từ khóa' />
                </div>
                <div className="col-span-1">
                    <FormSelect control={formSearch.control} name='' options={[]} label='Trạng thái ví'/>
                </div>
                <div className="col-span-1">
                     <FormSelect control={formSearch.control} name='' options={[]} label='Trạng thái KYC'/>
                </div>
                <div className="col-span-1 flex items-end">
                  <ButtonComponent className='w-full' content='Tìm kiếm'icon={svg('/icons.svg#hugeicons-search-01')}/>
                </div>
                
            </div>
        </div>
    )
}

export default FormSearch