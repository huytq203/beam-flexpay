import { useState } from 'react'
import {
  Input,
  InputNumber,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  SubMerchantPickerDialog,
  TextArea,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import {
  BANK_LABELS,
  ORDER_CODE_MAX,
  ORDER_TEXT_MAX,
  PAYMENT_METHOD_LABELS
} from '../constants/merchantOrder.constants'
import type {
  OrderBankCode,
  OrderCreateForm,
  OrderPaymentMethod
} from '../types/merchantOrder.types'

interface Props {
  form: OrderCreateForm
  onChange: (form: OrderCreateForm) => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const bankOptions = Object.entries(BANK_LABELS).map(([value, label]) => ({
  value,
  label
}))
const methodOptions = (['QR', 'VIRTUAL_ACCOUNT'] as const).map((value) => ({
  value,
  label: PAYMENT_METHOD_LABELS[value]
}))

export function OrderCreateFields({ form, onChange }: Props) {
  const [picking, setPicking] = useState<'merchant' | 'sub'>()
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [sub, setSub] = useState<PickedEntity>()
  const set = (patch: Partial<OrderCreateForm>): void =>
    onChange({ ...form, ...patch })

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
      <PickerTrigger
        id='merchant-order-create-merchant'
        label='Merchant'
        required
        value={describePicked(merchant)}
        placeholder='Chọn Merchant'
        onOpen={() => setPicking('merchant')}
        onClear={() => {
          setMerchant(undefined)
          setSub(undefined)
          set({ merchantId: undefined, subMerchantId: undefined })
        }}
      />
      <PickerTrigger
        id='merchant-order-create-sub'
        label='Sub-merchant'
        value={sub?.name}
        placeholder={
          form.merchantId ? 'Không gắn Sub-merchant' : 'Chọn Merchant trước'
        }
        disabled={!form.merchantId}
        onOpen={() => setPicking('sub')}
        onClear={() => {
          setSub(undefined)
          set({ subMerchantId: undefined })
        }}
      />
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-code'
        >
          Mã đơn hàng <span className='text-danger-strong'>*</span>
        </label>
        <Input
          id='merchant-order-create-code'
          maxLength={ORDER_CODE_MAX}
          value={form.orderCode}
          onChange={(event) => set({ orderCode: event.target.value })}
          placeholder='Duy nhất trong một Merchant'
        />
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-amount'
        >
          Số tiền (₫) <span className='text-danger-strong'>*</span>
        </label>
        <InputNumber
          id='merchant-order-create-amount'
          min={1}
          precision={0}
          value={form.amount}
          onChange={(value) =>
            set({ amount: typeof value === 'number' ? value : null })
          }
        />
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-bank'
        >
          Ngân hàng <span className='text-danger-strong'>*</span>
        </label>
        <SelectComponent
          id='merchant-order-create-bank'
          className='w-full'
          options={bankOptions}
          value={form.bankCode}
          onChange={(bankCode: OrderBankCode) =>
            set({
              bankCode,
              paymentMethod:
                bankCode === 'VCB' && form.paymentMethod === 'VIRTUAL_ACCOUNT'
                  ? 'QR'
                  : form.paymentMethod
            })
          }
        />
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-method'
        >
          Hình thức thanh toán
        </label>
        <SelectComponent
          id='merchant-order-create-method'
          className='w-full'
          options={methodOptions.map((option) => ({
            ...option,
            disabled:
              option.value === 'VIRTUAL_ACCOUNT' && form.bankCode !== 'VPB'
          }))}
          value={form.paymentMethod}
          onChange={(paymentMethod: OrderPaymentMethod) =>
            set({ paymentMethod })
          }
        />
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-expired'
        >
          Hạn thanh toán
        </label>
        <Input
          id='merchant-order-create-expired'
          type='datetime-local'
          value={form.expiredAt}
          onChange={(event) => set({ expiredAt: event.target.value })}
        />
        <p className='mt-1 text-xs text-muted-foreground'>
          Giờ Việt Nam. Bỏ trống: VPB mặc định 30 phút; VCB chỉ rút ngắn được.
        </p>
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-terminal'
        >
          Terminal (UUID)
        </label>
        <Input
          id='merchant-order-create-terminal'
          maxLength={36}
          disabled={!form.subMerchantId}
          value={form.terminalId}
          onChange={(event) => set({ terminalId: event.target.value })}
          placeholder='Tùy chọn, thuộc Sub-merchant đã chọn'
        />
      </div>
      <div className='sm:col-span-2'>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-purpose'
        >
          Nội dung thanh toán
        </label>
        <TextArea
          id='merchant-order-create-purpose'
          rows={2}
          maxLength={ORDER_TEXT_MAX}
          value={form.purpose}
          onChange={(event) => set({ purpose: event.target.value })}
          placeholder='In vào QR/hóa đơn, nên tiếng Việt không dấu. Nếu nhập, thay thế mô tả đơn.'
        />
      </div>
      <div className='sm:col-span-2'>
        <label
          className={labelClass}
          htmlFor='merchant-order-create-description'
        >
          Mô tả đơn
        </label>
        <Input
          id='merchant-order-create-description'
          maxLength={ORDER_TEXT_MAX}
          value={form.orderDescription}
          onChange={(event) => set({ orderDescription: event.target.value })}
        />
      </div>
      <MerchantPickerDialog
        open={picking === 'merchant'}
        selectedId={form.merchantId}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          setMerchant(toPickedEntity(value))
          setSub(undefined)
          set({
            merchantId: value.id,
            subMerchantId: undefined,
            terminalId: ''
          })
          setPicking(undefined)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        merchantId={form.merchantId}
        status='ACTIVE'
        selectedId={form.subMerchantId}
        onCancel={() => setPicking(undefined)}
        onSelect={(value) => {
          setSub(toPickedEntity(value))
          set({ subMerchantId: value.id })
          setPicking(undefined)
        }}
      />
    </div>
  )
}
