import { IPageSearch, PageMeta } from './api'

export interface IProductSearch extends IPageSearch {
  productTypeId?: string
  featured?: string
  groupProduct?: string
  orderBy?: string
  serviceId?: string
}

export interface IProductTable {
  id: number
  serviceType: string
  productType: string[]
  name: string
  attribute: string
  displayOn: string[]
  description: string
}

export interface IProductForm {
  id: number
  service: string
  productTypeId: string
  name: string
  childs?: IChildProduct[]
  description: string
  avatar: File[] | string[]
  featured: string
  showApp: number
  showWeb: number
}

export interface IChildProduct {
  id: number
  parentId: number
  name: string
  price: number
  isDisplay: string
  isShow: number
}
export interface IProductPayload {
  data: IServiceType[]
  meta: PageMeta
}
export enum viewMode {
  'lock' = 'lock',
  'view' = 'view',
  'create' = 'create',
  'update' = 'update',
  'delete' = 'delete'
}

export enum AttributeProduct {
  NEW_PRODUCT = 'NEW_PRODUCT',
  HOT_PRODUCT = 'HOT_PRODUCT',
  PROMOTION_PRODUCTS = 'PROMOTION_PRODUCTS'
}

export interface IProductTypes {
  groupProducts: IProductTypes[]
  products: IProductTypes[]
  id: number
  serviceId: number
  name: string
  showApp: number
  showWeb: number
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

export interface IServiceType {
  id: number
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
  name: string | null
  productTypes: IProductTypes[]
}
