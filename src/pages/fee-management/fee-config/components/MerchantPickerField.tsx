import { StorefrontIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useGetMerchantByIdQuery } from '@services/apiMerchant'
import type { ContentMerchant } from '@type/merchant'
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { MerchantPickerDialog } from './MerchantPickerDialog'

interface MerchantPickerFieldProps {
  control: Control<FeeConfigFormValues>
  className?: string
  readOnly?: boolean
}

const HEAD =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className='flex flex-col gap-0.5'>
    <span className={HEAD}>{label}</span>
    <span className='text-[13px] text-foreground'>{value || '—'}</span>
  </div>
)

/**
 * Ô chọn đơn vị chấp nhận thanh toán.
 *
 * Sau khi chọn, khối này đổ luôn thông tin đơn vị ra thay vì chỉ hiện một cái
 * tên: bản gán ghi bằng id, và id thì người vận hành không đối chiếu được bằng
 * mắt. Mở lại bản ghi cũ thì nạp thông tin theo id đang lưu.
 */
export const MerchantPickerField = ({
  control,
  className,
  readOnly = false
}: MerchantPickerFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [picked, setPicked] = useState<ContentMerchant | null>(null)

  return (
    <Controller
      control={control}
      name='merchantId'
      render={({ field, fieldState }) => (
        <MerchantPickerBody
          merchantId={field.value}
          picked={picked}
          error={fieldState.error?.message}
          className={className}
          readOnly={readOnly}
          isOpen={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          onClear={() => {
            setPicked(null)
            field.onChange('')
          }}
          onSelect={(merchant) => {
            setPicked(merchant)
            field.onChange(merchant.id)
            setIsOpen(false)
          }}
        />
      )}
    />
  )
}

interface MerchantPickerBodyProps {
  merchantId: string
  picked: ContentMerchant | null
  error?: string
  className?: string
  readOnly: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onClear: () => void
  onSelect: (merchant: ContentMerchant) => void
}

const MerchantPickerBody = ({
  merchantId,
  picked,
  error,
  className,
  readOnly,
  isOpen,
  onOpen,
  onClose,
  onClear,
  onSelect
}: MerchantPickerBodyProps) => {
  // Chỉ gọi khi mở bản ghi cũ: vừa chọn xong thì đã có sẵn thông tin trong tay.
  const { data: loaded } = useGetMerchantByIdQuery(merchantId, {
    skip: !merchantId || picked?.id === merchantId
  })

  const merchant = picked?.id === merchantId ? picked : loaded

  return (
    <div className={className}>
      <p className='font-medium'>Đơn vị chấp nhận thanh toán</p>

      {merchant ? (
        <div className='mt-2 rounded-lg border border-border bg-muted px-4 py-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex flex-wrap gap-x-8 gap-y-3'>
              <Fact label='Đơn vị' value={merchant.name} />
              <Fact label='Mã' value={merchant.code} />
              <Fact label='Email' value={merchant.contactEmail ?? '—'} />
              <Fact label='Điện thoại' value={merchant.contactPhone ?? '—'} />
              <Fact label='Trạng thái' value={merchant.status} />
            </div>
            {!readOnly && (
              <div className='flex gap-2'>
                <ButtonComponent
                  htmlType='button'
                  type='default'
                  content='Đổi đơn vị'
                  onClick={onOpen}
                />
                <ButtonComponent
                  htmlType='button'
                  type='text'
                  content='Bỏ chọn'
                  onClick={onClear}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3'>
          {!readOnly && (
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Chọn đơn vị'
              icon={<StorefrontIcon size={16} weight='bold' aria-hidden />}
              onClick={onOpen}
            />
          )}
          <span className='text-[13px] text-muted-foreground'>
            {readOnly
              ? 'Chính sách áp dụng cho mọi đơn vị.'
              : 'Bỏ trống nghĩa là chính sách áp cho mọi đơn vị.'}
          </span>
        </div>
      )}

      {error && (
        <p className='mt-1 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}

      {!readOnly && (
        <MerchantPickerDialog
          open={isOpen}
          selectedId={merchantId}
          onSelect={onSelect}
          onCancel={onClose}
        />
      )}
    </div>
  )
}
