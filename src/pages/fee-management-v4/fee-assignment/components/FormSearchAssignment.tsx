import { FormSelect } from '@components/form'
import * as Icons from '@components/icons'
import { useGetBankQuery } from '@services/apiFeeBank'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { Control } from 'react-hook-form'
import { FeeBank, statusType } from '../constants/feeAssignment'
import { FeeAssignType } from '../schemas/feeAssign.schema'

/**
 * Chỉ khai các bộ lọc `/fee/policy-assignments/search` thực sự nhận:
 * feePolicyId, merchantId, bankCode, status. Không có `serviceType` — muốn lọc
 * gán phí theo chiều tiền thì BE phải bổ sung tham số đó trước.
 */
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
                    name='bankCode'
                    options={[
                        ...(dataBank?.data?.content || []).map((item: FeeBank) => ({
                            label: item.name,
                            value: item.code
                        }))
                    ]}
                    label={<span>Ngân hàng </span>}
                    placeholder='Tất cả ngân hàng'
                    className='col-span-12 md:col-span-6 flex flex-col'
                />
                <FormSelect
                    control={control}
                    name='status'
                    options={mapEnumToSelectOptions(statusType)}
                    label={<span>Trạng thái </span>}
                    placeholder='Tất cả trạng thái'
                    className='col-span-12 md:col-span-6 flex flex-col'
                />
            </div>
        </>
    )
}

export default FormSearchAssignment
