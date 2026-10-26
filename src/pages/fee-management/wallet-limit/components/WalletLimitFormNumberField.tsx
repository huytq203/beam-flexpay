import { FormInputNumber } from '@components/form'
import { useFormContext, type Path } from 'react-hook-form'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'

interface WalletLimitFormNumberFieldProps {
  name: Path<WalletLimitFormValues>
  label: string
  placeholder: string
  required?: boolean
  disabled?: boolean
  /** Ghi chú ngắn dưới ô, dùng khi ý nghĩa của hạn mức cần giải thích. */
  hint?: string
}

const formatThousands = (value: string | number | undefined): string =>
  `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// Ô trống phải ra `null` (không phải 0): trống nghĩa là không giới hạn.
const parseDigits = (value: string | undefined): string | number => {
  const digits = value?.replace(/\D/g, '')
  return digits ? Number(digits) : ''
}

/** Ô số tiền của form hạn mức: số nguyên không âm, có dấu phân cách nghìn. */
export function WalletLimitFormNumberField({
  name,
  label,
  placeholder,
  required,
  disabled,
  hint
}: WalletLimitFormNumberFieldProps) {
  const { control } = useFormContext<WalletLimitFormValues>()
  const input = (
    <FormInputNumber<WalletLimitFormValues>
      control={control}
      name={name}
      label={
        <>
          {label}
          {required && <span className='ml-1 text-danger-strong'>*</span>}
        </>
      }
      className='flex min-w-0 flex-col gap-1.5'
      classNameLable='text-sm font-medium'
      placeholder={placeholder}
      disabled={disabled}
      allowEmpty
      min={0}
      precision={0}
      formatter={formatThousands}
      parser={parseDigits}
    />
  )
  if (!hint) return input
  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      {input}
      <p className='text-xs text-muted-foreground'>{hint}</p>
    </div>
  )
}
