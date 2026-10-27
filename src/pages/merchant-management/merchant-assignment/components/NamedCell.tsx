interface NamedCellProps {
  name?: string | null
  code?: string | null
}

/** Tên kèm mã; thiếu cả hai (ví dụ cột Sub của dòng Master) hiện dấu gạch. */
export function NamedCell({ name, code }: NamedCellProps) {
  if (!name && !code) return <span className='text-muted-foreground'>—</span>
  return (
    <div className='min-w-0'>
      <div className='truncate text-sm font-medium text-foreground'>{name}</div>
      <div className='text-xs text-muted-foreground'>{code}</div>
    </div>
  )
}
