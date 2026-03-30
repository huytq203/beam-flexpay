import { ColumnType } from 'antd/es/table'
import React from 'react'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'
import { ButtonComponent, TypographyText } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { FreezeStatus, FreezeStatusConfig } from '../types/Freeze.type'
import { cn } from '@utils/cn'

interface ColumnProps {
    onRelease?: (record: any) => void
}

export const getColumn = ({ onRelease }: ColumnProps): ColumnType[] => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 60,
    },
    // {
    //     title: 'Mã đóng băng',
    //     dataIndex: 'id',
    //     align: 'center',
    //     render: (value) => (
    //         <TypographyText copyable={{ text: value }} strong style={{ color: '#595959' }}>
    //             {value}
    //         </TypographyText>
    //     )
    // },
    // {
    //     title: 'Mã GD gốc',
    //     dataIndex: 'idempotencyKey',
    //     align: 'center',
    //     render: (value) => {
    //         if (!value) return '--'
    //         return (
    //             <TypographyText copyable={{ text: value }} strong style={{ color: '#595959' }}>
    //                 {value}
    //             </TypographyText>
    //         )
    //     }
    // },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'right',
        width: 200,
        render: (value) => (
            <TypographyText strong>
                {formatNumber(value)} <TypographyText type="secondary" style={{ fontSize: '12px' }}>VND</TypographyText>
            </TypographyText>
        ),
    },
    {
        title: 'Lý do đóng băng',
        dataIndex: 'reason',
        align: 'left',
        width:250,
        render: (value) => {
            if (!value) return '--'
            return (
                <span className='inline-block max-w-[250px]'>{value}</span>
            )
        }
    },
    {
        title: 'Lý do giải tỏa',
        dataIndex: 'unfreezeReason',
        align: 'left',
        width:250,
        render: (value) => {
            if (!value) return '--'
            return (
                <span className='inline-block max-w-[250px]'>{value}</span>
            )
        }
    },
    {
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        align: 'center',
        width: 200,
        render: (value) => value ? <span className='inline-block max-w-[200px]'>{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</span> : '--'
    },
    {
        title: 'Thời gian cập nhật',
        dataIndex: 'updatedAt',
        width: 200,
        align: 'center',
        render: (value) => value ? <span className='inline-block max-w-[200px]'>{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</span> : '--'
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        width: 100,
        render: (value) => <StatusBadge className={cn(value==FreezeStatus.ACTIVE&&'animate-pulse-soft')} status={value as FreezeStatus} config={FreezeStatusConfig} />,
    },
    {
        title: 'Thao tác',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        render: (_, record) => {
            const canRelease = record.status === 'ACTIVE'
            return (
                <ButtonComponent
                    size="small"
                    disabled={!canRelease}
                    onClick={() => canRelease && onRelease?.(record)}
                    className={`bg-blue-50 border border-blue-600 text-blue-600 ${canRelease
                        ? 'hover:!bg-blue-100 hover:!text-blue-700'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                    content="Mở băng"
                />
            )
        },
    },
]
