import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormTextArea } from '@components/form'
import { Can } from '@/app/permissions'
import { ProhibitIcon } from '@components/icons'
import { DialogModal } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useCancelEKYCMutation } from '@services/apiEKYC'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import {
  EKYC_CANCEL_REASON_MAX_LENGTH,
  ekycCancelSchema,
  type EkycCancelFormValues
} from '../schemas/ekycCancel.schema'
import { getEkycErrorDetail } from '../utils/ekycError'
import { EkycIconButton } from './EkycIconButton'

interface EkycCancelActionProps {
  record: EKYCListItem
}

const DEFAULT_ERROR =
  'Không hủy được eKYC. Vui lòng tải lại danh sách và thử lại.'

export const EkycCancelAction = ({ record }: EkycCancelActionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { successMess } = useMessage()
  const [cancelEkyc, { isLoading }] = useCancelEKYCMutation()
  const { control, handleSubmit, reset } = useForm<EkycCancelFormValues>({
    resolver: zodResolver(ekycCancelSchema),
    defaultValues: { reason: '' }
  })
  const profileId = record.profileId
  if (!profileId || record.profileStatus !== 'VERIFIED') return null

  const customer = record.fullName ?? record.username ?? 'khách hàng này'

  const close = (): void => {
    if (isLoading) return
    setIsOpen(false)
    setError(null)
    reset()
  }

  const handleConfirm = async ({
    reason
  }: EkycCancelFormValues): Promise<void> => {
    setError(null)
    try {
      await cancelEkyc({ profileId, reason }).unwrap()
      close()
      successMess('Đã hủy eKYC của hồ sơ.')
    } catch (cause) {
      setError(getEkycErrorDetail(cause) ?? DEFAULT_ERROR)
    }
  }

  return (
    <Can
      screen='CONFIRM_EKYC'
      action='cancel'
    >
      <EkycIconButton
        tone='danger'
        label='Hủy eKYC'
        aria-label={`Hủy eKYC ${customer}`}
        icon={
          <ProhibitIcon
            aria-hidden
            size={18}
          />
        }
        onClick={() => setIsOpen(true)}
      />
      <DialogModal
        mode='DELETE'
        open={isOpen}
        title={<span className='text-danger-strong'>Hủy eKYC</span>}
        okText='Hủy eKYC'
        cancelText='Giữ nguyên'
        confirmLoading={isLoading}
        onOk={() => void handleSubmit(handleConfirm)()}
        onCancel={close}
        content={
          <div className='flex flex-col gap-3 text-sm leading-5'>
            <p className='m-0'>
              Hồ sơ của <span className='font-semibold'>{customer}</span> sẽ
              chuyển từ <span className='font-medium'>Đã xác thực</span> sang{' '}
              <span className='font-medium'>Đã thu hồi</span>. Thao tác được ghi
              lại theo tài khoản của bạn.
            </p>
            <FormTextArea
              control={control}
              name='reason'
              label='Lý do hủy'
              required
              className='flex flex-col gap-1'
              rows={3}
              maxLength={EKYC_CANCEL_REASON_MAX_LENGTH}
              showCount
              placeholder='Nhập lý do hủy (tối thiểu 10 ký tự)'
            />
            {error && (
              <p
                role='alert'
                className='m-0 rounded-lg border border-danger-strong p-3 text-danger-strong'
              >
                {error}
              </p>
            )}
          </div>
        }
      />
    </Can>
  )
}
