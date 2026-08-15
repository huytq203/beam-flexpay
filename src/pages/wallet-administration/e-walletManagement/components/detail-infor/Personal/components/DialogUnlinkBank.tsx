import { BankFilled, WarningIcon, XCircleIcon } from '@components/icons'
import { ButtonComponent, DialogModal } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import {
  type AdminUnlinkBankLinkResponse,
  type BankLink,
  useUnlinkBankLinkMutation
} from '@services/apiBankLink'
import {
  BankEnum,
  BankLabel
} from '../constants/AccountBank.constant'
import useBankLogo from '../hooks/useBankLogo'
import { useState } from 'react'

interface DialogUnlinkBankProps {
  open: boolean
  bankLink?: BankLink
  onCancel: () => void
  onSuccess: (result: AdminUnlinkBankLinkResponse) => void
}

const fallback = (value?: string | null) => value || '--'

const DialogUnlinkBank = ({
  open,
  bankLink,
  onCancel,
  onSuccess
}: DialogUnlinkBankProps) => {
  const { successMess, errorMess, warningMess } = useMessage()
  const [unlinkBankLink, { isLoading }] = useUnlinkBankLinkMutation()
  const [failedLogoUrl, setFailedLogoUrl] = useState<string>()
  const bankName = BankLabel[bankLink?.bankCode as BankEnum] ?? fallback(bankLink?.bankCode)
  const logoUrl = useBankLogo(bankLink?.bankCode)
  const showLogo = !!logoUrl && failedLogoUrl !== logoUrl

  const handleCancel = () => {
    if (!isLoading) onCancel()
  }

  const handleUnlink = async () => {
    if (!bankLink?.id || isLoading) return

    try {
      const result = await unlinkBankLink(bankLink.id).unwrap()

      if (result.bankSyncStatus === 'FAILED') {
        warningMess(
          'Đã hủy liên kết trên hệ thống nhưng đồng bộ với ngân hàng thất bại. Cần đối soát thủ công.'
        )
      } else {
        successMess('Hủy liên kết ngân hàng thành công')
      }

      onSuccess(result)
    } catch {
    }
  }

  return (
    <DialogModal
      open={open}
      width={600}
      footer={(
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            block
            htmlType='button'
            type='default'
            content='Quay lại'
            disabled={isLoading}
            onClick={handleCancel}
            className='sm:w-auto!'
          />
          <ButtonComponent
            block
            htmlType='button'
            type='primary'
            danger
            content='Xác nhận hủy liên kết'
            loading={isLoading}
            onClick={handleUnlink}
            className='sm:w-auto!'
          />
        </div>
      )}
      styles={{
        footer: {
          borderTop: '1px solid var(--border)',
          marginTop: 20,
          paddingTop: 16
        }
      }}
      closable={!isLoading}
      keyboard={!isLoading}
      maskClosable={!isLoading}
      onCancel={handleCancel}
      onOk={handleUnlink}
      title={(
        <span className='flex items-center gap-3'>
          <span className='flex size-9 items-center justify-center rounded-lg bg-danger/10 text-danger-strong'>
            <XCircleIcon aria-hidden size={21} weight='fill' />
          </span>
          <span className='text-lg font-semibold text-foreground'>Hủy liên kết ngân hàng</span>
        </span>
      )}
    >
      <div className='space-y-5 pt-1'>
        <div
          role='alert'
          className='flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4'
        >
          <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger-strong'>
            <WarningIcon aria-hidden size={19} weight='fill' />
          </span>
          <div className='min-w-0'>
            <p className='font-semibold text-danger-strong'>Hành động này không thể hoàn tác</p>
            <ul className='mt-2 list-disc space-y-1 pl-4 text-sm leading-5 text-foreground/75'>
              <li>Người dùng sẽ không thể nạp hoặc rút tiền qua tài khoản này.</li>
              <li>
                Hệ thống có thể hủy tất cả liên kết đang hoạt động của người dùng tại{' '}
                <span className='font-semibold text-foreground'>{bankName}</span>.
              </li>
            </ul>
          </div>
        </div>

        <section
          aria-label='Thông tin tài khoản ngân hàng sẽ gỡ bỏ'
          data-testid='bank-unlink-card'
          className='overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#009D48_0%,#006A35_100%)] p-5 text-white shadow-subtle sm:p-6'
        >
          <div className='flex min-w-0 items-start justify-between gap-4'>
            <div className='flex h-12 w-28 shrink-0 items-center justify-center rounded-xl bg-white px-3'>
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt={`Logo ${bankName}`}
                  className='max-h-8 max-w-full object-contain'
                  decoding='async'
                  onError={() => setFailedLogoUrl(logoUrl)}
                />
              ) : (
                <BankFilled aria-hidden className='text-2xl text-[#007A35]' />
              )}
            </div>
            <div className='min-w-0 text-right'>
              <p className='text-xs font-medium text-white/70'>Ngân hàng liên kết</p>
              <p className='mt-1 truncate font-semibold text-white'>{bankName}</p>
            </div>
          </div>

          <div className='mt-9'>
            <p className='text-xs font-medium text-white/70'>Số tài khoản</p>
            <p className='mt-2 break-all font-mono text-2xl font-semibold tracking-[0.12em] text-white tabular-nums'>
              {fallback(bankLink?.accountNumberMask)}
            </p>
          </div>

          <div className='mt-7 border-t border-white/20 pt-4'>
            <p className='text-xs font-medium text-white/70'>Tên chủ tài khoản</p>
            <p className='mt-1 break-words font-semibold text-white'>
              {fallback(bankLink?.accountName)}
            </p>
          </div>
        </section>

      </div>
    </DialogModal>
  )
}

export default DialogUnlinkBank
