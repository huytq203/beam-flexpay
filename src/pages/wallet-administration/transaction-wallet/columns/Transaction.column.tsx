import { UnifiedContentJournal } from "@type/apiResponseJournal";
import dayjs from "dayjs";
import { ColumnsType } from "antd/lib/table";
import { Link, NavigateFunction } from "react-router-dom";
import { ButtonComponent, MaskText, TagComponent, TooltipComponent, TypographyText } from "@components/index";
import { EyeFilled } from "@components/icons";
import { CounterpartyType, CounterpartyTypeKey, PaymentMethodEnum,PaymentMethod, StatusKey, StatusType, TransactionKey, TransactionType, BankLabel, BankEnum, SourceDomain, SourceDomainLabel } from "@pages/wallet-administration/transaction-wallet/constants/Transaction.constant";
import { formatNumber } from "@utils/index";
import { PATHS } from "@constants/pathConstant";

interface ColumnProps {
    navigate: NavigateFunction;
}



const getColumn = ({ navigate }: ColumnProps): ColumnsType<UnifiedContentJournal> => [
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
                    <p>Tạo: {dayjs(record.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}</p>
                    {record.postedAt && (
                        <p className="text-green-600 text-[12px]">TC: {dayjs(record.postedAt).local().format('DD/MM/YYYY HH:mm:ss')}</p>
                    )}
                    {record.archivedAt && (
                        <p className="text-red-600 text-[12px]">Lưu trữ: {dayjs(record.archivedAt).local().format('DD/MM/YYYY HH:mm:ss')}</p>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Mã giao dịch',
        dataIndex: 'transactionCode',
        align: 'center',
        render(value, record) {
            return (
                <div>
                    {record.transactionCode ? (
                        <Link
                            to={PATHS.TRANSACTION_MANAGEMENT.DETAIL_TRANSACTION(record.id)}
                            className="text-blue-500 font-bold underline underline-offset-2"
                        >
                            {record.transactionCode}
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
    title: 'Phương thức thanh toán',
    dataIndex: 'paymentMethod',
    align: 'center',
    render: (value) => {
        const methodColors: Record<string, string> = {
            ATM: 'blue',
            CC: 'purple',
            VA: 'orange',
            QR_CODE: 'cyan',
            WALLET_BALANCE: 'green',
            LINKED_ACCOUNT: 'geekblue',
        };
        return (
            <TagComponent color={methodColors[value as PaymentMethodEnum] || 'default'}>
                {PaymentMethod[value as PaymentMethodEnum] || "--"}
            </TagComponent>
        );
    },
},
// Cột Nguồn
{
    title: 'Nguồn',
    dataIndex: 'sourceDomain',
    align: 'center',
    render: (value) => {
        const sourceColors: Record<string, string> = {
            EWALLET: 'gold',
        };
        return (
            <TagComponent color={sourceColors[value as SourceDomain] || 'default'}>
                {SourceDomainLabel[value as SourceDomain] || "--"}
            </TagComponent>
        );
    },
},
    {
        title: 'Người chuyển',
        align: 'center',
        dataIndex: 'from',
        render(value, record) {
            return <span className="font-medium text-gray-500">{BankLabel[value?.displayName as BankEnum]|| <MaskText value={value?.displayName} />}</span>
        },
    },
    {
        title: 'Người nhận',
        align: 'center',
        dataIndex: 'to',
        render(value, record) {
            return <span className="font-medium text-gray-500">{BankLabel[value?.displayName as BankEnum]|| <MaskText value={value?.displayName} />}</span>
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
    // {
    //     title: 'Thao tác',
    //     align: 'center',
    //     width: 80,
    //     render(value, record) {
    //         return (
    //             <div className="flex justify-center items-center gap-1">
    //                 <TooltipComponent title='Xem chi tiết'>
    //                     <ButtonComponent
    //                         onClick={() => navigate(`/transaction-management/transaction-wallet/${record.id}`)}
    //                         size='small'
    //                         className='bg-blue-50 !border border-blue-600 text-blue-600 hover:!bg-blue-100 hover:!text-blue-600'
    //                         icon={<EyeFilled />}
    //                     />
    //                 </TooltipComponent>
    //             </div>
    //         )
    //     },
    // },
]
export default getColumn
