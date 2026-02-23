export interface CreateMerchantPayload {
    name: string
    code: string
    contactEmail: string
    contactPhone: string
}

export interface UpdateMerchantPayload {
    name: string
    contactEmail: string
    contactPhone: string
}

export interface ResponseMerchant {
    data: DataMerchant
    message: string
    detail: string
    success: boolean
    status: string
}

export interface DataMerchant {
    content: ContentMerchant[]
    pageable: Pageable
    last: boolean
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    sort: Sort2
    numberOfElements: number
    empty: boolean
}

export interface ContentMerchant {
    id: string
    name: string
    code: string
    contactEmail: string
    contactPhone: string
    status: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
}

export interface Pageable {
    pageNumber: number
    pageSize: number
    sort: Sort
    offset: number
    paged: boolean
    unpaged: boolean
}

export interface Sort {
    empty: boolean
    sorted: boolean
    unsorted: boolean
}

export interface Sort2 {
    empty: boolean
    sorted: boolean
    unsorted: boolean
}
