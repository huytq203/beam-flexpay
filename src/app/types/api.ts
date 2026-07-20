import type { JSX } from 'react'
import { LazyExoticComponent } from 'react'

export interface IRoutesCustom {
  id: string
  path: string
  component: LazyExoticComponent<() => JSX.Element>
  isProtected: boolean
}

export type ResponseType<T> = {
  data: T
  message?: string
  statusCode: number
}

export interface IPageSearch {
  page: number
  take: number
}

export interface FileUpload {
  uid: string
  name: string
  status: string
  url: string
}

export type CustomModalProps = {
  open: boolean
  onClose: () => void
}

export type PageMeta = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  itemCount: number
  page: number
  pageCount: number
  take: number
}

export enum STATUS_CODE {
  SUCCESS = 200,
  CREATED = 201,
  UNAUTHORIZED = 401
}
