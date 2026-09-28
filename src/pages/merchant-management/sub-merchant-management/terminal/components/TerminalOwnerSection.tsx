import { useState } from 'react'
import { useFormState, type UseFormReturn } from 'react-hook-form'
import type { ApiSubMerchantSummary } from '@/app/services/merchantHierarchyApi'
import type { PickedEntity } from '../../shared/management.types'
import { ParentMerchantPickerDialog } from '../../shared/ParentMerchantPickerDialog'
import { PickerTrigger } from '../../shared/PickerTrigger'
import { SubMerchantPickerDialog } from '../../shared/SubMerchantPickerDialog'
import type { TerminalApiDraft } from '../schemas/terminalApi.schema'

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
    form.setValue('subMerchantId', '')
    onPickMaster(merchant)
    onPickSub(undefined)
    setPicking(undefined)
  }
  const pickSub = (value: ApiSubMerchantSummary) => {
    form.setValue('subMerchantId', value.id, { shouldValidate: true })
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
          Chọn Master để tìm Sub-merchant trực thuộc. Không thể đổi đơn vị quản
          lý sau khi tạo.
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
          disabled={edit || !master}
          value={describe(sub)}
          placeholder={master ? 'Chọn Sub-merchant' : 'Chọn Master trước'}
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
          <ParentMerchantPickerDialog
            open={picking === 'merchant'}
            status='ACTIVE'
            selectedId={master?.id}
            onCancel={() => setPicking(undefined)}
            onSelect={({ id, code, name }) => pickMaster({ id, code, name })}
          />
          <SubMerchantPickerDialog
            open={picking === 'sub'}
            status='ACTIVE'
            merchantId={master?.id}
            selectedId={sub?.id}
            onCancel={() => setPicking(undefined)}
            onSelect={pickSub}
          />
        </>
      )}
    </section>
  )
}
