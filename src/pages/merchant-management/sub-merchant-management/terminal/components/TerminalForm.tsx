import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form'

import { FormInput, FormSelect, FormTextArea } from '@components/form'
import { ButtonComponent } from '@components/index'

import { useTerminalRecords } from '../hooks/useTerminals'
import {
  terminalFormSchema,
  type TerminalFormValue
} from '../schemas/terminal.schema'
import { InheritedPaymentSummary } from './InheritedPaymentSummary'
import { TerminalParentSection } from './TerminalParentSection'

interface TerminalFormProps {
  mode: 'create' | 'edit'
  tid?: string
  defaultValues: TerminalFormValue
  canSubmit: boolean
  onCancel: () => void
  onSubmit: (value: TerminalFormValue) => void
}

const FIELD_CLASS = 'flex flex-col gap-1.5'
const LABEL_CLASS = 'text-sm font-medium text-foreground'
const TYPE_OPTIONS = [
  { value: 'STATIC_QR', label: 'QR tĩnh' },
  { value: 'DYNAMIC_QR', label: 'QR động' },
  { value: 'POS', label: 'POS' },
  { value: 'SOFTPOS', label: 'SoftPOS' }
]

export function TerminalForm({
  mode,
  tid,
  defaultValues,
  canSubmit,
  onCancel,
  onSubmit
}: TerminalFormProps) {
  const records = useTerminalRecords()
  const form = useForm<TerminalFormValue>({
    resolver: zodResolver(terminalFormSchema),
    defaultValues
  })
  const parentMerchantId = useWatch({
    control: form.control,
    name: 'parentMerchantId'
  })
  const subMerchantId = useWatch({
    control: form.control,
    name: 'subMerchantId'
  })
  const inherited = records.find((row) => row.subMerchantId === subMerchantId)
  const handleSubmit: SubmitHandler<TerminalFormValue> = onSubmit
  const resetSubMerchant = (): void => form.setValue('subMerchantId', '')

  return (
    <form
      className='space-y-6'
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <TerminalParentSection
        control={form.control}
        mode={mode}
        tid={tid}
        parentMerchantId={parentMerchantId}
        onParentChange={resetSubMerchant}
      />
      <section
        aria-labelledby='terminal-profile-title'
        className='space-y-4'
      >
        <h2
          id='terminal-profile-title'
          className='border-b border-border pb-2 font-display text-sm font-semibold text-foreground'
        >
          Thông tin Terminal
        </h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormInput<TerminalFormValue>
            control={form.control}
            name='name'
            label='Tên Terminal'
            required
            className={FIELD_CLASS}
            classNameLable={LABEL_CLASS}
          />
          <FormSelect<TerminalFormValue>
            control={form.control}
            name='type'
            label='Loại Terminal'
            options={TYPE_OPTIONS}
            required
            className={FIELD_CLASS}
            classNameLable={LABEL_CLASS}
          />
          <FormInput<TerminalFormValue>
            control={form.control}
            name='address'
            label='Địa chỉ'
            required
            className={FIELD_CLASS}
            classNameLable={LABEL_CLASS}
          />
          <FormInput<TerminalFormValue>
            control={form.control}
            name='phone'
            label='Điện thoại'
            className={FIELD_CLASS}
            classNameLable={LABEL_CLASS}
          />
          <FormTextArea<TerminalFormValue>
            control={form.control}
            name='note'
            label='Ghi chú'
            maxLength={500}
            className='flex flex-col gap-1.5 md:col-span-2'
            classNameLable={LABEL_CLASS}
          />
        </div>
      </section>
      <InheritedPaymentSummary
        methods={
          inherited?.inheritedPaymentMethods ?? ['Theo cấu hình Sub-merchant']
        }
        limit={
          inherited?.inheritedLimitLabel ?? 'Áp dụng hạn mức của Sub-merchant'
        }
      />
      <div className='flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end'>
        <ButtonComponent
          className='w-full sm:w-auto'
          content='Hủy'
          htmlType='button'
          onClick={onCancel}
          type='default'
        />
        {canSubmit && (
          <ButtonComponent
            className='w-full sm:w-auto'
            content={mode === 'create' ? 'Thêm Terminal' : 'Lưu thay đổi'}
            htmlType='submit'
          />
        )}
      </div>
    </form>
  )
}
