import { useState } from 'react'
import type { ContentMerchant } from '@type/merchant'
import { DialogModal, Input, TextArea, feedback } from '@components/index'
import { useGetTerminationObligationsQuery } from '@services/apiMerchant'
import { BankAccountOtpDialog } from '../../bank-account/components/BankAccountOtpDialog'
import { useTerminateMerchant } from '../hooks/useTerminateMerchant'
import { matchesMerchantConfirmation } from '../utils/terminate.utils'
import { terminateSchema } from '../schemas/terminate.schema'
import { TerminateResultDialog } from './TerminateResultDialog'
import { TerminationObligationList } from './TerminationObligationList'

interface TerminateMerchantDialogProps {
  merchant: ContentMerchant | null
  onClose: () => void
}

export function TerminateMerchantDialog({
  merchant,
  onClose
}: TerminateMerchantDialogProps) {
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const flow = useTerminateMerchant(merchant)
  // Mỗi lần mở dialog đều tải lại (apiMerchant bật refetchOnMountOrArgChange).
  const obligations = useGetTerminationObligationsQuery(merchant?.id ?? '', {
    skip: !merchant
  })
  const openObligations = obligations.data ?? []
  const isBlocked =
    obligations.isFetching || obligations.isError || openObligations.length > 0

  const close = () => {
    setReason('')
    setConfirmation('')
    flow.otp.reset()
    flow.clearResult()
    onClose()
  }

  const parseForm = () => {
    const parsed = terminateSchema.safeParse({ reason, confirmation })
    if (!parsed.success) feedback.warning(parsed.error.issues[0].message)
    return parsed.success ? parsed.data : null
  }

  const handleRequestOtp = async () => {
    const form = parseForm()
    if (!form || !merchant || isBlocked) return
    if (!matchesMerchantConfirmation(merchant, form.confirmation)) {
      feedback.warning('Chuỗi xác nhận không khớp mã hoặc tên merchant')
      return
    }
    await flow.requestOtp()
  }

  const handleConfirm = async () => {
    const form = parseForm()
    if (form) await flow.submit(form)
  }

  if (flow.result)
    return (
      <TerminateResultDialog
        result={flow.result}
        onClose={close}
      />
    )

  return (
    <>
      <DialogModal
        open={merchant !== null}
        title='Chấm dứt hợp tác merchant'
        onCancel={close}
        onOk={() => void handleRequestOtp()}
        okButtonProps={{
          loading: flow.otp.isRequesting,
          disabled: isBlocked,
          danger: true
        }}
        okText='Gửi mã OTP'
      >
        <div className='space-y-3'>
          <p className='text-sm'>
            Chấm dứt hợp tác <strong>{merchant?.name}</strong> ({merchant?.code}
            ). Thao tác không thể hoàn tác.
          </p>
          <TerminationObligationList
            obligations={openObligations}
            isFetching={obligations.isFetching}
            isError={obligations.isError}
            error={obligations.error}
            onRetry={() => void obligations.refetch()}
          />
          <TextArea
            aria-label='Lý do'
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder='Nhập lý do'
          />
          <Input
            aria-label='Nhập lại mã hoặc tên merchant'
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            maxLength={255}
            placeholder='Nhập lại mã hoặc tên merchant để xác nhận'
          />
        </div>
      </DialogModal>
      <BankAccountOtpDialog
        otp={flow.otp}
        loading={flow.isSubmitting}
        onConfirm={() => void handleConfirm()}
      />
    </>
  )
}
