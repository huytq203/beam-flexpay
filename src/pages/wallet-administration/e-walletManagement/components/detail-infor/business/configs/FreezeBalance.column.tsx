import { ColumnType } from 'antd/es/table'
import React from 'react'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'
import { ButtonComponent, TypographyText } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { FreezeStatus, FreezeStatusConfig } from '../../Personal/types/Freeze.type'

interface ColumnProps {
    onRelease?: (record: any) => void
}

export const Column = ({ onRelease }: ColumnProps): ColumnType[] => [
    {
        title: 'STT',
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
        render: (value) => value || '--'
    },
    {
        title: 'Lý do giải tỏa',
        dataIndex: 'unfreezeReason',
        align: 'left',
        render: (value) => value || '--'
    },
    {
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        align: 'center',
        render: (value) => value ? <TypographyText type="secondary">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText> : '--'
    },
    {
        title: 'Thời gian cập nhật',
        dataIndex: 'updatedAt',
        align: 'center',
        render: (value) => value ? <TypographyText type="secondary">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText> : '--'
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (value) => <StatusBadge status={value as FreezeStatus} config={FreezeStatusConfig} />,
    },
    {
        title: 'Thao tác',
        dataIndex: 'action',
        align: 'center',
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
