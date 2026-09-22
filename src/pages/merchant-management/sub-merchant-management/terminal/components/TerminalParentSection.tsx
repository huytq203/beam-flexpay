import type { Control } from 'react-hook-form'

import { FormSelect } from '@components/form'
import { Input } from '@components/index'

import type { TerminalFormValue } from '../schemas/terminal.schema'
import {
  getActiveSubMerchantOptions,
  getMerchantOptions
} from '../utils/terminal.utils'

interface TerminalParentSectionProps {
  control: Control<TerminalFormValue>
  mode: 'create' | 'edit'
  tid?: string
  parentMerchantId?: string
  onParentChange: () => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'

export function TerminalParentSection({
  control,
  mode,
  tid,
  parentMerchantId,
  onParentChange
}: TerminalParentSectionProps) {
  const isEdit = mode === 'edit'

  return (
    <section
      aria-labelledby='terminal-parent-title'
      className='space-y-4'
    >
      <div className='border-b border-border pb-2'>
        <h2
          id='terminal-parent-title'
          className='font-display text-sm font-semibold text-foreground'
        >
          Quan hệ quản lý
        </h2>
        <p className='mt-1 text-xs text-muted-foreground'>
          Chọn đúng Merchant và Sub-merchant đang hoạt động để kế thừa cấu hình
          thanh toán.
        </p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className={FIELD_CLASS}>
          <label
            className={LABEL_CLASS}
            htmlFor='terminal-id'
          >
            Terminal ID
          </label>
          <Input
            aria-label='Terminal ID'
            disabled
            id='terminal-id'
            value={isEdit ? tid : 'Hệ thống tự sinh'}
          />
        </div>
        <FormSelect<TerminalFormValue>
          control={control}
          name='parentMerchantId'
          label='Merchant cha'
          options={getMerchantOptions()}
          disabled={isEdit}
          onChange={onParentChange}
          required
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
        <FormSelect<TerminalFormValue>
          control={control}
          name='subMerchantId'
          label='Sub-merchant'
          options={getActiveSubMerchantOptions(parentMerchantId)}
          disabled={isEdit || !parentMerchantId}
          required
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
        />
      </div>
      {!isEdit && (
        <p className='text-xs text-muted-foreground'>
          Chỉ hiển thị Sub-merchant đang hoạt động
        </p>
      )}
    </section>
  )
}
