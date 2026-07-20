import { ColumnsType } from 'antd/es/table'
import { Controller, Control, FieldArrayWithId, UseFormGetValues } from 'react-hook-form'
import { InputNumber, ButtonComponent } from '@components/index'
import { DeleteOutlined } from '@ant-design/icons'
import { FeeComponentType } from '@pages/fee-management-v4/fee-management/schemas/FeeManagement.schema'

export type TierRow = FieldArrayWithId<FeeComponentType, 'tiers'>

interface TierColumnsOptions {
    control?: Control<FeeComponentType>
    getValues?: UseFormGetValues<FeeComponentType>
    onDeleteTier?: (index: number, id?: string) => void
}

export const getTierColumns = ({
    control,
    getValues,
    onDeleteTier,
}: TierColumnsOptions): ColumnsType<TierRow> => [
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
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
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
            title: 'Giá trị giao dịch từ',
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
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Giá trị giao dịch đến',
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
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Số tiền phí tối thiểu',
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
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
                            style={{ width: '100%' }}
                        />
                    )}
                />
            )
        },
        {
            title: 'Số tiền phí tối đa',
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
                            parser={(value) => value?.replace(/,/g, '') ?? ''}
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
                const currentTier = getValues?.(`tiers.${index}`)
                // `id` is present at runtime on tiers loaded from the API, but is not
                // part of the zod schema, so narrow it explicitly instead of casting.
                const tierId =
                    currentTier && 'id' in currentTier && typeof currentTier.id === 'string'
                        ? currentTier.id
                        : undefined

                return (
                    <div className='flex justify-center items-center gap-1'>
                        <ButtonComponent
                            type='text'
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDeleteTier?.(index, tierId)}
                        />

                    </div>
                )
            }
        }
    ]
