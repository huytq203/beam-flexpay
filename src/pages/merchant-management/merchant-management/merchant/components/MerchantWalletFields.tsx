import type { Control } from 'react-hook-form'
import { FormSelect } from '@components/form'
import { ButtonComponent } from '@components/index'
import { WalletIcon } from '@components/icons'
import type { CreateMerchantSchemaType } from '../schemas/Merchant.schema'
import { MerchantFormSection } from './MerchantFormSection'
import { requiredLabel } from './merchantForm.ui'

const walletTypeOptions = [
  { label: 'Doanh nghiệp', value: 'ENTERPRISE' },
  { label: 'Hộ kinh doanh', value: 'HOUSEHOLD' }
]

interface Props {
  control: Control<CreateMerchantSchemaType>
  selectedWallet?: {
    legalName?: string
    registeredEmail: string
    taxCode?: string
  }
  walletError?: string
  onWalletTypeChange: () => void
  onOpenPicker: () => void
}

export function MerchantWalletFields({
  control,
  selectedWallet,
  walletError,
  onWalletTypeChange,
  onOpenPicker
}: Props) {
  return (
    <MerchantFormSection
      id='merchant-wallet-information'
      step='I'
      title='Chọn ví điện tử doanh nghiệp / hộ kinh doanh'
    >
      <div className='grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2'>
        <FormSelect
          control={control}
          name='walletType'
          className='flex flex-col md:col-span-2'
          label={requiredLabel('Loại ví')}
          options={walletTypeOptions}
          allowClear={false}
          classNameLable='text-sm font-medium text-foreground'
          onChange={onWalletTypeChange}
        />
        <div className='min-w-0 md:col-span-2'>
          <label
            htmlFor='wallet-picker-trigger'
            className='text-sm font-medium text-foreground'
          >
            {requiredLabel('Chọn ví điện tử')}
          </label>
          <div className='mt-2 flex min-h-18 min-w-0 flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3'>
            <ButtonComponent
              id='wallet-picker-trigger'
              htmlType='button'
              type='default'
              icon={
                <WalletIcon
                  aria-hidden
                  size={18}
                />
              }
              content={selectedWallet ? 'Đổi ví' : 'Chọn ví'}
              onClick={onOpenPicker}
            />
            <span className='min-w-0 text-[13px] text-muted-foreground'>
              {selectedWallet
                ? `${selectedWallet.legalName || selectedWallet.registeredEmail} · ${selectedWallet.registeredEmail}`
                : 'Chọn ví đã xác minh để liên kết với ĐVCNTT.'}
            </span>
          </div>
          {walletError && (
            <p
              role='alert'
              className='mt-1 text-xs text-danger-strong'
            >
              {walletError}
            </p>
          )}
        </div>
        <div className='md:col-span-2'>
          <label className='text-sm font-medium text-foreground'>
            Thông tin chủ ví (từ KYB/eKYC)
          </label>
          <div
            aria-live='polite'
            className='mt-1 flex min-h-10 items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground'
          >
            {selectedWallet ? (
              `${selectedWallet.legalName || selectedWallet.registeredEmail} · MST ${selectedWallet.taxCode ?? 'Chưa có'} · ${selectedWallet.registeredEmail}`
            ) : (
              <span className='text-muted-foreground'>
                Chọn ví điện tử để xem thông tin đã xác thực
              </span>
            )}
          </div>
          <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
            Tự động hiển thị sau khi chọn ví, không chỉnh sửa tại đây.
          </p>
        </div>
      </div>
    </MerchantFormSection>
  )
}
