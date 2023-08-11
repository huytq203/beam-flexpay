export interface SaleFeeSearchParams {
  page?: number
  take?: number
  applicableObject?: string
  serviceId?: string
  account?: string
  productTypeId?: string
  groupProductId?: string
  groupProduct?: string
}

export interface Pagination {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type ArrayProductType = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: null
  name: string
  price: number
  isShow: number
  groupProductId: number
}

export type ProductTypeServiceType = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  name: string
}

export type ProductTypeType = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  name: string
  serviceId: number
  showApp: number
  showWeb: number
  service: ProductTypeServiceType
}

export type GroupProductType = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  name: string
  productTypeId: number
  showApp: number
  showWeb: number
  description: string
  avatar: string
  featured: string
  productType: ProductTypeType
  products: ProductTypeServiceType[]
}

export type SaleFeeItemType = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  applicableObject: string
  applicableAccountId: string
  groupProductId: number
  variableFee: number
  fixedFee: number
  startDate: string
  endDate: string
  applicableAccount: string
  groupProduct: GroupProductType
}

export interface ISaleFeeType {
  id: number
  startDate: string
  endDate: string
  product: any
  intoMoney: number
  fixedFee: number
  denominations: number
  variableFee: number
  applicableObject: string
  accountGroupId: number
  applicableAccountId: number 
}

type SaleFeeDataType = {
  data: ISaleFeeType[]
  meta: Pagination
}

export interface SaleFeePayload {
  data: SaleFeeDataType
}

export type ManageSaleFeeProductType = {
  avatar: string
  createdAt: string
  deletedAt: string
  description: string
  featured: string
  id: number
  name: string
  productTypeId: number
  products: ChildProductType[]
  showApp: number
  showWeb: number
  updatedAt: string
}

export type ChildProductType = {
  createdAt: string
  deletedAt: string
  groupProductId: number
  id: number
  isShow: number
  name: string
  price: number
  updatedAt: string
}

export enum SaleFeeObject {
  'CUSTOMER_TYPE' = 'CUSTOMER_TYPE',
  'SYSTEM'= 'SYSTEM',
  'PRIVATE_ACCOUNT'= 'PRIVATE_ACCOUNT'
}
