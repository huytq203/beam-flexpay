import { useNavigate } from 'react-router-dom'
import { FormInput } from '@components/form'
import { ButtonComponent, ScrollToTopButton } from '@components/index'
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import { EnterpriseWalletPickerDialog } from '../components/EnterpriseWalletPickerDialog'
import { MerchantFormSection } from '../components/MerchantFormSection'
import { requiredLabel } from '../components/merchantForm.ui'
import { MerchantProfileFields } from '../components/MerchantProfileFields'
import { MerchantWalletFields } from '../components/MerchantWalletFields'
import { useMerchantForm } from '../hooks/useMerchantForm'

const CreateMerchant = () => {
  const navigate = useNavigate()
  const {
    isEditMode,
    isSubmitting,
    control,
    handleSubmit,
    onSubmit,
    selectedWallet,
    errors,
    setPickedWallet,
    setValue,
    walletId,
    walletType,
    isWalletPickerOpen,
    setIsWalletPickerOpen,
    signsAtSubMerchant,
    resolveFileUrl,
    requiresAdminPassword
  } = useMerchantForm()

  return (
    <div className='min-h-full bg-muted/30 px-3 py-4 sm:px-5 sm:py-5'>
      <div className='mx-auto w-full '>
        <header className='z-20 mb-4 rounded-md! border-b border-border bg-background px-3 py-3 sm:top-0 sm:px-5'>
          <div className='mx-auto flex  flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-3'>
              <ButtonComponent
                type='text'
                icon={<ArrowLeftOutlined />}
                aria-label='Quay lại'
                title='Quay lại'
                className='shrink-0'
                onClick={() => navigate(-1)}
              />
              <div className='min-w-0'>
                <h1 className='text-lg font-semibold text-foreground sm:text-xl'>
                  {isEditMode ? 'Cập nhật ĐVCNTT' : 'Đăng ký ĐVCNTT'}
                </h1>
                <p className='mt-0.5 text-sm text-muted-foreground'>
                  Liên kết ví điện tử và hoàn thiện hồ sơ merchant cấp Master
                </p>
              </div>
            </div>

            <ButtonComponent
              form='merchant-form'
              htmlType='submit'
              type='primary'
              icon={<SaveOutlined />}
              content={isEditMode ? 'Lưu thay đổi' : 'Đăng ký ĐVCNTT'}
              loading={isSubmitting}
              className='w-full sm:w-auto'
            />
          </div>
        </header>

        <form
          id='merchant-form'
          className='space-y-4! pb-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <MerchantWalletFields
            control={control}
            selectedWallet={selectedWallet}
            walletError={errors.walletId?.message}
            onWalletTypeChange={() => {
              setPickedWallet(null)
              setValue('walletId', '', {
                shouldDirty: true,
                shouldValidate: true
              })
            }}
            onOpenPicker={() => setIsWalletPickerOpen(true)}
          />

          <MerchantProfileFields
            control={control}
            signsAtSubMerchant={signsAtSubMerchant}
            resolveFileUrl={resolveFileUrl}
          />
          {requiresAdminPassword && (
            <MerchantFormSection
              id='merchant-sensitive-confirmation'
              step='III'
              title='Xác nhận thay đổi nhạy cảm'
            >
              <FormInput
                control={control}
                name='adminPassword'
                type='password'
                autoComplete='current-password'
                className='flex max-w-md flex-col'
                label={requiredLabel('Mật khẩu quản trị')}
                placeholder='Nhập mật khẩu của bạn'
              />
            </MerchantFormSection>
          )}
        </form>
        <EnterpriseWalletPickerDialog
          open={isWalletPickerOpen}
          selectedId={walletId}
          onCancel={() => setIsWalletPickerOpen(false)}
          onSelect={(wallet) => {
            setPickedWallet(wallet)
            setValue('walletId', wallet.id, {
              shouldDirty: true,
              shouldValidate: true
            })
            if (wallet.businessType && wallet.businessType !== walletType) {
              setValue('walletType', wallet.businessType, {
                shouldDirty: true,
                shouldValidate: true
              })
            }
            setIsWalletPickerOpen(false)
          }}
        />
      </div>
      <ScrollToTopButton />
    </div>
  )
}

export default CreateMerchant
