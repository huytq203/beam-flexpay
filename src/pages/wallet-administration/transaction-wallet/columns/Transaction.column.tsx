import { UnifiedContentJournal } from "@type/apiResponseJournal";
import dayjs from "dayjs";
import { ColumnsType } from "antd/lib/table";
import { Link, NavigateFunction } from "react-router-dom";
import { ButtonComponent, TooltipComponent } from "@components/index";
import { EyeFilled } from "@components/icons";
import { CounterpartyType, CounterpartyTypeKey, PaymentMethodEnum,PaymentMethod, StatusKey, StatusType, TransactionKey, TransactionType } from "@pages/wallet-administration/transaction-wallet/constants/Transaction.constant";
import { formatNumber } from "@utils/index";

interface ColumnProps {
    navigate: NavigateFunction;
}

const TYPE_BADGE_CLASS: Record<string, string> = {
    USER: 'text-violet-700 bg-violet-50 border border-violet-300',
    MERCHANT: 'text-purple-700 bg-purple-50 border border-purple-300',
    BANK: 'text-yellow-700 bg-yellow-50 border border-yellow-300',
    SYSTEM: 'text-gray-600 bg-gray-100 border border-gray-300',
}

const PartyCell = ({ party }: { party?: UnifiedContentJournal['from'] }) => {
    if (!party) return <span>--</span>
    const typeLabel = CounterpartyType[party.type as CounterpartyTypeKey]?.label ?? party.type
    return (
        <div className="text-start">
            <p className="font-medium">{party.displayName || '--'}</p>
            {/* <p className="text-gray-500 text-xs">{party.username}</p> */}
            {/* <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_BADGE_CLASS[party.type] ?? 'text-gray-500 bg-gray-50 border border-gray-200'}`}>
                {typeLabel}
            </span> */}
        </div>
    )
}

const Column = ({ navigate }: ColumnProps): ColumnsType<UnifiedContentJournal> => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Thời gian',
        align: 'center',
        render(value, record) {
            return (
                <div className='text-start'>
                    <p>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    {record.postedAt && (
                        <p className="text-green-600 text-[12px]">TC: {dayjs(record.postedAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    )}
                    {record.archivedAt && (
                        <p className="text-red-600 text-[12px]">Lưu trữ: {dayjs(record.archivedAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Mã giao dịch',
        dataIndex: 'journalCode',
        align: 'center',
        render(value, record) {
            return (
                <div>
                    {record.journalCode ? (
                        <Link
                            to={`/transaction-management/transaction-wallet/${record.id}`}
                            className="text-blue-500 font-bold underline underline-offset-2"
                        >
                            {record.journalCode}
                        </Link>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Loại/Mô tả',
        dataIndex: 'transactionType',
        align: 'center',
        render(value, record) {
            const typeKey = record.transactionType as TransactionKey;
            return (
                <div className='text-start'>
                    <p className="font-medium">{TransactionType[typeKey] ?? record.transactionType ?? '--'}</p>
                    <p className="text-gray-500 text-sm">{record.description ?? '--'}</p>
                </div>
            )
        },
    },
    {
        title: 'Phương thức',
        dataIndex: 'paymentMethod',
        align: 'center',
        render(value, record) {
            const typeKey = record.paymentMethod as PaymentMethodEnum;
            return (
                <div className='text-start'>
                    <p className="font-medium">{PaymentMethod[typeKey] ?? record.paymentMethod ?? '--'}</p>
                </div>
            )
        },
    },
    {
        title: 'Người chuyển',
        align: 'center',
        render(value, record) {
            return <PartyCell party={record.from} />
        },
    },
    {
        title: 'Người nhận',
        align: 'center',
        render(value, record) {
            return <PartyCell party={record.to} />
        },
    },
    {
        title: 'Số tiền gốc',
        align: 'right',
        render(value, record) {
            return (
                <div className="text-right font-medium">
                    <p>{formatNumber(record.amount) + " " + record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Phí',
        align: 'right',
        render(value, record) {
            return (
                <div className="text-right text-gray-500">
                    <p>{formatNumber(record.feeAmount)+" "+record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Tổng',
        align: 'right',
        render(value, record) {
            const isDebit = record.transactionType === 'CASH_OUT' || record.transactionType === 'MERCHANT_PAYMENT'
            return isDebit ? (
                <div className="text-right font-medium text-red">
                    <p>-{formatNumber(record.grossAmount)+" "+record.currency}</p>
                </div>
            ) : (
                <div className="text-right font-medium text-green">
                    <p>+{formatNumber(record.grossAmount)+" "+record.currency}</p>
                </div>
            )
        },
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render(value, record) {
            const STATUS_CLASS: Record<string, string> = {
                PENDING: 'text-blue-600 rounded-md inline-block px-2 font-medium text-[12px] border border-blue-500 bg-blue-50',
                POSTED: 'text-green-700 rounded-md inline-block px-2 font-medium text-[12px] border border-green-500 bg-green-50',
                ARCHIVED: 'text-red-600 rounded-md inline-block px-2 font-medium text-[12px] border border-red-400 bg-red-50',
            };
            const typeKeyStatus = record.status as StatusKey
            return (
                <div className={STATUS_CLASS[typeKeyStatus] ?? 'text-gray-500'}>
                    {StatusType[typeKeyStatus] ?? record.status}
                </div>
            )
        },
    },
    {
        title: 'Thao tác',
        align: 'center',
        width: 80,
        render(value, record) {
            return (
                <div className="flex justify-center items-center gap-1">
                    <TooltipComponent title='Xem chi tiết'>
                        <ButtonComponent
                            onClick={() => navigate(`/transaction-management/transaction-wallet/${record.id}`)}
                            size='small'
                            className='bg-blue-50 !border border-blue-600 text-blue-600 hover:!bg-blue-100 hover:!text-blue-600'
                            icon={<EyeFilled />}
                        />
                    </TooltipComponent>
                </div>
            )
        },
    },
]
export default Column
