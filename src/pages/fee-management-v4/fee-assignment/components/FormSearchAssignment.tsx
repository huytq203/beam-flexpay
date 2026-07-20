import { FormSelect } from '@components/form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import React from 'react'
import { FeeBank, statusType } from '../constants/feeAssignment'
import { useGetBankQuery } from '@services/apiFeeBank'
import { Control } from 'react-hook-form'
import { FeeAssignType } from '../schemas/feeAssign.schema'
import * as Icons from '@components/icons'
interface FormSearchAssignmentProps {
    control: Control<FeeAssignType>
}

const FormSearchAssignment = ({ control }: FormSearchAssignmentProps) => {
    const { data: dataBank } = useGetBankQuery({})
    return (
        <>
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
            <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
                <FormSelect
                    control={control}
                    name='status'
                    options={mapEnumToSelectOptions(statusType)}
                    label={<span>Trạng thái </span>}
                />
                <FormSelect
                    control={control}
                    name='bankCode'
                    options={[
                        ...(dataBank?.data?.content || []).map((item: FeeBank) => ({
                            label: item.name,
                            value: item.code
                        }))
                    ]}
                    label={<span>Ngân hàng </span>}
                />
            </div>
        </>
    )
}

export default FormSearchAssignment