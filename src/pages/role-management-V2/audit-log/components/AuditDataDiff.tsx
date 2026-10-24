import { buildAuditDiff } from '../utils/auditDiff.utils'

interface Props {
  oldData: string | null
  newData: string | null
}

const cell = 'break-all px-2 py-1 align-top font-mono text-xs'

function RawBlock({ label, text }: { label: string; text: string | null }) {
  return (
    <section className='min-w-0'>
      <h4 className='mb-1 text-xs font-semibold text-muted-foreground'>
        {label}
      </h4>
      <pre className='max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-2 text-xs'>
        {text ?? '—'}
      </pre>
    </section>
  )
}

/** Hiển thị chênh lệch trước/sau; cấu trúc JSON không cố định nên mảng hoặc giá trị đơn hiện nguyên văn. */
export function AuditDataDiff({ oldData, newData }: Props) {
  const diff = buildAuditDiff(oldData, newData)

  if (diff.kind === 'raw') {
    if (diff.oldText === null && diff.newText === null)
      return (
        <p className='text-sm text-muted-foreground'>
          Bản ghi không có dữ liệu trước/sau.
        </p>
      )
    return (
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <RawBlock
          label='Dữ liệu cũ'
          text={diff.oldText}
        />
        <RawBlock
          label='Dữ liệu mới'
          text={diff.newText}
        />
      </div>
    )
  }

  return (
    <div className='overflow-x-auto rounded border border-border'>
      <table className='w-full table-fixed border-collapse text-left'>
        <thead className='bg-muted text-xs text-muted-foreground'>
          <tr>
            <th className='w-1/4 px-2 py-1 font-medium'>Trường</th>
            <th className='px-2 py-1 font-medium'>Dữ liệu cũ</th>
            <th className='px-2 py-1 font-medium'>Dữ liệu mới</th>
          </tr>
        </thead>
        <tbody>
          {diff.rows.map((row) => (
            <tr
              key={row.key}
              data-changed={row.changed}
              className={row.changed ? 'bg-warning/10' : undefined}
            >
              <th
                scope='row'
                className={`${cell} font-semibold`}
              >
                {row.key}
              </th>
              <td className={cell}>{row.oldValue ?? '—'}</td>
              <td className={cell}>{row.newValue ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
