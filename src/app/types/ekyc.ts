import { AdminTableType } from './admin'
import { IPageSearch, PageMeta } from './api'

export interface IEkycSearch extends IPageSearch {
  phoneNumber?: string
  status?: string
  from?: string
  to?: string
}
export interface IEkycType extends ICustomerEkyc {
  id: number
  phoneNumber: number
  status: string
  requestedAt: string | null
  verifier: AdminTableType
  verifiedAt: string
  documents: any
  customer: ICustomerEkyc
  placeOfResidence: null | string
}

export interface ICustomerEkyc {
  phoneNumber: number
  type: string
  identityNumber: number
  address: string
  email: string
  birthDay: string
}

export interface IEkycPayload {
  data: IEkycType[]
  meta: PageMeta
}

export enum StatusEkyc {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REFUSED = 'REFUSED'
}
