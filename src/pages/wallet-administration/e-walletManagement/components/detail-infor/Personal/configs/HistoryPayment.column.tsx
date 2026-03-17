import StatusBadge from '@components/status-badge/StatusBadge'
import { ColumnType } from 'antd/es/table'
import React from 'react'
import { StatusKey, TransactionType, TransactionKey, TransactionEnum, TransactionLabel, STATUS_CONFIG, BankLabel, BankEnum } from '../types/HistoryPayment.type'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'
import { TagComponent } from '@components/index'
import { TypographyText } from '@components/index'
import { UnifiedContentJournal } from '@type/apiResponseJournal'

export const getColumn = (): ColumnType<UnifiedContentJournal>[] => [
    {
        title: '#',
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
        dataIndex: 'transactionType',
        align: 'center',
        render: (value) => {
            const typesColor: Record<string, string> = {
                TRANSFER: 'blue',
                P2P_TRANSFER: 'cyan',
                WITHDRAW: 'red',
                DEPOSIT: 'green',
                CASH_OUT: 'red',
                CASH_IN: 'green',
            };
            return (
                <TagComponent color={typesColor[value as TransactionEnum] || 'default'} style={{ margin: 0, fontWeight: 500 }}>
                    {TransactionLabel[value as TransactionEnum]}
                </TagComponent>
            );
        },
    },
    {
        title: 'Người chuyển',
        dataIndex: 'from',
        align: 'left',
        render: (value) => <TypographyText strong>{BankLabel[value?.displayName as BankEnum]||value?.displayName}</TypographyText>
    },
    {
        title: 'Người nhận',
        dataIndex: 'to',
        align: 'left',
        render: (value) => <TypographyText strong >{BankLabel[value?.displayName as BankEnum]||value?.displayName}</TypographyText>
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
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
        title: 'Thời gian tạo',
        dataIndex: 'createdAt',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs.utc(value).local().format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Thời gian giao dịch',
        dataIndex: 'transactionTime',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs.utc(value).local().format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Thời gian thành công',
        dataIndex: 'processedAt',
        align: 'center',
        render: (value) => <TypographyText type="secondary">{dayjs.utc(value).local().format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render: (value) => <StatusBadge status={value as StatusKey}  config={STATUS_CONFIG}/>,
    },
]
