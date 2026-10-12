import { useState } from 'react'
import { Can } from '@/app/permissions'
import { ArrowCounterClockwiseIcon } from '@components/icons'
import { DialogModal } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useRestoreVerifiedKycProfileMutation } from '@services/apiEKYC'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { getEkycErrorDetail } from '../utils/ekycError'
import { EkycIconButton } from './EkycIconButton'

interface EkycRestoreActionProps {
  record: EKYCListItem
}

const DEFAULT_ERROR =
  'Không mở lại được eKYC. Vui lòng tải lại danh sách và thử lại.'
const DEFAULT_SUCCESS = 'Khôi phục eKYC thành công'

export const EkycRestoreAction = ({ record }: EkycRestoreActionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { successMess } = useMessage()
  const [restoreEkyc, { isLoading }] = useRestoreVerifiedKycProfileMutation()
  const profileId = record.profileId
  if (!profileId || record.profileStatus !== 'INVALID') return null

  const customer = record.fullName ?? record.username ?? 'khách hàng này'

  const close = (): void => {
    if (isLoading) return
    setIsOpen(false)
    setError(null)
  }

  const handleConfirm = async (): Promise<void> => {
    if (isLoading) return
    setError(null)
    try {
      const result = await restoreEkyc(profileId).unwrap()
      setIsOpen(false)
      successMess(result.detail ?? DEFAULT_SUCCESS)
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
        tone='success'
        label='Mở lại eKYC'
        aria-label={`Mở lại eKYC ${customer}`}
        icon={
          <ArrowCounterClockwiseIcon
            aria-hidden
            size={18}
          />
        }
        onClick={() => setIsOpen(true)}
      />
      <DialogModal
        open={isOpen}
        title='Mở lại eKYC'
        okText='Mở lại eKYC'
        cancelText='Giữ nguyên'
        confirmLoading={isLoading}
        onOk={() => void handleConfirm()}
        onCancel={close}
        content={
          <div className='flex flex-col gap-3 text-sm leading-5'>
            <p className='m-0'>
              Hồ sơ của <span className='font-semibold'>{customer}</span> sẽ
              chuyển từ <span className='font-medium'>Đã thu hồi</span> sang{' '}
              <span className='font-medium'>Chờ xác thực lại</span>.
            </p>
            <p className='m-0'>
              Người dùng sẽ phải eKYC lại và sẽ nhận thông báo (push, và email
              nếu có). Người dùng phải dùng cùng số thẻ căn cước/CCCD với hồ sơ
              cũ. Thao tác được ghi lại theo tài khoản của bạn và không thể hoàn
              tác từ CMS.
            </p>
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
