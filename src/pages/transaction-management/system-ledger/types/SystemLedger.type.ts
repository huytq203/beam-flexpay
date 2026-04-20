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

export interface FormSearchValues {
    transactionId?: string
    accountId?: string
    status?: string
    direction?: string
    glCode?: string
    fromDate?: string
    toDate?: string
}
