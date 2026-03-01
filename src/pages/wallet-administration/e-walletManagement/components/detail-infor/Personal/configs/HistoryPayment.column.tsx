import StatusBadge from '@components/status-badge/StatusBadge'
import { ColumnType } from 'antd/es/table'
import React from 'react'
import { StatusKey, TransactionType, TransactionKey } from '../types/HistoryPayment.type'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'
import { TagComponent } from '@components/index'
import { TypographyText } from '@components/index'

export const Column = (): ColumnType[] => [
    {
        title: 'STT',
        dataIndex: 'no',
        align: 'center',
        width: 60,
    },
    {
        title: 'Mã giao dịch',
        dataIndex: 'transactionCode',
        align: 'center',
        render: (value) => (
            <TypographyText copyable={{ text: value }} strong style={{ color: '#595959' }}>
                {value}
            </TypographyText>
        )
    },
    {
        title: 'Loại giao dịch',
        dataIndex: 'type',
        align: 'center',
        render: (value) => {
            const typesColor: Record<string, string> = {
                WALLET_CREDIT: 'blue',
                WALLET_TRANSFER: 'cyan',
                DEBIT: 'red',
                CREDIT: 'green',
            };
            return (
                <TagComponent color={typesColor[value as string] || 'default'} style={{ margin: 0, fontWeight: 500 }}>
                    {TransactionType[value as TransactionKey]}
                </TagComponent>
            );
        },
    },
    {
        title: 'Tổng số tiền',
        dataIndex: 'grossAmount',
        align: 'right',
        render: (value, record) => (
            <TypographyText strong>
                {formatNumber(value)} <TypographyText type="secondary" style={{ fontSize: '12px' }}>{record?.currency || 'VND'}</TypographyText>
            </TypographyText>
        ),
    },
    {
        title: 'Số tiền thực tế',
        dataIndex: 'netAmount',
        align: 'right',
        render: (value, record) => (
            <TypographyText strong style={{ color: '#2bd9d0', fontSize: '15px' }}>
                {formatNumber(value)} <TypographyText type="secondary" style={{ fontSize: '12px' }}>{record?.currency || 'VND'}</TypographyText>
            </TypographyText>
        ),
    },
    {
        title: 'Phí giao dịch',
        dataIndex: 'feeAmount',
        align: 'right',
        render: (value, record) => (
            <TypographyText type="danger" strong>
                {formatNumber(value)} <TypographyText type="secondary" style={{ fontSize: '12px' }}>{record?.currency || 'VND'}</TypographyText>
            </TypographyText>
        ),
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'right',
        render: (value, record) => (
            <TypographyText strong>
                {formatNumber(value)} <TypographyText type="secondary" style={{ fontSize: '12px' }}>{record?.currency || 'VND'}</TypographyText>
            </TypographyText>
        ),
    },
    {
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Thời gian giao dịch',
        dataIndex: 'transactionTime',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Thời gian thành công',
        dataIndex: 'processedAt',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (value) => <StatusBadge status={value as StatusKey} />,
    },
]
