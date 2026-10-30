import { HandCoinsIcon } from '@phosphor-icons/react'
import { ButtonComponent, TooltipComponent } from '@components/index'
import type { EscrowRow } from '../types/merchantEscrow.types'
import {
  CREATE_ORDER_LABEL,
  createOrderBlockReason
} from '../utils/escrowOrder.schema'

/**
 * Nút icon "Tạo lệnh nạp ký quỹ" trên dòng danh sách (SRS 3.6.26 STT 14). Vô hiệu kèm tooltip lý do
 * khi Master chưa cấu hình hoặc mức yêu cầu bằng 0; nút vô hiệu được bọc span để tooltip vẫn hiện.
 */
export function EscrowCreateOrderAction({
  row,
  onCreate
}: {
  row: EscrowRow
  onCreate: (row: EscrowRow) => void
}) {
  const reason = createOrderBlockReason(
    row.state !== 'NOT_CONFIGURED',
    row.requiredAmount
  )
  const button = (
    <ButtonComponent
      aria-label={CREATE_ORDER_LABEL}
      htmlType='button'
      type='default'
      size='small'
      className='border-border! bg-background! text-foreground! shadow-none! hover:bg-muted!'
      icon={<HandCoinsIcon aria-hidden size={16} />}
      disabled={reason !== null}
      onClick={() => onCreate(row)}
    />
  )
  return (
    <TooltipComponent title={reason ?? CREATE_ORDER_LABEL}>
      {reason ? <span className='inline-block'>{button}</span> : button}
    </TooltipComponent>
  )
}
