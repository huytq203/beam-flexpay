import { ColumnsType } from "antd/lib/table";
import { LedgerEntry } from "../types/SystemLedger.type";
import dayjs from "dayjs";
import { Link, NavigateFunction } from "react-router-dom";
import { ButtonComponent, TooltipComponent } from "@components/index";
import { EyeFilled } from "@components/icons";
import { formatCurrency } from "@utils/formatNumber";
import { DirectionConstants, DirectionKey, GLCodeLabels, StatusLabel } from "../constants/SystemLedger.constant";

const SystemLedgerColumn = ({ navigate }: { navigate: NavigateFunction }): ColumnsType<LedgerEntry> => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width:50,
        
    },
    {
        title: 'Mã giao dịch',
        align: 'center',
        width: 150,
        render(value, record) {
            return (
                <div>
                    {record.transaction?.transactionCode ? (
                        <Link
                            to={`/wallet-administration/system-ledger/${record.id}`}
                            className="text-blue-500 font-bold underline underline-offset-2"
                        >
                            {record.transaction.transactionCode}
                        </Link>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            )
        },
    },
    {
        title: 'GL Code',
        align: 'center',
        width: 200,
        render(value, record) {
            const glCode = record.account?.glCode
            return (
                <div className='text-start'>
                    <p className="font-medium ">{glCode ?? '--'}</p>
                    <p className="text-gray-500 text-xs">{GLCodeLabels[glCode] ?? 'N/A'}</p>
                </div>
            )
        },
    },
    {
        title: 'Loại giao dịch',
        dataIndex: 'direction',
        align: 'center',
        width: 100,
        render(value: DirectionKey) {
            const isCredit = value === DirectionConstants.CREDIT
            return (
                <div className={`font-semibold text-sm ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {value}
                </div>
            )
        },
    },
    {
        title: 'Tổng tiền',
        dataIndex: 'amount',
        align: 'right',
        width: 150,
        render(value, record) {
            const isCredit = record.direction === DirectionConstants.CREDIT
            return (
                <div className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{isCredit ? '+' : '-'}</span>
                    {formatCurrency(value)}
                </div>
            )
        },
    },
    {
        title: 'Số dư sau giao dịch',
        dataIndex: 'balanceAfter',
        align: 'right',
        width: 150,
        render(value) {
            return (
                <div className="font-medium">
                    {formatCurrency(value)}
                </div>
            )
        },
    },
    {
        title: 'Trạng thái',
        align: 'center',
        width: 120,
        render(value, record) {
            const STATUS_CLASS: Record<string, string> = {
                SUCCESS: 'text-green rounded-md inline-block px-2 font-medium text-xs border border-green bg-green',
                ERROR: 'text-red rounded-md inline-block px-2 font-medium text-xs border border-red bg-red',
                WAITING: 'text-blue-600 rounded-md inline-block px-2 font-medium text-xs border border-blue-500 bg-blue-50',
                ACTIVE: 'text-green rounded-md inline-block px-2 font-medium text-xs border border-green bg-green',
            };
            const status = record.account?.status || record.transaction?.status
            return (
                <div className={STATUS_CLASS[status] ?? ''}>
                    {StatusLabel[status] ?? status}
                </div>
            )
        },
    },
    {
        title: 'Thời gian tạo',
        align: 'center',
        width: 180,
        render(value, record) {
            return (
                <div className=''>
                    <p>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                </div>
            )
        },
    },
    // {
    //     title: 'Thao tác',
    //     align: 'center',
    //     width: 80,
    //     fixed: 'right',
    //     render(value, record) {
    //         return (
    //             <div className="flex justify-center items-center">
    //                 <TooltipComponent title='View Details'>
    //                     <ButtonComponent
    //                         onClick={() => navigate(`/wallet-administration/system-ledger/${record.id}`)}
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

export default SystemLedgerColumn
