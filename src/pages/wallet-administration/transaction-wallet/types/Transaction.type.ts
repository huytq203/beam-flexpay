export interface FormSearchValues {
    status: string
    fromDate: string
    toDate: string
    transactionType?: string
    senderUsername?: string
    receiverUsername?: string
    bankCode?: string
    paymentMethod?: string
    transactionCode?: string
    minAmount?: number
    maxAmount?: number
    sourceDomain?: string
}

export interface TransactionFreezeTarget {
    accountId: string
    ownerId: string
    ownerName: string
    ownerType: string
    availableBalance: number
    currency: string
    roleLabel: 'Người chuyển' | 'Người nhận'
}
