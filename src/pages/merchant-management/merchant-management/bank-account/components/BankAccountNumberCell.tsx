import { useState } from 'react'

import { Can } from '@/app/permissions'
import { EyeFilled, EyeOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'

import { maskAccountNumber } from '../constants/bank-account.constant'

interface BankAccountNumberCellProps {
  accountNumber: string
  /** Dùng cho nhãn trợ năng để người dùng bàn phím biết đang mở số của ai. */
  ownerLabel: string
}

/**
 * Số tài khoản luôn hiển thị che. Nút mở đầy đủ chỉ tồn tại với vai trò được
 * cấp quyền `viewFullNumber` (NĐ 13/2023) — thiếu quyền là không render.
 */
export function BankAccountNumberCell({
  accountNumber,
  ownerLabel
}: BankAccountNumberCellProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <span className='inline-flex items-center gap-1'>
      <span className='font-medium text-foreground tabular-nums'>
        {isRevealed ? accountNumber : maskAccountNumber(accountNumber)}
      </span>
      <Can screen='MERCHANT_BANK_ACCOUNT' action='viewFullNumber'>
        <TooltipComponent
          title={isRevealed ? 'Ẩn số tài khoản' : 'Xem đầy đủ số tài khoản'}
        >
          <ButtonComponent
            htmlType='button'
            type='text'
            aria-pressed={isRevealed}
            aria-label={`${isRevealed ? 'Ẩn' : 'Xem đầy đủ'} số tài khoản của ${ownerLabel}`}
            icon={
              isRevealed ? <EyeFilled aria-hidden /> : <EyeOutlined aria-hidden />
            }
            onClick={() => setIsRevealed((current) => !current)}
            className='size-6! min-w-6! p-0! text-muted-foreground!'
          />
        </TooltipComponent>
      </Can>
    </span>
  )
}
