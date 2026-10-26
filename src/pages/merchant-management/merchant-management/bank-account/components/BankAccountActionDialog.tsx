import { useState } from 'react'
import {
  useMakeBankAccountDefaultMutation,
  useSetBankAccountHoldModeMutation,
  type BankAccountDto,
  type SensitiveOtpConfirmation
} from '@/app/services/merchantBankAccountApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import type { BankAccountActionType } from '../columns/bankAccount.columns'
import { MIN_HOLD_REASON_LENGTH } from '../constants/bankAccount.constants'
import { useSensitiveOtp } from '../hooks/useSensitiveOtp'
import {
  PENDING_APPROVAL_MESSAGE,
  changeErrorMessage
} from '../utils/bankAccountErrors'
import { BankAccountActionInfo } from './BankAccountActionInfo'
import { BankAccountOtpDialog } from './BankAccountOtpDialog'

interface BankAccountActionDialogProps {
  type: Exclude<BankAccountActionType, 'verify'>
  row: BankAccountDto
  onClose: () => void
}

const titleOf = (
  type: BankAccountActionDialogProps['type'],
  row: BankAccountDto
): string => {
  if (type === 'default') return 'Đặt tài khoản mặc định'
  return row.holdMode ? 'Bỏ tạm giữ' : 'Tạm giữ tài khoản'
}

// Đặt mặc định đổi tài khoản nhận tiền nên cần OTP; tạm giữ chỉ cần lý do.
export function BankAccountActionDialog({
  type,
  row,
  onClose
}: BankAccountActionDialogProps) {
  const [reason, setReason] = useState('')
  const otp = useSensitiveOtp()
  const [makeDefault, defaultState] = useMakeBankAccountDefaultMutation()
  const [setHold, holdState] = useSetBankAccountHoldModeMutation()

  const confirm = async (confirmation?: SensitiveOtpConfirmation) => {
    const text = reason.trim()
    if (!text) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    if (
      type === 'hold' &&
      !row.holdMode &&
      text.length < MIN_HOLD_REASON_LENGTH
    ) {
      feedback.warning(
        `Lý do tạm giữ cần tối thiểu ${MIN_HOLD_REASON_LENGTH} ký tự`
      )
      return
    }
    if (type === 'default' && !confirmation) {
      await otp.request(row.id)
      return
    }
    try {
      if (type === 'default' && confirmation) {
        const result = await makeDefault({
          id: row.id,
          reason: text,
          otp: confirmation
        }).unwrap()
        feedback.success(
          result.applied || !result.pendingChangeRequest
            ? 'Đã đặt tài khoản mặc định'
            : PENDING_APPROVAL_MESSAGE
        )
      } else {
        await setHold({
          id: row.id,
          enabled: !row.holdMode,
          reason: text
        }).unwrap()
        feedback.success('Đã cập nhật tài khoản ngân hàng')
      }
      otp.reset()
      onClose()
    } catch (error) {
      feedback.error(
        changeErrorMessage(error, 'Không thể cập nhật tài khoản ngân hàng')
      )
    }
  }

  return (
    <>
      <DialogModal
        open
        title={titleOf(type, row)}
        onCancel={onClose}
        onOk={() => void confirm()}
        okButtonProps={{
          loading: defaultState.isLoading || holdState.isLoading
        }}
        okText='Xác nhận'
      >
        <BankAccountActionInfo
          type={type}
          row={row}
        />
        <TextArea
          aria-label='Lý do'
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder='Nhập lý do'
        />
      </DialogModal>
      <BankAccountOtpDialog
        otp={otp}
        loading={defaultState.isLoading}
        onConfirm={() => {
          const confirmation = otp.toConfirmation()
          if (confirmation) void confirm(confirmation)
        }}
      />
    </>
  )
}
