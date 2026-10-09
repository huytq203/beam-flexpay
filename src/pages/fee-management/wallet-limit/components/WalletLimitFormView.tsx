import { CardComponent } from '@components/index'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { FormProvider, useWatch } from 'react-hook-form'
import { useWalletLimitForm } from '../hooks/useWalletLimitForm'
import { useWalletLimitFormSubmit } from '../hooks/useWalletLimitFormSubmit'
import { walletLimitPaths } from '../utils/walletLimit.paths'
import { WalletLimitFormActions } from './WalletLimitFormActions'
import { WalletLimitFormBanner } from './WalletLimitFormBanner'
import { WalletLimitFormBreadcrumb } from './WalletLimitFormBreadcrumb'
import { WalletLimitFormLockConfirm } from './WalletLimitFormLockConfirm'
import {
  WalletLimitFormOutflowLimits,
  WalletLimitFormTransactionLimits
} from './WalletLimitFormLimitsSection'
import { WalletLimitFormObjectSection } from './WalletLimitFormObjectSection'
import { WalletLimitFormOverrides } from './WalletLimitFormOverrides'

interface WalletLimitFormViewProps {
  policy?: WalletLimitPolicy
  onReload?: () => Promise<WalletLimitPolicy | undefined>
}

export function WalletLimitFormView({
  policy,
  onReload
}: WalletLimitFormViewProps) {
  const form = useWalletLimitForm(policy)
  const submit = useWalletLimitFormSubmit({ form, policy, onReload })
  const rowVersion = useWatch({ control: form.control, name: 'rowVersion' })
  const isEdit = Boolean(policy)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <WalletLimitFormBreadcrumb policy={policy} />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={submit.onSubmit}
          className='flex flex-col gap-3'
        >
          <CardComponent className='border border-border bg-background shadow-none'>
            <header>
              <h1 className='text-xl font-semibold text-foreground'>
                {isEdit ? 'Cập nhật hạn mức' : 'Thêm hạn mức'}
              </h1>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {isEdit
                  ? `Đang sửa phiên bản dữ liệu ${rowVersion}. Lưu là có hiệu lực ngay.`
                  : 'Cấu hình mới có hiệu lực ngay khi lưu và luôn ở trạng thái Hoạt động.'}
              </p>
            </header>
            <WalletLimitFormBanner
              banner={submit.banner}
              isReloading={submit.isReloading}
              onReload={submit.reload}
            />
          </CardComponent>
          <WalletLimitFormObjectSection isEdit={isEdit} />
          <WalletLimitFormTransactionLimits />
          <WalletLimitFormOutflowLimits />
          <WalletLimitFormOverrides />
          <WalletLimitFormActions
            isEdit={isEdit}
            isSaving={submit.isSaving}
            cancelTo={
              policy
                ? walletLimitPaths.detail(policy.id)
                : walletLimitPaths.list
            }
          />
        </form>
      </FormProvider>
      <WalletLimitFormLockConfirm
        values={submit.pendingLock}
        onConfirm={submit.confirmLock}
        onCancel={submit.cancelLock}
      />
    </main>
  )
}
