import { ColumnsType } from 'antd/es/table'
import { Controller, Control, UseFormGetValues } from 'react-hook-form'
import { InputNumber, ButtonComponent } from '@components/index'
import { CheckOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { FeeComponentType } from '@pages/fee-managerment-v3/schemas/FeeManagement.schema'
import { feePolicyComponent } from '@type/feePoliciesComponent'

interface TierColumnsOptions {
    control: Control<FeeComponentType>
    getValues: UseFormGetValues<FeeComponentType>
    onDeleteTier: (index: number, id?: string) => void
}

export const getTierColumns = ({
    control,
    getValues,
    onDeleteTier,
}: TierColumnsOptions): ColumnsType<any> => [
        {
            title: 'Phí Cố định',
            dataIndex: 'fixedAmount',
            key: 'fixedAmount',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.fixedAmount`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='0'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/,/g, '') as any}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Phí %',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.percentage`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='0'
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Từ (Min Value)',
            dataIndex: 'minFee',
            key: 'minFee',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.minFee`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='Min'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/,/g, '') as any}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Đến (Max Value)',
            dataIndex: 'maxFee',
            key: 'maxFee',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.maxFee`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='Max'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/,/g, '') as any}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Giá trị tối thiểu',
            dataIndex: 'minValue',
            key: 'minValue',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.minValue`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='Min'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/,/g, '') as any}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Giá trị tối đa',
            dataIndex: 'maxValue',
            key: 'maxValue',
            render: (_text, _record, index) => (
                <Controller
                    control={control}
                    name={`tiers.${index}.maxValue`}
                    render={({ field }) => (
                        <InputNumber
                            {...field}
                            placeholder='Max'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/,/g, '') as any}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Xóa',
            key: 'action',
            align: 'center',
            width: 100,
            render: (_, _record, index) => {
                const currentTier = getValues(`tiers.${index}`)
                const tierId = (currentTier as any)?.id

                return (
                    <div className='flex justify-center items-center gap-1'>
                        <ButtonComponent
                            type='text'
                            danger
                            icon={<DeleteOutlined {...({} as any)} />}
                            onClick={() => onDeleteTier(index, tierId)}
                        />
                        
                    </div>
                )
            }
        }
    ]
