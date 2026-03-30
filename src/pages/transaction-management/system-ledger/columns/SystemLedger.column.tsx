import { ColumnsType } from "antd/lib/table";
import { LedgerEntry } from "../types/SystemLedger.type";
import dayjs from "dayjs";
import { Link, NavigateFunction } from "react-router-dom";
import { ButtonComponent, MaskText, TooltipComponent, TypographyText } from "@components/index";
import { EyeFilled } from "@components/icons";
import { formatCurrency } from "@utils/formatNumber";
import { CONFIG_STATUS, DirectionConstants, DirectionKey, GLCodeLabels, StatusKey, StatusLabel } from "../constants/SystemLedger.constant";
import StatusBadge from "@components/status-badge/StatusBadge";

const getSystemLedgerColumn = ({ navigate }: { navigate: NavigateFunction }): ColumnsType<LedgerEntry> => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center',
        width: 50,

    },
    {
        title: 'Mã giao dịch',
        align: 'left',
        width: 150,
        dataIndex: 'transaction',
        render(value, record) {
            return (
                <div>
                    {record.transaction?.transactionCode ? (
                        <div className="flex flex-col ">
                            <TypographyText strong copyable={{ text: record.transaction.transactionCode }}>
                                {record.transaction.transactionCode}
                            </TypographyText>
                            <span className="text-gray-500 text-[12px]">{value.description}</span>
                        </div>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Tài khoản chuyển',
        align: 'center',
        dataIndex: 'transaction',
        width: 150,
        render(value) {
            const maskedAccount = value?.maskedAccount
            if (!maskedAccount) return '--'

            const isAlreadyMasked = String(maskedAccount).includes('*')||maskedAccount=="SYSTEM"

            return (
                <div className='text-center'>
                    {isAlreadyMasked ? (
                        <p className="font-medium ">{maskedAccount === "SYSTEM" ? "Hệ thống" : maskedAccount}</p>
                    ) : (
                        <MaskText value={maskedAccount} />
                    )}
                </div>
            )
        },
    },
    {
        title: 'Tài khoản nhận',
        align: 'center',
        dataIndex: 'account',
        width: 150,
        render(value) {
            const maskedAccount = value?.ownerUsername
            if (!maskedAccount) return '--'

            const isAlreadyMasked = String(maskedAccount).includes('*')||maskedAccount=="SYSTEM"

            return (
                <div className='text-center'>
                    {isAlreadyMasked ? (
                        <p className="font-medium">{maskedAccount === "SYSTEM" ? "Hệ thống" : maskedAccount}</p>
                    ) : (
                        <MaskText value={maskedAccount} />
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
    // {
    //     title: 'Mô tả',
    //     dataIndex: 'transaction',
    //     align: 'left',
    //     width: 150,
    //     render(value) {
    //         return (
    //             <div className="font-medium">
    //                 {value?.description}
    //             </div>
    //         )
    //     },
    // },
    {
        title: 'Trạng thái',
        align: 'center',
        width: 120,
        render(value, record) {
            const STATUS_CLASS: Record<StatusKey, string> = {
                SUCCESS: 'text-green rounded-md inline-block px-2 font-medium text-xs border border-green bg-green',
                ERROR: 'text-red rounded-md inline-block px-2 font-medium text-xs border border-red bg-red',
                WAITING: 'text-blue-600 rounded-md inline-block px-2 font-medium text-xs border border-blue-500 bg-blue-50',
                ACTIVE: 'text-green rounded-md inline-block px-2 font-medium text-xs border border-green bg-green',
                LOCKED: 'text-red rounded-md inline-block px-2 font-medium text-xs border border-red bg-red',
            };
            const status = record.account?.status || record.transaction?.status;
            return (
                <StatusBadge status={status as StatusKey}  config={CONFIG_STATUS} />
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

export default getSystemLedgerColumn
