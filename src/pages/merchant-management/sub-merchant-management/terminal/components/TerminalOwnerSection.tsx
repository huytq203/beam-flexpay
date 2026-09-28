import { useState } from 'react'
import { useFormState, type UseFormReturn } from 'react-hook-form'
import type { ApiSubMerchantSummary } from '@/app/services/merchantHierarchyApi'
import type { TerminalApiDraft } from '../schemas/terminalApi.schema'
import {
  PickerTrigger,
  MerchantPickerDialog,
  SubMerchantPickerDialog,
  type PickedEntity
} from '@components/index'

interface TerminalOwnerSectionProps {
  form: UseFormReturn<TerminalApiDraft>
  edit: boolean
  tid?: string
  master?: PickedEntity
  sub?: PickedEntity
  onPickMaster: (merchant?: PickedEntity) => void
  onPickSub: (sub?: ApiSubMerchantSummary) => void
}

const describe = (entity?: PickedEntity) =>
  entity ? `${entity.code} — ${entity.name}` : undefined

export function TerminalOwnerSection({
  form,
  edit,
  tid,
  master,
  sub,
  onPickMaster,
  onPickSub
}: TerminalOwnerSectionProps) {
  const [picking, setPicking] = useState<'merchant' | 'sub'>()
  const { errors } = useFormState({
    control: form.control,
    name: ['merchantId', 'subMerchantId']
  })

  const pickMaster = (merchant?: PickedEntity) => {
    form.setValue('merchantId', merchant?.id ?? '', { shouldValidate: true })
    // Sub-merchant đã chọn chỉ giữ lại khi còn thuộc Master mới.
    if (sub && master?.id !== merchant?.id) {
      form.setValue('subMerchantId', '')
      onPickSub(undefined)
    }
    onPickMaster(merchant)
    setPicking(undefined)
  }
  // Chọn thẳng Sub-merchant thì Master suy ra từ chính Sub đó.
  const pickSub = (value: ApiSubMerchantSummary) => {
    form.setValue('subMerchantId', value.id, { shouldValidate: true })
    form.setValue('merchantId', value.merchantId, { shouldValidate: true })
    onPickMaster({
      id: value.merchantId,
      code: value.merchantCode ?? value.merchantId,
      name: value.merchantName ?? ''
    })
    onPickSub(value)
    setPicking(undefined)
  }

  return (
    <section className='space-y-4'>
      <div className='border-b border-border pb-3'>
        <h2 className='text-base font-semibold text-foreground'>
          Đơn vị quản lý
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Chọn Sub-merchant, Master Merchant sẽ tự điền theo Sub đã chọn. Không
          thể đổi đơn vị quản lý sau khi tạo.
        </p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <PickerTrigger
          id='terminal-master'
          label='Master Merchant'
          required
          disabled={edit}
          value={describe(master)}
          placeholder='Chọn Master Merchant'
          error={errors.merchantId?.message}
          onOpen={() => setPicking('merchant')}
          onClear={() => pickMaster(undefined)}
        />
        <PickerTrigger
          id='terminal-sub'
          label='Sub-merchant'
          required
          disabled={edit}
          value={describe(sub)}
          placeholder='Chọn Sub-merchant'
          error={errors.subMerchantId?.message}
          onOpen={() => setPicking('sub')}
        />
      </div>
      <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm'>
        <span className='font-medium text-foreground'>Terminal ID</span>
        <span className='text-muted-foreground'>
          {tid ?? 'Hệ thống tự sinh khi tạo'}
        </span>
      </div>
      {!edit && (
        <>
          <MerchantPickerDialog
            open={picking === 'merchant'}
            status='ACTIVE'
            selectedId={master?.id}
            onCancel={() => setPicking(undefined)}
            onSelect={({ id, code, name }) => pickMaster({ id, code, name })}
          />
          <SubMerchantPickerDialog
            open={picking === 'sub'}
            status='ACTIVE'
            selectedId={sub?.id}
            onCancel={() => setPicking(undefined)}
            onSelect={pickSub}
          />
        </>
      )}
    </section>
  )
}
