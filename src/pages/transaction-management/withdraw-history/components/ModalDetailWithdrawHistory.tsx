import { CardComponent, TimeLineComponent } from '@components/index'
import { BankFilled, HistoryOutlined, PenTool, UserIcon } from '@components/icons'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { PaymentMethod, PaymentMethodKey, StatusKey, StatusType } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { formatNumber } from '@utils/index'
import dayjs from 'dayjs'
import React from 'react'

interface Props {
    data?: UnifiedContentJournal
    isLoading?: boolean
}

const STATUS_CLASS: Record<string, string> = {
    PENDING: 'text-blue-600 bg-blue-50 border border-blue-400 px-2 py-0.5 rounded text-[12px] font-medium',
    POSTED: 'text-green-700 bg-green-50 border border-green-400 px-2 py-0.5 rounded text-[12px] font-medium',
    ARCHIVED: 'text-red-600 bg-red-50 border border-red-400 px-2 py-0.5 rounded text-[12px] font-medium',
}

const InfoRow = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className="flex justify-between items-center py-1">
        <p className="text-gray-500">{label}:</p>
        <div className={`font-medium ${className ?? ''}`}>{value ?? '--'}</div>
    </div>
)

const DialogDetailWithdrawHistory = ({ data, isLoading }: Props) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-40 text-gray-400">Đang tải dữ liệu...</div>
    }

    if (!data) {
        return <div className="flex justify-center items-center h-40 text-gray-400">Không có dữ liệu</div>
    }

    const statusKey = data.status as StatusKey

    const timelineItems = [
        {
            title: 'Tạo yêu cầu rút tiền',
            time: dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            color: 'blue' as const,
        },
        ...(data.postedAt
            ? [{
                title: 'Giao dịch thành công',
                time: dayjs(data.postedAt).format('DD/MM/YYYY HH:mm:ss'),
                color: 'green' as const,
            }]
            : []),
        ...(data.archivedAt
            ? [{
                title: 'Đã lưu trữ',
                time: dayjs(data.archivedAt).format('DD/MM/YYYY HH:mm:ss'),
                color: 'red' as const,
            }]
            : []),
        ...(data.failureReason
            ? [{
                title: `Thất bại: ${data.failureReason}`,
                time: '',
                color: 'red' as const,
            }]
            : []),
    ]

    return (
        <div>
            <div className="grid grid-cols-2 h-full gap-3 mb-3">
                <CardComponent className='col-span-1 flex-1 h-full' content={
                    <div className="h-full">
                        <p className='font-medium flex items-center gap-1'><UserIcon weight='fill' />Thông tin giao dịch</p>
                        <hr className='my-3' />
                        <div>
                            <InfoRow label='Mã giao dịch' value={data.transactionCode} />
                            <InfoRow label='Mô tả' value={data.description} />
                            <InfoRow label='Người yêu cầu' value={data.from?.displayName || data.from?.username || '--'} />
                            <InfoRow
                                label='Số tiền rút'
                                value={`-${formatNumber(data.amount)} ${data.currency}`}
                                className='text-red-600'
                            />
                            <InfoRow label='Phí' value={`${formatNumber(data.feeAmount)} ${data.currency}`} />
                            <InfoRow
                                label='Tổng'
                                value={`-${formatNumber(data.grossAmount)} ${data.currency}`}
                                className='text-red-600 font-bold'
                            />
                            <InfoRow label='Phương thức' value={
                                <span className="text-[12px] px-2 py-0.5 rounded bg-gray-100 border border-gray-300">
                                    {PaymentMethod[data.paymentMethod as PaymentMethodKey] ?? '--'}
                                </span>
                            } />
                            <InfoRow label='Trạng thái' value={
                                <span className={STATUS_CLASS[statusKey] ?? 'text-gray-500'}>
                                    {StatusType[statusKey] ?? data.status}
                                </span>
                            } />
                        </div>
                    </div>
                } />

                <CardComponent className='flex-1 col-span-1' content={
                    <div>
                        <p className='font-medium flex items-center gap-1'><BankFilled />Thông tin thụ hưởng</p>
                        <hr className='my-3' />
                        <div>
                            <InfoRow label='Ngân hàng' value={data.to?.displayName || '--'} />
                            <InfoRow label='Số tài khoản' value={ '--'} />
                            <InfoRow label='Tên chủ TK' value={ '--'} />
                            <InfoRow label='Chi nhánh' value={ '--'} />
                            {data.bankRefId && <InfoRow label='Mã tham chiếu NH' value={data.bankRefId} />}
                            {data.transactionId && <InfoRow label='Mã giao dịch gốc' value={
                                <span className="text-xs break-all">{data.transactionId}</span>
                            } />}
                            {data.reversesJournalId && <InfoRow label='Hoàn từ' value={data.reversesJournalId} />}
                            {data.reversedByJournalId && <InfoRow label='Bị hoàn bởi' value={data.reversedByJournalId} />}
                        </div>
                    </div>
                } />

                <CardComponent className='col-span-2' content={
                    <>
                        <p className='font-medium flex items-center gap-1'><HistoryOutlined />Lịch sử xử lý</p>
                        <hr className='my-3' />
                        <div className="h-40 overflow-auto">
                            <TimeLineComponent items={timelineItems} />
                        </div>
                    </>
                } />
            </div>

            <CardComponent content={
                <>
                    <p className='font-medium flex items-center gap-1'><PenTool size={16} />Ghi chú nội bộ của admin:</p>
                    <div className="bg-yellow-50 border rounded-md p-3 text-gray-500 mt-2">
                        <p>Chưa có ghi chú nội dung nào</p>
                    </div>
                </>
            } />
        </div>
    )
}

export default DialogDetailWithdrawHistory