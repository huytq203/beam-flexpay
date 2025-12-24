
export interface Root {
    data: ResponseUserInfor
}
export interface UserInfor {
    id: string
    username: string
    email: string | null
    firstName: string | null
    lastName: string | null
    enabled: boolean
    emailVerified: boolean
    createdTimestamp: string|number|Date|null
    groups: string | null
}
export interface ResponseUserInfor {
    content: UserInfor[]
    pageable: Pageable
    last: boolean
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    numberOfElements: number
    sort: Sort2
    empty: boolean
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
