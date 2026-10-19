import type { BasisLink, FeeBasisModel } from '../utils/feeBasis'

interface FeeBasisFormulaProps {
  /** Tên loại phí đứng ở vế trái phép tính. */
  title: string
  model: FeeBasisModel
  /** Tạo id neo của thẻ theo số thứ tự, để liên kết cơ sở tính nhảy tới đúng thẻ. */
  anchorOf: (index: number) => string
}

const LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'
const OPERATOR = 'select-none text-muted-foreground'

/** Ô tên thẻ khác trong cùng luồng; có số mục thì là liên kết nhảy tới thẻ đó. */
const ComponentChip = ({
  link,
  anchorOf
}: {
  link: BasisLink
  anchorOf: (index: number) => string
}) => {
  const body = <span>{link.label}</span>
  // `!` thắng màu link toàn cục của antd: chữ teal trên nền trắng không đủ tương phản.
  const className =
    'inline-flex items-center rounded-[3px] border border-border bg-background px-1.5 py-0.5 text-[13px] font-semibold text-foreground!'
  if (link.index === undefined) return <span className={className}>{body}</span>
  return (
    <a
      aria-label={`Tới thành phần ${link.index}: ${link.label}`}
      className={`${className} transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
      href={`#${anchorOf(link.index)}`}
    >
      {body}
    </a>
  )
}

/**
 * Cách tính của một thẻ phí viết thành phép tính: "VAT = 2% × Phí hoàn tiền". Khi cơ sở là một phí
 * khác, ghi rõ không tính trên số tiền giao dịch — đây là chỗ hay hiểu nhầm nhất khi đọc VAT.
 */
export const FeeBasisFormula = ({
  title,
  model,
  anchorOf
}: FeeBasisFormulaProps) => {
  const { base, rate, fixed, free, dependents } = model
  const onComponent = base.kind === 'COMPONENT'

  return (
    <div className='flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5'>
      <div
        aria-label={`Cách tính ${title}`}
        className='flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-foreground'
        role='group'
      >
        <span className={`${LABEL} mr-1`}>Cách tính</span>
        <span className='font-semibold'>{title}</span>
        <span className={OPERATOR}>=</span>
        {free ? (
          <span className='font-semibold'>Miễn phí</span>
        ) : (
          <>
            {rate && (
              <>
                <span className='font-semibold tabular-nums'>{rate}</span>
                <span className={OPERATOR}>×</span>
                {onComponent ? (
                  <ComponentChip
                    anchorOf={anchorOf}
                    link={base}
                  />
                ) : (
                  <span className='font-semibold'>{base.label}</span>
                )}
              </>
            )}
            {rate && fixed && <span className={OPERATOR}>+</span>}
            {fixed && (
              <span className='font-semibold tabular-nums'>
                {fixed}
                {!rate && (
                  <span className='font-normal text-muted-foreground'>
                    {' '}
                    cố định
                  </span>
                )}
              </span>
            )}
          </>
        )}
      </div>
      {!free && rate && onComponent && (
        <p className='text-xs text-muted-foreground'>
          Tính trên số tiền của {base.label}.
        </p>
      )}
      {dependents.length > 0 && (
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground'>
          <span>Là cơ sở tính của</span>
          {dependents.map((link) => (
            <ComponentChip
              key={link.label}
              anchorOf={anchorOf}
              link={link}
            />
          ))}
        </div>
      )}
    </div>
  )
}
