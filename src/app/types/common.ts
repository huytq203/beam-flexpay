export interface CommonResponsePayload<Type>{
  data: Type
  meta: Pagination
  statusCode: number
  message: string
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type TFunction = (key: string) => string
