import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { FormSelect } from '@components/form'
import { CardComponent, Input } from '@components/index'

import { SUB_MERCHANT_FIXTURES } from '../constants/subMerchant.fixture'
import type { SubMerchantFormValue } from '../schemas/subMerchant.schema'

interface ParentMerchantSectionProps {
  control: Control<SubMerchantFormValue>
  isEditMode: boolean
}

const PARENT_OPTIONS = Array.from(
  new Map(
    SUB_MERCHANT_FIXTURES.map((row) => [
      row.parentMerchantId,
      { label: `${row.parentMerchantName} (${row.parentMerchantCode})`, value: row.parentMerchantId }
    ])
  ).values()
)

export function ParentMerchantSection({ control, isEditMode }: ParentMerchantSectionProps) {
  const parentMerchantId = useWatch({ control, name: 'parentMerchantId' })
  const parentLabel = PARENT_OPTIONS.find((option) => option.value === parentMerchantId)?.label

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='parent-merchant-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='parent-merchant-title'>Thiết lập Merchant cha</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Merchant cha quyết định hồ sơ pháp lý và cấu hình được kế thừa.</p>
        </header>
        {isEditMode ? (
          <label className='flex flex-col gap-1.5 text-sm font-medium text-foreground md:max-w-xl'>
            Merchant cha
            <Input aria-label='Merchant cha' className='bg-muted/50!' disabled value={parentLabel} />
          </label>
        ) : (
          <FormSelect
            className='flex flex-col md:max-w-xl'
            control={control}
            label='Merchant cha'
            name='parentMerchantId'
            options={PARENT_OPTIONS}
            placeholder='Chọn Merchant cha'
            required
          />
        )}
      </section>
    </CardComponent>
  )
}
