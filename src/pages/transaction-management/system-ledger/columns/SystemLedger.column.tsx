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
        title: 'Giao dịch',
        align: 'left',
        width: 250,
        dataIndex: 'transaction',
        render(value, record) {
            return (
                <div className="flex flex-col gap-1">
                    {record.transaction?.transactionCode ? (
                        <>
                            <TypographyText strong copyable={{ text: record.transaction.transactionCode }} className="text-blue-600">
                                {record.transaction.transactionCode}
                            </TypographyText>
                            <span className="text-gray-500 text-[12px] italic">{record.transaction.description || '--'}</span>
                        </>
                    ) : (
                        <span>--</span>
                    )}
                </div>
            )
        },
    },
    {
        title: 'Ghi nợ (Debit)',
        align: 'left',
        width: 200,
        render(_, record) {
            if (record.direction !== DirectionConstants.DEBIT) return <span className="text-gray-300">--</span>;
            const glCode = record.account?.glCode;
            const owner = record.account?.ownerUsername || record.account?.ownerType;
            return (
                <div className="bg-red-50 p-2 rounded-md border border-red-100">
                    <p className="font-bold text-red-700 m-0">{glCode ?? '--'}</p>
                    <p className="text-gray-500 text-xs m-0">{GLCodeLabels[glCode] || owner || 'N/A'}</p>
                </div>
            );
        },
    },
    {
        title: 'Ghi có (Credit)',
        align: 'left',
        width: 200,
        render(_, record) {
            if (record.direction !== DirectionConstants.CREDIT) return <span className="text-gray-300">--</span>;
            const glCode = record.account?.glCode;
            const owner = record.account?.ownerUsername || record.account?.ownerType;
            return (
                <div className="bg-green-50 p-2 rounded-md border border-green-100">
                    <p className="font-bold text-green-700 m-0">{glCode ?? '--'}</p>
                    <p className="text-gray-500 text-xs m-0">{GLCodeLabels[glCode] || owner || 'N/A'}</p>
                </div>
            );
        },
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'right',
        width: 150,
        render(value, record) {
            const isCredit = record.direction === DirectionConstants.CREDIT;
            return (
                <div className={`font-bold text-base ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{isCredit ? '+' : '-'}</span>
                    {formatCurrency(value)}
                </div>
            );
        },
    },
    {
        title: 'Số dư ví',
        dataIndex: 'balanceAfter',
        align: 'right',
        width: 150,
        render(value) {
            return (
                <div className="font-medium text-gray-700">
                    {formatCurrency(value)}
                </div>
            );
        },
    },
    {
        title: 'Trạng thái',
        align: 'center',
        width: 120,
        render(_, record) {
            const status = record.transaction?.status || record.account?.status;
            return (
                <StatusBadge status={status as StatusKey} config={CONFIG_STATUS} />
            );
        },
    },
    {
        title: 'Thời gian',
        align: 'center',
        width: 180,
        render(_, record) {
            return (
                <div className="text-gray-500">
                    <p className="m-0 font-medium">{dayjs(record.createdAt).format('DD/MM/YYYY')}</p>
                    <p className="m-0 text-xs">{dayjs(record.createdAt).format('HH:mm:ss')}</p>
                </div>
            );
        },
    },
]

export default getSystemLedgerColumn
