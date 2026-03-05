export interface FormSearchValues {
    status: string
    fromDate: string
    toDate: string
    transactionType?: string
    initiatorUsername?: string
    counterpartyUsername?: string
    bankCode?: string
    paymentMethod?: string
    journalCode?: string
    minAmount?: number
    maxAmount?: number
}
