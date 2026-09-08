export interface LedgerTransaction {
    id: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
    transactionCode: string
    ownerId: string
    type: string
    grossAmount: number
    netAmount: number
    amount: number
    feeCalculationId: string | null
    feeAmount: number
    currency: string
    status: string
    idempotencyKey: string
    description: string
    transactionTime: string
    processedAt: string
    checksum: string
    maskedAccount: string
}

export interface LedgerAccount {
    id: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
    ownerId: string
    ownerType: string
    glCode: string
    currency: string
    totalDebit: number
    totalCredit: number
    balance: number
    holdBalance: number
    availableBalance: number
    version: number
    status: string
    checksum: string
    ownerUsername?: string
}

export interface LedgerEntry {
    id: string
    transaction: LedgerTransaction
    account: LedgerAccount
    direction: 'CREDIT' | 'DEBIT'
    amount: number
    balanceAfter: number
    description: string | null
    checksum: string
    previousChecksum: string
    createdAt: string
}

export interface LedgerResponse {
    data: {
        content: LedgerEntry[]
        pageable?: {
            pageNumber: number
            pageSize: number
        }
        totalPages?: number
        totalElements?: number
        last?: boolean
        first?: boolean
    }
    message?: string
    success?: boolean
}

/**
 * Bộ lọc của lưới sổ cái. Không có `status`: bảng `transactions` chỉ nhận đúng
 * một giá trị khi ghi bút toán, nên lọc theo trạng thái là vô nghĩa ở đây.
 */
export interface FormSearchValues {
    /** Nhận cả mã giao dịch lẫn UUID của transaction. */
    transactionCode?: string
    /** Bỏ trống là sổ cái mọi ví; màn xem theo một ví phải tự truyền. */
    accountId?: string
    /** Chủ tài khoản, khớp chứa — đây là đường lọc theo user. */
    ownerUsername?: string
    ownerType?: string
    /** Mã tài khoản kế toán, khớp bằng. */
    glCode?: string
    direction?: string
    /** Từ vựng riêng của bảng `transactions` — xem `LedgerTransactionType`. */
    transactionType?: string
    minAmount?: number
    maxAmount?: number
    /** Khớp chứa trên mã giao dịch và chủ tài khoản. */
    keyword?: string
    /** Thời gian ghi sổ của chính dòng sổ cái. */
    fromDate?: string
    toDate?: string
}
