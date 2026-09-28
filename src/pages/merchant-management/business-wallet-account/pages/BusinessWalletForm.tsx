import { Navigate } from 'react-router-dom'

import { useScreenAccess } from '@/app/permissions'
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ScrollToTopButton
} from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'

import { AccountInfoSection } from '../components/AccountInfoSection'
import { BusinessIdentitySection } from '../components/BusinessIdentitySection'
import { BusinessWalletFormState } from '../components/BusinessWalletFormState'
import { ClassificationSection } from '../components/ClassificationSection'
import { LegalDocsSection } from '../components/LegalDocsSection'
import { WalletManagerSection } from '../components/WalletManagerSection'
import { useBusinessWalletForm } from '../hooks/useBusinessWalletForm'

const BusinessWalletForm = () => {
  const form = useBusinessWalletForm()
  const { can } = useScreenAccess('BUSINESS_WALLET_ACCOUNT')

  if (!can(form.isEditMode ? 'edit' : 'create')) {
    return (
      <Navigate
        to={FORBIDDENERROR}
        replace
      />
    )
  }

  const title = form.isEditMode
    ? 'Cập nhật ví doanh nghiệp'
    : 'Thêm mới ví doanh nghiệp'
  const description = form.isEditMode
    ? 'Điều chỉnh hồ sơ pháp lý, liên hệ và người đại diện của ví doanh nghiệp.'
    : 'Luồng hỗ trợ — luồng chính là doanh nghiệp tự đăng ký và KYB trên Merchant Portal.'

  return (
    <main className='flex min-w-0 flex-col gap-3 mx-5'>
      <CardComponent className='sticky top-0 z-10! border border-border bg-background shadow-[var(--shadow-micro)]'>
        <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex min-w-0 items-center gap-3'>
            <ButtonComponent
              htmlType='button'
              type='default'
              aria-label='Quay lại danh sách ví doanh nghiệp'
              icon={<ArrowLeftOutlined aria-hidden />}
              onClick={form.handleCancel}
            />
            <div className='min-w-0'>
              <h1 className='font-display text-lg font-semibold text-foreground'>
                {title}
              </h1>
              <p className='text-sm text-muted-foreground'>{description}</p>
            </div>
          </div>
          <ButtonComponent
            htmlType='submit'
            form='business-wallet-form'
            loading={form.isSubmitting}
            icon={<SaveOutlined aria-hidden />}
            content={form.isEditMode ? 'Lưu thay đổi' : 'Hoàn tất & Tạo'}
          />
        </header>
      </CardComponent>

      {form.isEditMode && form.isLoadingDetail && (
        <BusinessWalletFormState
          state='loading'
          onBack={form.handleCancel}
          onRetry={form.refetchDetail}
        />
      )}
      {form.isEditMode && form.isNotFound && (
        <BusinessWalletFormState
          state='not-found'
          onBack={form.handleCancel}
          onRetry={form.refetchDetail}
        />
      )}
      {form.isEditMode && form.isDetailError && (
        <BusinessWalletFormState
          state='error'
          onBack={form.handleCancel}
          onRetry={form.refetchDetail}
        />
      )}

      {(!form.isEditMode ||
        (!form.isLoadingDetail && !form.isDetailError && !form.isNotFound)) && (
        <form
          id='business-wallet-form'
          noValidate
          className='flex flex-col gap-3'
          onSubmit={form.handleSubmit(form.onSubmit)}
        >
          <AccountInfoSection
            control={form.control}
            isEditMode={form.isEditMode}
          />
          <BusinessIdentitySection control={form.control} />
          <WalletManagerSection
            control={form.control}
            requiresAdminPassword={form.requiresAdminPassword}
          />
          <LegalDocsSection
            control={form.control}
            resolveFileUrl={form.resolveFileUrl}
          />
          <ClassificationSection control={form.control} />
        </form>
      )}

      <ScrollToTopButton />
    </main>
  )
}

export default BusinessWalletForm
