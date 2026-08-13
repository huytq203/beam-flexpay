import dayjs from 'dayjs'

interface AuditStampProps {
  timestamp: string | null
  actor: string | null
  emptyActorLabel: string
}

const formatAuditTimestamp = (value: string | null): string => {
  if (!value) return '--'

  const timestamp = dayjs(value)
  return timestamp.isValid() ? timestamp.format('DD/MM/YYYY HH:mm:ss') : '--'
}

const AuditStamp = ({
  timestamp,
  actor,
  emptyActorLabel
}: AuditStampProps) => (
  <div className='min-w-0 text-xs leading-5'>
    <p className='m-0 whitespace-nowrap text-slate-700'>
      {formatAuditTimestamp(timestamp)}
    </p>
    <p
      className='m-0 max-w-48 truncate text-slate-500'
      title={actor ?? undefined}
    >
      {actor ? `Bởi ${actor}` : emptyActorLabel}
    </p>
  </div>
)

export default AuditStamp
