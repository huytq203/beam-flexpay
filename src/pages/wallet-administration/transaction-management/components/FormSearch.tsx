import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormInputNumber, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { StatusType } from '../constants/Transaction.constant'
import { FormSearchValues } from '../types/Transaction.type'

interface props {
    handleSearch: (value: FormSearchValues) => void
}
const FormSearch = ({ handleSearch }: props) => {
    const formSearch = useForm<FormSearchValues>()
    const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
        handleSearch(data)
    }
    return (
        <div>
            <form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* <FormInput control={formSearch.control} name='' label='Tìm kiếm chung' className='col-span-1' placeholder='Tìm kiếm...'/> */}
                    {/* <FormInput control={formSearch.control} name='' label='Tài khoản (Gửi/Nhận)' className='col-span-1' placeholder='Nhập tài khoản'/> */}
                    <FormSelect control={formSearch.control} name='status' label='Trạng thái' className='col-span-1' options={mapEnumToSelectOptions(StatusType)} />
                    {/* <FormSelect control={formSearch.control} name='' label='Loại giao dịch' className='col-span-1' options={[]}/> */}
                    {/* <FormSelect control={formSearch.control} name='' label='Nhà cung cấp' className='col-span-1' options={[]}/> */}
                    {/* <FormSelect control={formSearch.control} name='' label='Phương thức thanh toán' className='col-span-1' options={[]}/> */}
                    {/* <FormSelect control={formSearch.control} name='' label='Ngân hàng' className='col-span-1' options={[]}/> */}
                    {/* <FormSelect control={formSearch.control} name='' label='Trạn thái hoàn tiền' className='col-span-1' options={[]}/> */}
                    {/* <FormInputNumber control={formSearch.control} name='' label='Khoảng tiền (min)' className='col-span-1' placeholder='Nhập số tiền...'/> */}
                    {/* <FormInputNumber control={formSearch.control} name='' label='Khoản tiền (max)' className='col-span-1' placeholder='Nhập số tiền...'/> */}
                    {/* <FormDatePicker isRange  control={formSearch.control} name='a' label='Thời gian tạo' className='col-span-1'/> */}
                    {/* <FormDatePicker isRange showTime control={formSearch.control} name='x' label='Thời gian TC' className='col-span-1'/> */}
                    <FormDatePicker  showTime control={formSearch.control} name='fromDate' label='Thời gian từ' className='col-span-1' />
                    <FormDatePicker  showTime control={formSearch.control} name='toDate' label='Thời gian đến' className='col-span-1' />
                </div>
                <div className="flex justify-end mt-3 gap-1" >
                    <ButtonComponent onClick={formSearch.handleSubmit(onSubmit)} icon={<MagnifyingGlassIcon size={18} />} content={'Tìm kiếm'} />
                    <ButtonComponent type='default' icon={<BroomIcon size={18} />} content={'Xóa lọc'} />
                </div>
            </form>
        </div>
    )
}

export default FormSearch