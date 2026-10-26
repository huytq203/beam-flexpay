import { formatAuditJson } from '../utils/auditData.utils'

interface AuditDataDetailsProps {
  oldData: string | null
  newData: string | null
}

const Block = ({ label, value }: { label: string; value: string | null }) => (
  <details className='text-xs'>
    <summary className='cursor-pointer text-primary'>{label}</summary>
    <pre className='mt-1 max-h-60 max-w-72 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-2'>
      {formatAuditJson(value)}
    </pre>
  </details>
)

/** Dữ liệu cũ/mới của audit là chuỗi JSON thô; thu gọn mặc định để bảng không bị dài. */
export function AuditDataDetails({ oldData, newData }: AuditDataDetailsProps) {
  if (!oldData && !newData) return <span>—</span>
  return (
    <div className='space-y-1'>
      {oldData && (
        <Block
          label='Dữ liệu cũ'
          value={oldData}
        />
      )}
      {newData && (
        <Block
          label='Dữ liệu mới'
          value={newData}
        />
      )}
    </div>
  )
}
