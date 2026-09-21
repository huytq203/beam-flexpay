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
  titleIcon: ReactNode
  isLoading?: boolean
  isError?: boolean
  children: ReactNode
}

export interface MerchantGatewayToolbarProps {
  children: ReactNode
  search: ReactNode
}

interface MerchantGatewayTableStateBaseProps<T extends object> {
  rows: readonly T[]
  columns: TableColumnsType<T>
  rowKey: keyof T | ((row: T) => Key)
  pagination?: false | TablePaginationConfig
  emptyKind?: 'initial' | 'filtered'
  onRefresh?: () => void
}

export type MerchantGatewayTableStateProps<T extends object> =
  | (MerchantGatewayTableStateBaseProps<T> & {
      state: 'error'
      onRetry: () => void
    })
  | (MerchantGatewayTableStateBaseProps<T> & {
      state: 'empty'
      onRetry?: () => void
    })
  | (MerchantGatewayTableStateBaseProps<T> & {
      state: Exclude<ListState, 'error' | 'empty'>
      onRetry?: never
    })
