import { FormSelect } from '@components/form'
import { CardComponent } from '@components/index'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import React from 'react'
import { useForm } from 'react-hook-form'
import InfoComponents from './InfoComponents'
import { baseOn, beneficiaryType, calculationMethodEnum, componentType, payerType, roundMode } from '@type/feePoliciesComponent'
import { FeeComponent } from '../fee-component-management/types/FeeComponent.types'
interface props{
    selectedRow:FeeComponent
}
const InforPolicy = ({selectedRow}:props) => {
    const { control } = useForm()
console.log(selectedRow)
    const selectOptions = {
        componentType: mapEnumToSelectOptions(componentType),
        baseOn: mapEnumToSelectOptions(baseOn),
        payerType: mapEnumToSelectOptions(payerType),
        beneficiaryType: mapEnumToSelectOptions(beneficiaryType),
        roundMode: mapEnumToSelectOptions(roundMode),
        calculationMethod: mapEnumToSelectOptions(calculationMethodEnum)
    }

    return (
        <div className='overflow-auto'>
            <CardComponent className='mb-3' style={{ width: '100%' }}
                content={<>
                    <p className='font-bold mb-1'>Thông tin chung</p>
                    <div className='grid grid-cols-12 gap-3 px-2'>
                        <FormSelect
                            control={control}
                            name='componentType'
                            label='Loại phí'
                            className='col-span-4 flex flex-col '

                            options={selectOptions.componentType}
                            placeholder='Chọn loại phí'
                            disabled={false}
                        />
                        <FormSelect
                            control={control}
                            name='baseOn'
                            label='Tính dựa trên'
                            className='col-span-4 flex flex-col'

                            options={!selectedRow?selectOptions.baseOn.slice(0,1):selectOptions.baseOn}
                            placeholder='Chọn loại tính phí'
                        />
                        <FormSelect
                            control={control}
                            name='payerType'
                            label='Người chịu'
                            className='col-span-4 flex flex-col'

                            options={selectOptions.payerType}
                            placeholder='Chọn người chịu phí'
                            disabled={false}
                        />
                        <FormSelect
                            control={control}
                            name='beneficiaryType'
                            label='Người hưởng'
                            className='col-span-4 flex flex-col'

                            options={selectOptions.beneficiaryType}
                            placeholder='Chọn người hưởng phí'
                        />
                        <FormSelect
                            control={control}
                            name='roundMode'
                            label='Công thức làm tròn'
                            className='col-span-4 flex flex-col'

                            options={selectOptions.roundMode}
                            placeholder='Chọn công thức làm tròn'
                        />

                        <FormSelect
                            control={control}
                            name='calculationMethod'
                            label='Chọn phương thức tính'
                            className='col-span-4 flex flex-col'
                            options={selectOptions.calculationMethod}
                            disabled={false}
                        />

                    </div>
                </>}
            >
            </CardComponent>

            <CardComponent content={<InfoComponents />} />

        </div>
    )
}

export default InforPolicy