import { TransactionItem } from "@type/transaction.type";
import dayjs from "dayjs";
import { ColumnsType } from "antd/lib/table";
import { Link, useNavigate, NavigateFunction } from "react-router-dom";
import { ButtonComponent, TooltipComponent } from "@components/index";
import { ArrowCounterClockwiseIcon, BroadcastIcon, CheckOutlined, CloseOutlined, DollarOutlined, EyeFilled, FireIcon, PencilLineIcon, SnowflakeIcon } from "@components/icons";
import { StatusConstants, StatusKey, StatusType, TransactionConstants, TransactionKey, TransactionType } from "@pages/wallet-administration/transaction-management/constants/Transaction.constant";
import { formatNumber,formatCurrency } from "@utils/index";
const Column = ({ navigate }: { navigate: NavigateFunction }): ColumnsType<TransactionItem> => [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Thời gian',
        align: 'center',
        render(value, record, index) {
            return (
                <div className='text-start'>
                    <p>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    <p className="text-gray-500 text-sm" >Kết thúc: {dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                </div>
            )
        },
    },
    {
        title: 'Mã giao dịch',
        dataIndex: 'transactionCode',
        align: 'center',
        render(value, record, index) {
            return (
                <div>
                    {record.transactionCode ? (

                        <Link
                            to={`/wallet-administration/transaction-management/${record.id}`}
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
        title: 'Loại/Phương thức',
        dataIndex: 'type',
        render(value, record, index) {
            const typeKey = record.type as TransactionKey;
            return (
                <div className='text-start'>
                    <p className="font-medium"> {(TransactionType[typeKey] ?? record.type)??'--'}</p>
                    <p className="text-gray-500 text-sm"> {record.description}</p>
                </div>
            )
        },
    },
    {
        title: 'Người chuyển',
        dataIndex: 'ownerId',
        align: 'center'
    },
    {
        title: 'Người nhận',
        dataIndex: 'soDuVi',
        align: 'center'
    },
    {
        title: 'Số tiền gốc',
        align: 'center',
        render(value, record, index) {
            return(
                <div className="font-medium">
                    <p>{formatNumber(record.amount)}</p>
                </div>
            )
        },
    },
    {
        title: 'Phí',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="text-gray-500">
                    <p>{formatNumber(record.feeAmount)}</p>
                </div>
            )
        },
    },
    {
        title: 'Tổng',
        dataIndex: 'amount',
        align: 'center',
        render(value, record, index) {
            const typesKey = record.type as TransactionKey
            if (typesKey=='DEBIT') {
                return (
                    <div className="font-medium text-red">
                        <p>-{formatNumber(record.grossAmount)}</p>
                    </div>
                )
            }
            return (
                <div className="font-medium text-green">
                    <p>+{formatNumber(record.grossAmount)}</p>
                </div>
            );
        },
    },
    {
        title: 'Ref no/Settlement',
        dataIndex: 'soDuVi',
        align: 'center'
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        align: 'center',
        render(value, record, index) {
            const STATUS_CLASS: Record<string, string> = {
                SUCCESS: 'text-green rounded-md inline-block px-2 font-medium text-xs border border-green bg-green',
                ERROR: 'text-red rounded-md inline-block px-2 font-medium text-xs border border-red bg-red',
                WAITING: 'text-blue-600 rounded-md inline-block px-2 font-medium text-xs border border-blue-500 bg-blue-50',
                REVIEW: 'text-yellow rounded-md inline-block px-2 font-medium text-xs border border-yellow bg-yellow',
            };
            const typeKeyStatus = record.status as StatusKey
            return (
                <div className={STATUS_CLASS[typeKeyStatus] ?? ''}>
                    {StatusType[typeKeyStatus]}
                </div>
            )
        },
    },
    {
        title: 'Thao tác',
        dataIndex: 'soDuVi',
        align: 'center',
        width: 100,
        render(value, record, index) {
            const statusKey = record.status as StatusKey
            const typesKey = record.type as TransactionKey
            return (
                <div className="flex justify-start items-center gap-1">
                    <TooltipComponent title='Xem chi tiết'>
                        <ButtonComponent onClick={() =>
                            navigate(`/wallet-administration/transaction-management/${record.id}`)} size='small' className='bg-blue-50 !border border-blue-600 text-blue-600 hover:!bg-blue-100 hover:!text-blue-600 ' icon={<EyeFilled />} />
                    </TooltipComponent>
                    {statusKey === StatusConstants.SUCCESS &&
                        <TooltipComponent title='Hoàn tiền'>
                            <ButtonComponent size='small' className='bg-yellow !border border-yellow text-yellow hover:!bg-yellow-100 hover:!text-yellow-600' icon={<ArrowCounterClockwiseIcon />} />
                        </TooltipComponent>
                    }
                    {(typesKey === TransactionConstants.CREDIT && statusKey === StatusConstants.SUCCESS) &&

                        <TooltipComponent title='Callback'>
                            <ButtonComponent size='small' className='bg-gray-50 !border border-gray-600 text-gray-700 hover:!bg-gray-200 hover:!text-gray-700 ' icon={<BroadcastIcon />} />
                        </TooltipComponent>
                    }
                    {statusKey === StatusConstants.PROCESSING &&
                        <TooltipComponent title='Cập nhật'>
                            <ButtonComponent size='small' className='bg-teal-50 !border border-teal-600 text-teal-700 hover:!bg-teal-100 hover:!text-teal-700 ' icon={<PencilLineIcon />} />
                        </TooltipComponent>
                    }
                    {statusKey === StatusConstants.REVIEW &&
                        <TooltipComponent title='Duyệt'>
                            <ButtonComponent size='small' className='bg-green-50 !border border-green-600 text-green-600 hover:!bg-green-100 hover:!text-green-600 ' icon={<CheckOutlined />} />
                        </TooltipComponent>

                    }
                    {statusKey === StatusConstants.SUCCESS &&
                        <TooltipComponent title='Mở băng'>
                            <ButtonComponent size='small' className='bg-orange-50 !border border-orange-600 text-orange-600 hover:!bg-orange-100 hover:!text-orange-600 ' icon={<FireIcon weight="fill" />} />
                        </TooltipComponent>
                    }
                    {statusKey === StatusConstants.SUCCESS &&
                        <TooltipComponent title='Đóng băng'>
                            <ButtonComponent size='small' className='bg-cyan-50 !border border-cyan-600 text-cyan-600 hover:!bg-cyan-100 hover:!text-cyan-600 ' icon={<SnowflakeIcon />} />
                        </TooltipComponent>
                    }
                    {statusKey === StatusConstants.REVIEW &&
                        <TooltipComponent title='Từ chối duyệt'>
                            <ButtonComponent size='small' type='default' danger icon={<CloseOutlined />} />
                        </TooltipComponent>
                    }
                </div>
            )
        },
    },
]
export default Column