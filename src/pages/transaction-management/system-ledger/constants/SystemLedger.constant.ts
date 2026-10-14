export const DirectionConstants = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
} as const

export type DirectionKey = keyof typeof DirectionConstants

/**
 * Nhãn kế toán, không phải mã kỹ thuật. File CSV ghi "Nợ" / "Có" vì đưa cho kế
 * toán đọc — màn hình phải nói cùng một thứ tiếng với file.
 */
export const DirectionLabel: Record<DirectionKey, string> = {
    CREDIT: 'Có (CREDIT)',
    DEBIT: 'Nợ (DEBIT)'
}

/** Nhãn ngắn dùng trong ô bảng, không kèm mã. */
export const DirectionShortLabel: Record<DirectionKey, string> = {
    CREDIT: 'Có',
    DEBIT: 'Nợ'
}

export const OwnerTypeConstants = {
    USER: 'USER',
    MERCHANT: 'MERCHANT',
    SYSTEM: 'SYSTEM'
} as const

export type OwnerTypeKey = keyof typeof OwnerTypeConstants

/**
 * Từ vựng `transactionType` của dòng sổ cái. wallet-core đã bỏ `transaction.type`
 * và chuyển sang trường này ở cấp bút toán, dùng chung bộ mã với màn Quản lý
 * giao dịch — nhãn phải khớp `TransactionType` bên đó để hai màn gọi cùng một
 * loại giao dịch bằng cùng một tên.
 */
export const LedgerTransactionType = {
    CASH_IN: 'Nạp tiền',
    CASH_OUT: 'Rút tiền',
    P2P_TRANSFER: 'Chuyển tiền'
} as const

export type LedgerTransactionTypeKey = keyof typeof LedgerTransactionType

export enum StatusConstants {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED'
}

export type StatusKey = keyof typeof StatusConstants

export const StatusLabel: Record<string, string> = {
    SUCCESS: 'Thành công',
    ERROR: 'Lỗi',
    WAITING: 'Đang chờ',
    ACTIVE: 'Hoạt động',
    LOCKED: 'Khóa'
}

export const CONFIG_STATUS: Record<StatusConstants, { label: string, className: string, shimmerColor: string, }> = {
    [StatusConstants.SUCCESS]: { label: 'Thành công', className: 'success-status', shimmerColor:'rgba(0, 229, 160, 0.2)'  },
    [StatusConstants.ERROR]: { label: 'Lỗi', className: 'error-status', shimmerColor: 'rgba(255, 86, 59, 0.2)'},
    [StatusConstants.WAITING]: { label: 'Đang chờ', className: 'warning-status', shimmerColor:'rgba(0, 229, 160, 0.2)' },
    [StatusConstants.ACTIVE]: { label: 'Hoạt động', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.2)' },
    [StatusConstants.LOCKED]: { label: 'Khóa', className: 'error-status', shimmerColor: 'rgba(255, 86, 59, 0.2)' },
}

export const GLCodeLabels: Record<string, string> = {
    'REV_USER_FEE': 'Doanh thu phí người dùng',
    'USER_WALLET_VND': 'Ví người dùng VND',
    'SYS_BANK_SETTLEMENT_VND': 'Tài khoản thanh toán ngân hàng VND',
    'SYSTEM': 'Hệ thống'
}

export const OwnerTypeLabels: Record<string, string> = {
    'SYSTEM': 'Hệ thống',
    'USER': 'Người dùng',
    'MERCHANT': 'Merchant'
}

/**
 * Dòng sổ cái chỉ sinh ra khi bút toán đã hạch toán thành công — đúng theo mô
 * hình kế toán, không phải thiếu dữ liệu. Nói trước để người trực không báo là
 * mất dữ liệu khi không thấy giao dịch đang chờ hoặc đã hỏng.
 */
export const LEDGER_POSTED_ONLY_NOTE =
    'Sổ cái chỉ ghi bút toán đã hạch toán thành công. Giao dịch đang chờ, thất bại hoặc đã huỷ không có ở đây — đối chiếu những giao dịch đó ở màn Quản lý giao dịch.'

/**
 * Vai trò của dòng trong bút toán chuyển tiền ví → ví. wallet-core không trả vai
 * trò nên suy từ chủ tài khoản + chiều ghi: tài khoản doanh thu là phí, ví bị Nợ
 * là người gửi, ví được Có là người nhận. Dòng phí ghi rõ bên chịu theo
 * `feeBearer`; khi hai bên cùng chịu thì ghép theo số tiền từng bên. Loại giao
 * dịch khác không có vai trò chung theo cách này nên trả `null`.
 */
export const getLedgerEntryRole = (entry: {
    transactionType?: string | null
    direction: string
    amount?: number
    feeBearer?: string
    senderFeeAmount?: number
    receiverFeeAmount?: number
    account?: { ownerType?: string; glCode?: string }
}): string | null => {
    if (entry.transactionType !== 'P2P_TRANSFER') return null
    if (entry.account?.glCode?.startsWith('REV_')) return getFeeRole(entry)
    return entry.direction === DirectionConstants.DEBIT ? 'Người gửi' : 'Người nhận'
}

const getFeeRole = (entry: {
    amount?: number
    feeBearer?: string
    senderFeeAmount?: number
    receiverFeeAmount?: number
}): string => {
    switch (entry.feeBearer) {
        case 'RECEIVER':
            return 'Phí (bên nhận)'
        case 'BOTH': {
            const isSender = entry.amount === entry.senderFeeAmount
            const isReceiver = entry.amount === entry.receiverFeeAmount
            if (isSender && !isReceiver) return 'Phí (bên gửi)'
            if (isReceiver && !isSender) return 'Phí (bên nhận)'
            return 'Phí (hai bên)'
        }
        case 'SENDER':
            return 'Phí (bên gửi)'
        default:
            return 'Phí'
    }
}
