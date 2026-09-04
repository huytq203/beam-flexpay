import type { Key, ReactNode } from 'react'

/** Một ga trên bản đồ: đúng một màn hình mà tài khoản hiện tại được cấp quyền. */
export interface TransitStation {
  id: string
  key: Key
  label: ReactNode
  icon?: ReactNode
  to: string
}

/**
 * Một tuyến = một phân hệ nghiệp vụ. `token` trỏ tới cặp biến CSS
 * `--line-<token>` (màu khối) và `--line-<token>-ink` (màu chữ đậm hơn).
 */
export interface TransitLine {
  id: string
  token: string
  code: string
  label: ReactNode
  description: string
  elevatedRisk: boolean
  stations: TransitStation[]
}
