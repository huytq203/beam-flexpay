import { IPageSearch, PageMeta } from './api'
import { IProductTypes } from './product'

export interface IProductTypeSearch extends IPageSearch {
  id?: number
  show?: string
  keyword?: string
}

export interface IProductTypeTable {
  id: number
  name: string
  service: any
  serviceId: number
  showApp: boolean
  showWeb: boolean
  updatedAt: any
  groupProducts: []
}

export interface IProductType {
  name: string
  service: any
  showApp: boolean
  showWeb: boolean
}
export interface IProductTypesPayload {
  data: IProductTypeTable[]
  meta: PageMeta
}

export enum viewMode {
  'lock' = 'lock',
  'view' = 'view',
  'create' = 'create',
  'update' = 'update',
  'delete' = 'delete'
}

export enum AttributeDisplayOnProduct {
  APP = 'APP',
  WEB = 'WEB',
  BOTH = 'BOTH'
}
