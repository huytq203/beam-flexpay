import type { ScreenActionId, ScreenId } from '@/app/permissions'
import type { TableColumnsType, TablePaginationConfig } from 'antd'
import type { Key, ReactNode } from 'react'

export type ListState = 'loading' | 'error' | 'empty' | 'success'

type CreateScreenId = {
  [S in ScreenId]: 'create' extends ScreenActionId<S> ? S : never
}[ScreenId]

export interface MerchantGatewayPageProps {
  title: string
  description: string
  total: number
  createLabel: string
  screen: CreateScreenId
  onCreate: () => void
  children: ReactNode
}

export interface MerchantGatewayToolbarProps {
  children: ReactNode
  search: ReactNode
}

export interface MerchantGatewayTableStateProps<T extends object> {
  state: ListState
  rows: readonly T[]
  columns: TableColumnsType<T>
  rowKey: keyof T | ((row: T) => Key)
  pagination?: false | TablePaginationConfig
  onRetry?: () => void
  emptyKind?: 'initial' | 'filtered'
}
