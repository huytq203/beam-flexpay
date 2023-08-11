import { IPageSearch, PageMeta } from './api'

export enum ApplicableObject {
  SYSTEM = 'SYSTEM',
  CUSTOMER_TYPE = 'CUSTOMER_TYPE',
  PRIVATE_ACCOUNT = 'PRIVATE_ACCOUNT'
}

export interface IDiscountProductSearch extends IPageSearch {
  applicableObject?: string
  serviceId?: number
  productTypeId?: number
  groupProduct?: string
  groupProductId?: string
}

export interface IDiscountProductPayload {
  data: IDiscountProductType[]
  meta: PageMeta
}

export interface IDiscountProductType {
  startDate: string
  endDate: string
  status: string
  intoMoney: number
  fixedFee: number
  denominations: number
  discount: number
  applicableObject: string
}

export type ChildProductType = {
  createdAt: string,
  deletedAt: string,
  groupProductId: number,
  id: number,
  isShow: number,
  name: string,
  price: number,
  updatedAt: string
}
