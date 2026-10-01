import { useState } from 'react'

import { Can } from '@/app/permissions'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined
} from '@components/icons'
import {
  ButtonComponent,
  PopoverComponent,
  TooltipComponent
} from '@components/index'

import type { BusinessWalletRow } from '../types/business-wallet.type'

interface KybReviewActionProps {
  row: BusinessWalletRow
  onApprove: (row: BusinessWalletRow) => void
  onReject: (row: BusinessWalletRow) => void
}

export function KybReviewAction({
  row,
  onApprove,
  onReject
}: KybReviewActionProps) {
  const [open, setOpen] = useState(false)
  const name = row.legalName || row.registeredEmail

  const choose = (handler: (row: BusinessWalletRow) => void): void => {
    setOpen(false)
    handler(row)
  }

  const content = (
    <div className='flex flex-col gap-2'>
      <Can
        screen='BUSINESS_WALLET_ACCOUNT'
        action='approve'
      >
        <ButtonComponent
          htmlType='button'
          type='default'
          size='small'
          icon={<CheckCircleOutlined aria-hidden />}
          content='Chấp nhận'
          aria-label={`Chấp nhận KYB ví ${name}`}
          onClick={() => choose(onApprove)}
        />
      </Can>
      <Can
        screen='BUSINESS_WALLET_ACCOUNT'
        action='reject'
      >
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          size='small'
          icon={<CloseCircleOutlined aria-hidden />}
          content='Từ chối'
          aria-label={`Từ chối KYB ví ${name}`}
          onClick={() => choose(onReject)}
        />
      </Can>
    </div>
  )

  return (
    <PopoverComponent
      title='Phê duyệt KYB'
      content={content}
      trigger='click'
      placement='bottomRight'
      open={open}
      onOpenChange={setOpen}
    >
      <span className='inline-flex'>
        <TooltipComponent title='Phê duyệt KYB'>
          <ButtonComponent
            htmlType='button'
            type='default'
            size='small'
            icon={<SafetyOutlined aria-hidden />}
            aria-label={`Phê duyệt KYB ví ${name}`}
          />
        </TooltipComponent>
      </span>
    </PopoverComponent>
  )
}
