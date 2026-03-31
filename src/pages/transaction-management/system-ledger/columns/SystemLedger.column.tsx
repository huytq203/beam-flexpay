import { ColumnsType } from "antd/lib/table";
import { LedgerEntry } from "../types/SystemLedger.type";
import dayjs from "dayjs";
import { NavigateFunction } from "react-router-dom";
import { MaskText, TypographyText } from "@components/index";
import { formatCurrency } from "@utils/formatNumber";
import { CONFIG_STATUS, DirectionConstants, StatusKey } from "../constants/SystemLedger.constant";
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
        render(_, record) {
            const code = record.transaction?.transactionCode;
            return code ? (
                <TypographyText copyable strong className=" font-medium cursor-pointer">
                    {code}
                </TypographyText>
            ) : (
                <span>--</span>
            );
        },
    },
    {
        title: 'Mã tài khoản (Ví)',
        align: 'left',
        width: 160,
        render(_, record) {
            const username = record.account?.ownerUsername;
            const isSystem = record.account?.ownerType === 'SYSTEM';
            const isAlreadyMasked = username?.includes('*');

            if (isSystem) {
                return <span className="font-semibold text-gray-800 text-center">Hệ thống</span>;
            }

            if (!username) return <span className="font-semibold text-gray-800">--</span>;

            return (
                <div className="flex items-center">
                    {isAlreadyMasked ? (
                         <span className="font-semibold text-gray-800">{username}</span>
                    ) : (
                        <MaskText value={username} />
                    )}
                </div>
            )
        },
    },
    {
        title: 'Loại tài khoản',
        align: 'left',
        width: 200,
        render(_, record) {
            const ownerType = record.account?.ownerType;
            const glCode = record.account?.glCode;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-800 text-sm">{ownerType ?? '--'}</span>
                    <span className="text-gray-400 text-xs">{glCode ?? ''}</span>
                </div>
            );
        },
    },
    {
        title: 'Ghi nợ / Có',
        dataIndex: 'direction',
        align: 'center',
        width: 110,
        render(value: string) {
            const isCredit = value === DirectionConstants.CREDIT;
            return (
                <span
                    className={` font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}
                >
                    {value}
                </span>
            );
        },
    },
    {
        title: 'Số tiền',
        dataIndex: 'amount',
        align: 'right',
        width: 130,
        render(value, record) {
            const isCredit = record.direction === DirectionConstants.CREDIT;
            return (
                <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(value)}
                </span>
            );
        },
    },
    {
        title: 'Số dư sau GD',
        dataIndex: 'balanceAfter',
        align: 'right',
        width: 130,
        render(value) {
            return (
                <span className="text-gray-700 font-medium">{formatCurrency(value)}</span>
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
        title: 'Thời gian tạo',
        align: 'center',
        width: 170,
        render(_, record) {
            return (
                <span className="text-gray-600 text-sm">
                    {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                </span>
            );
        },
    },
]

export default getSystemLedgerColumn
