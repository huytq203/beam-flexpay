// Fee Management Types
export interface FeePolicy {
    id?: string
    name: string
    description?: string
    priority: number
    status: string
    validFrom: string
    validTo?: string | null
    currency: string
    serviceType: string
    feeDomain: string
    createdAt?: string
    updatedAt?: string
}

export interface FeePolicyResponse {
    content: FeePolicy[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface FeeSearchParams {
    keyword?: string
    serviceType?: string
    feeDomain?: string
    status?: string
    page: number
    size: number
    sortBy: string
    sortDirection: 'ASC' | 'DESC'
}
