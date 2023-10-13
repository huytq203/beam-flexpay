import { Pagination } from "./table"


export interface InternalWalletPayload {
    order: string,
    page: number,
    take: number,
    query: string,
    orderBy: string
}

    
export interface InternalWalletResponse {
    data: any
    meta: Pagination
    statusCode: number
    message: string
}
  