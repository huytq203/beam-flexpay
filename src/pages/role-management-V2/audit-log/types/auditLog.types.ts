/** Giá trị `AuditLogAction` của BE (SRS §2.9). Gửi lọc đúng tên hằng: sai kiểu là 400/500. */
export type AuditLogAction =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'LOCK'
  | 'UNLOCK'
  | 'TERMINATE'
  | 'VIEW_DOCUMENT'
  | 'RESET_PASSWORD'
  | 'GRANT_PERMISSION'
  | 'EXPORT'

/** `AuditLogResponse` của `GET /audit-logs`; trường null vẫn có mặt trong JSON. */
export interface AuditLogRecord {
  id: string
  entityName: string
  entityId: string | null
  action: AuditLogAction | string
  /** `ewallet-admin`, `ewallet-merchant`, `ewallet-client`, `SYSTEM`, `UNKNOWN` hoặc chuỗi khác. */
  actorType: string | null
  actorId: string | null
  actorUsername: string | null
  source: string | null
  ipAddress: string | null
  requestId: string | null
  reason: string | null
  /** Chuỗi JSON thô (không phải object); cấu trúc tuỳ `entityName`. */
  oldData: string | null
  newData: string | null
  /** Giờ Việt Nam, `YYYY-MM-DDTHH:mm:ss`, không múi giờ. */
  occurredAt: string
}

/** Query gửi BE: chỉ gồm các khoá có giá trị. */
export interface AuditLogQuery {
  page: number
  size: number
  actorId?: string
  actorUsername?: string
  action?: AuditLogAction
  entityName?: string
  entityId?: string
  occurredFrom?: string
  occurredTo?: string
}

/** Bộ lọc dùng chung cho danh sách và xuất file (không có phân trang). */
export type AuditLogFilterQuery = Omit<AuditLogQuery, 'page' | 'size'>

/** Bộ lọc trên form; chuỗi rỗng nghĩa là không lọc. */
export interface AuditLogFilters {
  actorUsername: string
  actorId: string
  action?: AuditLogAction
  entityName: string
  entityId: string
  occurredFrom?: string
  occurredTo?: string
}

export type AuditLogFilterErrors = Partial<
  Record<'actorId' | 'entityId' | 'occurredTo', string>
>

export interface AuditDiffRow {
  key: string
  oldValue: string | null
  newValue: string | null
  changed: boolean
}

/** Kết quả đọc `oldData`/`newData`: bảng từng trường hoặc JSON thô khi cấu trúc không phải object. */
export type AuditDiff =
  | { kind: 'rows'; rows: AuditDiffRow[] }
  | { kind: 'raw'; oldText: string | null; newText: string | null }
