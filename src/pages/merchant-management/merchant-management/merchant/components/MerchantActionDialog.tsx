import { DialogModal, TextArea } from '@components/index'
import { MERCHANT_ACTION_LABEL } from '../constants/merchantDetail.constants'
import type { MerchantDetailActions } from '../hooks/useMerchantDetailActions'
import { RejectReasonSelect } from './RejectReasonSelect'

interface MerchantActionDialogProps {
  merchantName?: string
  actions: MerchantDetailActions
}

export function MerchantActionDialog({
  merchantName,
  actions
}: MerchantActionDialogProps) {
  const { action } = actions
  const needsReason =
    action === 'reject' || action === 'lock' || action === 'unlock'

  return (
    <DialogModal
      open={action !== null}
      title={action ? MERCHANT_ACTION_LABEL[action] : ''}
      onCancel={actions.close}
      onOk={() => void actions.confirm()}
      okButtonProps={{ loading: actions.isWorking }}
      okText='Xác nhận'
    >
      <p className='mb-3 text-sm text-foreground'>
        Xác nhận{' '}
        {action ? MERCHANT_ACTION_LABEL[action].toLocaleLowerCase('vi-VN') : ''}{' '}
        cho <strong>{merchantName}</strong>?
      </p>
      {action === 'reject' && (
        <RejectReasonSelect
          value={actions.reasonCode}
          onPick={actions.pickReason}
        />
      )}
      {needsReason && (
        <TextArea
          aria-label={action === 'reject' ? 'Ghi chú chi tiết' : 'Lý do'}
          maxLength={500}
          rows={3}
          value={actions.reason}
          placeholder={
            action === 'reject' ? 'Nhập ghi chú cho merchant' : 'Nhập lý do'
          }
          onChange={(event) => actions.setReason(event.target.value)}
        />
      )}
    </DialogModal>
  )
}
