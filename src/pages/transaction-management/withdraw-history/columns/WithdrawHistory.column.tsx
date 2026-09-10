import { EyeFilled } from '@components/icons'
import { ButtonComponent, CopyableText, MaskText, TooltipComponent } from '@components/index'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import StatusBadge from '@components/status-badge/StatusBadge'
import { PaymentMethod, PaymentMethodKey, STATUS_CONFIG, StatusKey } from '../constants/WithdrawHistory.constant'
import { BankEnum, BankLabel } from '../constants/bank.constant'
import { UnifiedContentJournal } from '@/app/types/apiResponseJournal'
import { formatNumber } from '@/app/utils'
import { cn } from '@/app/utils/cn'

interface ColumnProps {
    onViewDetail: (id: string) => Promise<void>
    isDetailLoading: boolean
    loadingId: string | null
}

const getColumn = ({ onViewDetail, isDetailLoading, loadingId }: ColumnProps): ColumnsType<UnifiedContentJournal> => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 50,
    },
    {
        title: 'Mã giao dịch',
        align: 'center',
        render(_, record) {
            return (
                <div className="text-start">
                    <CopyableText value={record.transactionCode} />
                    <p className="text-gray-500 text-xs mt-0.5">{record.description ?? '--'}</p>
                </div>
            )
        },
    },
    {
        title: 'Người yêu cầu',
        align: 'center',
        render(_, record) {
            const from = record.from
            return (
                <div className="text-center">
                    <MaskText value={from?.displayName } />
                    {/* <p className="font-medium">{from?.displayName || from?.username || '--'}</p> */}
                    {/* <span className={`text-xs px-1.5 py-0.5 rounded-sm ${from?.type === 'USER' ? 'text-violet-700 bg-violet-50 border border-violet-300' : 'text-gray-500 bg-gray-50 border border-gray-200'}`}>
                        {from?.type ?? '--'}
                    </span> */}
                </div>
            )
        },
    },
    {
        title: 'Thụ hưởng',
        align: 'center',
        dataIndex: 'to',
        render(value, record) {
            return (
                <div className="text-start">
                    <p className="font-medium">{BankLabel[value?.displayName as BankEnum] || value?.displayName || '--'}</p>
                    {record.maskedAccount && (
                        <p className="mt-0.5 text-xs text-gray-500">
                            STK: {record.maskedAccount}
                        </p>
                    )}
                    {/* {record.bankCode && (
                        <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 px-1.5 py-0.5 rounded-sm">
                            {record.bankCode}
                        </span>
                    )} */}
                </div>
            )
        },
    },
    {
        title: 'Số tiền rút',
        align: 'right',
        render(_, record) {
            return (
                <div className="text-right font-medium text-red-600">
                    <p>-{formatNumber(record.amount)} {record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Phí',
        align: 'right',
        render(_, record) {
            return (
                <div className="text-right text-gray-500">
                    <p>{formatNumber(record.feeAmount)} {record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Tổng',
        align: 'right',
        render(_, record) {
            return (
                <div className="text-right font-bold text-red-600">
                    <p>-{formatNumber(record.grossAmount)} {record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Phương thức',
        dataIndex: 'paymentMethod',
        align: 'center',
        render(value: string) {
            return (
                <span className="text-[12px] px-2 py-0.5 rounded-sm bg-gray-100 border border-gray-300 text-gray-700 font-medium">
                    {PaymentMethod[value as PaymentMethodKey] ?? '--'}
                </span>
            )
        },
    },
    {
        title: 'Thời gian',
        align: 'center',
        render(_, record) {
            return (
                <div className="text-start text-[12px]">
                    <p>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                    {record.postedAt && (
                        <p className="text-green-600">TC: {dayjs(record.postedAt).format('DD/MM/YYYY HH:mm')}</p>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render(value) {
            return (
                <div>
                    <StatusBadge className={cn(value == StatusKey.PENDING && 'animate-pulse-soft')} status={value as StatusKey} config={STATUS_CONFIG} />
                </div>
            )
        },
    },
    {
        title: 'Thao tác',
        align: 'center',
        width: 100,
        render(_, record) {
            return (
                <div className="flex justify-center items-center">
                    <TooltipComponent title='Xem chi tiết'>
                        <ButtonComponent
                            onClick={() => void onViewDetail(record.id)}
                            loading={loadingId === record.id}
                            disabled={isDetailLoading}
                            size='small'
                            type='default'
                            icon={<EyeFilled />}
                        />
                    </TooltipComponent>
                </div>
            )
        },
    },
]

export default getColumn
