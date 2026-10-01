import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { DialogModal, feedback } from '@components/index'
import { FormTextArea } from '@components/form'
import { useRejectEnterpriseWalletMutation } from '@services/merchantEnterpriseWalletApi'

import {
  KYB_REJECT_REASON_MAX_LENGTH,
  kybRejectSchema,
  type KybRejectValues
} from '../schemas/business-wallet.schema'
import type { BusinessWalletRow } from '../types/business-wallet.type'

interface KybRejectDialogProps {
  wallet: BusinessWalletRow | null
  onClose: () => void
}

export function KybRejectDialog({ wallet, onClose }: KybRejectDialogProps) {
  const [rejectWallet, { isLoading }] = useRejectEnterpriseWalletMutation()
  const form = useForm<KybRejectValues>({
    resolver: zodResolver(kybRejectSchema),
    defaultValues: { reason: '' }
  })

  useEffect(() => {
    if (wallet) form.reset({ reason: '' })
  }, [wallet, form])

  const submit = form.handleSubmit(async ({ reason }) => {
    if (!wallet) return
    try {
      await rejectWallet({ id: wallet.id, reason }).unwrap()
      feedback.success('Đã từ chối KYB ví doanh nghiệp')
      onClose()
    } catch {
      feedback.error(
        'Không thể từ chối hồ sơ. Vui lòng tải lại danh sách và kiểm tra trạng thái hồ sơ.'
      )
    }
  })

  return (
    <DialogModal
      open={wallet !== null}
      title='Từ chối KYB ví doanh nghiệp'
      okText='Từ chối'
      okButtonProps={{ danger: true, disabled: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      confirmLoading={isLoading}
      closable={!isLoading}
      maskClosable={!isLoading}
      onCancel={onClose}
      onOk={() => void submit()}
    >
      <form
        className='flex flex-col gap-3'
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <p className='text-sm text-foreground'>
          Từ chối hồ sơ ví{' '}
          <strong>{wallet?.legalName || wallet?.registeredEmail}</strong>? Lý do
          sẽ được gửi nguyên văn tới email đăng ký của ví.
        </p>
        <FormTextArea
          control={form.control}
          name='reason'
          label='Lý do từ chối'
          placeholder='Nêu rõ thông tin thiếu hoặc sai để chủ ví chỉnh sửa'
          rows={4}
          maxLength={KYB_REJECT_REASON_MAX_LENGTH}
          showCount
          className='flex flex-col'
        />
      </form>
    </DialogModal>
  )
}
