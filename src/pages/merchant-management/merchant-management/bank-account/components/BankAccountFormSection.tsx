import { cn } from '@utils/cn'

interface BankAccountFormSectionProps {
  id: string
  /** Số La Mã của bước, khớp mockup: I · II · III. */
  step: string
  title: string
  withDivider?: boolean
}

/** Khung nhẹ ngăn các nhóm field trong modal — divider mảnh, không lồng card. */
export function BankAccountFormSection({
  id,
  step,
  title,
  withDivider = true
}: BankAccountFormSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 md:col-span-2',
        withDivider && 'mt-2 border-t border-border pt-4'
      )}
    >
      <span
        aria-hidden='true'
        className='flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
      >
        {step}
      </span>
      <h3
        id={id}
        className='text-xs font-semibold tracking-[0.05em] text-secondary-foreground uppercase'
      >
        {title}
      </h3>
    </div>
  )
}
