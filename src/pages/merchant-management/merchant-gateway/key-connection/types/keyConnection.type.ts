export type KeyConnectionScope = 'MASTER' | 'SUB'

export type KeyConnectionStatus = 'ACTIVE' | 'INACTIVE'

export interface KeyConnectionRow {
  id: string
  scope: KeyConnectionScope
  merchantName: string
  merchantCode: string
  clientId: string
  maskedSecret: string
  ipWhitelist: string[]
  webhookUrl: string
  status: KeyConnectionStatus
  updatedAt: string
}

export interface KeyConnectionFilters {
  query: string
  scope: 'ALL' | KeyConnectionScope
  status: 'ALL' | KeyConnectionStatus
}
