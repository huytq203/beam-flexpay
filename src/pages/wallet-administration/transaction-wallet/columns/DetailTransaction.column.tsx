import type { MoneyFlowEntry } from '@type/apiResponseJournal'
import { formatAccountingAccount } from '@pages/wallet-administration/transaction-wallet/utils/accountingAccountLabel'
import { formatCurrency } from '@utils/formatNumber'
import { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'

const Column = (currency = 'VND'): ColumnType<MoneyFlowEntry>[] => [
    {
        title: '#',
        dataIndex: 'sequence',
        align: 'center',
        width: 56
    },
    {
        title: 'Bước hạch toán',
        dataIndex: 'step',
        width: 220,
        render: (value: string | null) => value || '--'
    },
    {
        title: 'Tài khoản ghi nợ',
        dataIndex: 'debitAccount',
        width: 240,
        render: (value: string | null) => (
            <span className='break-words'>{formatAccountingAccount(value)}</span>
        )
    },
    {
        title: 'Tài khoản ghi có',
        dataIndex: 'creditAccount',
        width: 240,
        render: (value: string | null) => (
            <span className='break-words'>{formatAccountingAccount(value)}</span>
        )
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'right',
        width: 160,
        render: (value: number) => (
            <span className='whitespace-nowrap font-medium'>
                {formatCurrency(value, { symbol: currency, position: 'after' })}
            </span>
        )
    },
    {
        title: 'Thời điểm',
        dataIndex: 'occurredAt',
        align: 'center',
        width: 170,
        render: (value: string | null) =>
            value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '--'
    },
]

export default Column
