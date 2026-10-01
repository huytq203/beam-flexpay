import { DialogModal, feedback } from '@components/index'
import { useSubmitEnterpriseWalletMutation } from '@services/merchantEnterpriseWalletApi'

import type { BusinessWalletRow } from '../types/business-wallet.type'

interface KybSubmitDialogProps {
  wallet: BusinessWalletRow | null
  onClose: () => void
}

export function KybSubmitDialog({ wallet, onClose }: KybSubmitDialogProps) {
  const [submitWallet, { isLoading }] = useSubmitEnterpriseWalletMutation()

  const handleSubmit = async (): Promise<void> => {
    if (!wallet) return
    try {
      await submitWallet(wallet.id).unwrap()
      feedback.success('Đã gửi hồ sơ ví doanh nghiệp vào hàng chờ KYB')
      onClose()
    } catch {
      feedback.error(
        'Không thể gửi duyệt. Vui lòng bổ sung đủ thông tin hồ sơ rồi thử lại.'
      )
    }
  }

  return (
    <DialogModal
      open={wallet !== null}
      title='Gửi duyệt KYB ví doanh nghiệp'
      okText='Gửi duyệt'
      confirmLoading={isLoading}
      okButtonProps={{ disabled: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={!isLoading}
      onCancel={onClose}
      onOk={() => void handleSubmit()}
    >
      <p className='text-sm text-foreground'>
        Gửi hồ sơ ví{' '}
        <strong>{wallet?.legalName || wallet?.registeredEmail}</strong> vào hàng
        chờ KYB? Hồ sơ cần đầy đủ thông tin và giấy tờ bắt buộc.
      </p>
    </DialogModal>
  )
}
