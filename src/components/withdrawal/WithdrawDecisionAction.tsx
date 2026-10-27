import { useState } from 'react'
import { PERMISSION, useAccess } from '@/app/permissions'
import { CheckOutlined } from '@components/icons'
import {
  ButtonComponent,
  PopoverComponent,
  ReasonDialog,
  TooltipComponent
} from '@components/index'
import { useWithdrawalDecision } from './useWithdrawalDecision'
import {
  WITHDRAWAL_NOTE_MAX_LENGTH,
  WITHDRAWAL_NOTE_MIN_LENGTH,
  WITHDRAWAL_REASON_MAX_LENGTH,
  WITHDRAWAL_REASON_MIN_LENGTH
} from '@type/withdrawalApproval.type'

export interface WithdrawDecisionActionProps {
  transactionCode: string
}

type Decision = 'approve' | 'reject'

/** Popover chỉ chọn nhánh; mỗi nhánh cần lý do nên mở dialog riêng để xác nhận. */
export const WithdrawDecisionAction = ({
  transactionCode
}: WithdrawDecisionActionProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(null)
  const { has } = useAccess()
  const { approve, reject, isApproving, isRejecting } =
    useWithdrawalDecision(transactionCode)

  if (!has(PERMISSION.EWALLET_FULL)) return null

  const choose = (next: Decision) => () => {
    setPopoverOpen(false)
    setDecision(next)
  }

  const content = (
    <div className='flex w-72 max-w-full min-w-0 flex-col gap-3'>
      <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-foreground'>
        Chọn kết quả cho lệnh rút{' '}
        <span className='font-semibold'>“{transactionCode}”</span>.
      </p>
      <div className='grid grid-cols-2 gap-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          content='Từ chối'
          className='w-full'
          onClick={choose('reject')}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Duyệt'
          className='w-full'
          onClick={choose('approve')}
        />
      </div>
    </div>
  )

  return (
    <>
      <PopoverComponent
        open={popoverOpen}
        trigger='click'
        placement='bottomRight'
        destroyOnHidden
        title='Phê duyệt lệnh rút'
        content={content}
        onOpenChange={setPopoverOpen}
      >
        <span className='inline-flex'>
          <TooltipComponent title={popoverOpen ? '' : 'Phê duyệt'}>
            <ButtonComponent
              htmlType='button'
              size='small'
              type='default'
              aria-label={`Phê duyệt lệnh rút ${transactionCode}`}
              icon={<CheckOutlined aria-hidden />}
            />
          </TooltipComponent>
        </span>
      </PopoverComponent>

      <ReasonDialog
        open={decision === 'approve'}
        title='Duyệt lệnh rút vượt ngưỡng'
        description='Duyệt xong hệ thống sẽ chi tiền cho khách. Thao tác này không hoàn tác được.'
        label='Lý do duyệt'
        placeholder='Ví dụ: đã đối chiếu hồ sơ khách hàng và nguồn tiền, đồng ý chi'
        okText='Xác nhận duyệt'
        minLength={WITHDRAWAL_NOTE_MIN_LENGTH}
        maxLength={WITHDRAWAL_NOTE_MAX_LENGTH}
        confirmLoading={isApproving}
        onConfirm={(note) => {
          void approve(note).then((done) => done && setDecision(null))
        }}
        onCancel={() => setDecision(null)}
      />

      <ReasonDialog
        open={decision === 'reject'}
        title='Từ chối lệnh rút'
        description='Toàn bộ tiền bị giữ, gồm cả phí, sẽ được trả về ví khách ngay.'
        label='Lý do từ chối'
        hint={`Tối đa ${WITHDRAWAL_REASON_MAX_LENGTH} ký tự, hiển thị được với khách`}
        placeholder='Ví dụ: tài khoản nhận không khớp tên chủ thẻ'
        okText='Xác nhận từ chối'
        danger
        minLength={WITHDRAWAL_REASON_MIN_LENGTH}
        maxLength={WITHDRAWAL_REASON_MAX_LENGTH}
        confirmLoading={isRejecting}
        onConfirm={(reason) => {
          void reject(reason).then((done) => done && setDecision(null))
        }}
        onCancel={() => setDecision(null)}
      />
    </>
  )
}
