import { useState } from 'react'
import { DialogModal, TextArea } from '@components/index'
import { CredentialFormError } from '../../merchant-gateway/key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../merchant-gateway/key-connection/components/CredentialOtpDialog'
import {
  MAX_NOTE_LENGTH,
  MIN_NOTE_LENGTH
} from '../constants/reconciliation.constants'
import { useConfirmHandled } from '../hooks/useConfirmHandled'
import type { SettlementPause } from '../types/reconciliation.types'
import { isNoteValid } from '../utils/reconciliation.utils'
import { SubMerchantName } from './SubMerchantName'

interface ConfirmHandledDialogProps {
  pause: SettlementPause
  onClose: () => void
}

interface NoteFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  invalid: boolean
  onChange: (value: string) => void
}

function NoteField({
  id,
  label,
  value,
  placeholder,
  invalid,
  onChange
}: NoteFieldProps) {
  return (
    <div>
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor={id}
      >
        {label} <span className='text-danger-strong'>*</span>
      </label>
      <TextArea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        placeholder={placeholder}
        status={invalid ? 'error' : undefined}
      />
      {invalid && (
        <p
          role='alert'
          className='mt-1 text-xs text-danger-strong'
        >
          {label} cần tối thiểu {MIN_NOTE_LENGTH} ký tự.
        </p>
      )}
    </div>
  )
}

/**
 * "Xác nhận đã xử lý": BE chạy lại đối soát và chỉ gỡ tạm dừng khi cả chín phương
 * trình cân. Mã OTP bị tiêu trước các kiểm tra còn lại nên FE kiểm nội dung trước khi xin mã.
 */
export function ConfirmHandledDialog({
  pause,
  onClose
}: ConfirmHandledDialogProps) {
  const [cause, setCause] = useState('')
  const [treatment, setTreatment] = useState('')
  const [touched, setTouched] = useState(false)
  const { otp, start } = useConfirmHandled(onClose)
  const causeInvalid = touched && !isNoteValid(cause)
  const treatmentInvalid = touched && !isNoteValid(treatment)

  const submit = () => {
    setTouched(true)
    if (!isNoteValid(cause) || !isNoteValid(treatment)) return
    void start(pause.subMerchantId, cause, treatment)
  }

  return (
    <DialogModal
      open
      title='Xác nhận đã xử lý tạm dừng quyết toán'
      okText='Xin mã OTP và xác nhận'
      okButtonProps={{ loading: otp.isPreparing }}
      onCancel={onClose}
      onOk={submit}
    >
      <div className='flex flex-col gap-3'>
        <SubMerchantName subId={pause.subMerchantId} />
        <p className='rounded-lg border border-border bg-muted p-3 text-xs leading-relaxed text-muted-foreground'>
          {pause.reason}
        </p>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          Hệ thống chạy lại đối soát ngay khi xác nhận và chỉ gỡ tạm dừng khi cả
          chín phương trình cân. Màn này không sửa số dư; nguyên nhân phải được
          xử lý trước ở bộ phận liên quan. Mã OTP chỉ dùng một lần, nếu thao tác
          bị từ chối bạn cần xin mã mới.
        </p>
        <NoteField
          id='reconciliation-cause'
          label='Nguyên nhân gây lệch'
          value={cause}
          placeholder='Nguyên nhân gây lệch'
          invalid={causeInvalid}
          onChange={setCause}
        />
        <NoteField
          id='reconciliation-treatment'
          label='Cách đã xử lý'
          value={treatment}
          placeholder='Cách đã xử lý'
          invalid={treatmentInvalid}
          onChange={setTreatment}
        />
        <CredentialFormError message={otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
