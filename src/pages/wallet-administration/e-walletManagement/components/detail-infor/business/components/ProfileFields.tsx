import type { ReactNode } from 'react'
import { cn } from '@utils/cn'

export interface ProfileField {
  label: string
  value: ReactNode
  /** Chiếm cả hàng cho giá trị dài như tên công ty, địa chỉ. */
  isWide?: boolean
}

interface ProfileFieldsProps {
  fields: ProfileField[]
}

export const ProfileFields = ({ fields }: ProfileFieldsProps) => (
  <dl className='grid grid-cols-1 gap-3 md:grid-cols-2'>
    {fields.map(({ label, value, isWide }) => (
      <div
        key={label}
        className={cn('min-w-0', isWide && 'md:col-span-2')}
      >
        <dt className='text-muted-foreground'>{label}</dt>
        <dd className='font-medium break-words text-foreground'>{value}</dd>
      </div>
    ))}
  </dl>
)

interface ProfileHeadingProps {
  children: ReactNode
}

export const ProfileHeading = ({ children }: ProfileHeadingProps) => (
  <h3 className='pt-4 pb-3 text-sm font-semibold text-foreground'>
    {children}
  </h3>
)
