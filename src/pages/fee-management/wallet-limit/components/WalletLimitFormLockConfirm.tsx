import { DialogModal } from '@components/index'
import {
  WalletLimitScope,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import {
  SCOPE_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { describePolicyTarget } from '../utils/walletLimit.paths'

interface WalletLimitFormLockConfirmProps {
  /** Giá trị sắp lưu; `null` = hộp thoại đóng. */
  values: WalletLimitFormValues | null
  onConfirm: () => void
  onCancel: () => void
}

const STOP_CLASS =
  'rounded-xl bg-danger/10 px-3 py-2 font-medium text-danger-strong'

const describeLock = (values: WalletLimitFormValues) => {
  const isSystem = values.scopeType === WalletLimitScope.SYSTEM
  const transactionLabel = TRANSACTION_TYPE_LABELS[values.transactionType]
  if (isSystem && values.transactionType === WalletLimitTransactionType.ALL) {
    return {
      title: 'Dừng mọi giao dịch của mọi ví?',
      body: (
        <p className={STOP_CLASS}>
          Khóa dòng Hệ thống / Tất cả loại giao dịch sẽ dừng mọi lệnh nạp, rút
          và chuyển mới của mọi ví ngay khi lưu. Đây là công tắc dừng khẩn cấp.
        </p>
      )
    }
  }
  if (isSystem) {
    return {
      title: `Khóa hạn mức Hệ thống · ${transactionLabel}?`,
      body: (
        <p className={STOP_CLASS}>
          Khóa sẽ chặn các giao dịch {transactionLabel.toLowerCase()} mới của
          mọi ví ngay khi lưu.
        </p>
      )
    }
  }
  return {
    title: 'Khóa cấu hình này?',
    body: (
      <p>
        Khóa chỉ bỏ qua lớp này: ví quay về áp lớp rộng hơn. Hạn mức của ví vì
        vậy được <b>nới</b> về mức rộng hơn, giao dịch không bị chặn.
      </p>
    )
  }
}

export function WalletLimitFormLockConfirm({
  values,
  onConfirm,
  onCancel
}: WalletLimitFormLockConfirmProps) {
  if (!values) return null
  const { title, body } = describeLock(values)
  const isSystem = values.scopeType === WalletLimitScope.SYSTEM
  return (
    <DialogModal
      open
      mode={isSystem ? 'DELETE' : 'CONFIRM'}
      title={title}
      okText='Xác nhận khóa'
      cancelText='Hủy'
      onOk={onConfirm}
      onCancel={onCancel}
    >
      <div className='flex flex-col gap-3 text-sm text-foreground'>
        <p>
          Cấu hình:{' '}
          <b>
            {describePolicyTarget(
              SCOPE_LABELS[values.scopeType],
              values.targetDisplay || null,
              TRANSACTION_TYPE_LABELS[values.transactionType]
            )}
          </b>
        </p>
        {body}
      </div>
    </DialogModal>
  )
}
