import { useState } from 'react'
import { Controller, type Control } from 'react-hook-form'
import type { ApiParentMerchant } from '@/app/services/merchantHierarchyApi'
import { StorefrontIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { ParentMerchantPickerDialog } from '../../shared/ParentMerchantPickerDialog'
import type { SubMerchantApiDraft } from '../schemas/subMerchantApi.schema'

interface ParentMerchantFieldProps {
  control: Control<SubMerchantApiDraft>
  parent?: ApiParentMerchant
  isLoadingParent: boolean
  locked: boolean
  onPick: (merchant: ApiParentMerchant) => void
}

const Fact = ({ label, value }: { label: string; value?: string }) => (
  <div className='flex min-w-0 flex-col gap-0.5'>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='text-sm break-words text-foreground'>{value || '—'}</dd>
  </div>
)

export function ParentMerchantField({
  control,
  parent,
  isLoadingParent,
  locked,
  onPick
}: ParentMerchantFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Controller
      control={control}
      name='merchantId'
      render={({ field, fieldState }) => (
        <div className='flex flex-col gap-2'>
          {field.value ? (
            <div className='rounded-lg border border-border bg-muted/30 px-4 py-3'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                {isLoadingParent && !parent ? (
                  <p
                    role='status'
                    className='text-sm text-muted-foreground'
                  >
                    Đang tải Merchant cha…
                  </p>
                ) : (
                  <dl className='grid min-w-0 flex-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <Fact
                      label='Merchant cha'
                      value={parent?.name}
                    />
                    <Fact
                      label='Mã Merchant'
                      value={parent?.code}
                    />
                    <Fact
                      label='Số điện thoại'
                      value={parent?.contactPhone}
                    />
                    <Fact
                      label='Địa chỉ'
                      value={parent?.address}
                    />
                  </dl>
                )}
                {!locked && (
                  <ButtonComponent
                    htmlType='button'
                    type='default'
                    content='Đổi Merchant cha'
                    onClick={() => setIsOpen(true)}
                  />
                )}
              </div>
              {locked && (
                <p className='mt-3 text-xs text-muted-foreground'>
                  Không thể đổi Merchant cha sau khi tạo.
                </p>
              )}
            </div>
          ) : (
            <div className='flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3'>
              <ButtonComponent
                htmlType='button'
                type='default'
                content='Chọn Merchant cha'
                icon={
                  <StorefrontIcon
                    size={16}
                    weight='bold'
                    aria-hidden
                  />
                }
                onClick={() => setIsOpen(true)}
              />
              <span className='text-sm text-muted-foreground'>
                Sub-merchant kế thừa số điện thoại và địa chỉ từ Merchant cha.
              </span>
            </div>
          )}
          {fieldState.error && (
            <p
              role='alert'
              className='text-sm text-danger-strong'
            >
              {fieldState.error.message}
            </p>
          )}
          {!locked && (
            <ParentMerchantPickerDialog
              open={isOpen}
              selectedId={field.value}
              status='ACTIVE'
              onCancel={() => setIsOpen(false)}
              onSelect={(merchant) => {
                field.onChange(merchant.id)
                onPick(merchant)
                setIsOpen(false)
              }}
            />
          )}
        </div>
      )}
    />
  )
}
