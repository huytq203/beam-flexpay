import { useState } from 'react'
import { Popover } from 'antd'
import { Can } from '@/app/permissions'
import { CheckOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { EkycIconButton } from './EkycIconButton'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { getReviewSessionId } from '../utils/ekycReviewTarget'

interface Props {
  record: EKYCListItem
  onReview: (record: EKYCListItem, decision: 'approve' | 'reject') => void
}

export function EkycReviewActions({ record, onReview }: Props) {
  const [open, setOpen] = useState(false)
  const sessionId = getReviewSessionId(record)
  if (!sessionId) return null

  const choose = (decision: 'approve' | 'reject') => {
    setOpen(false)
    onReview(record, decision)
  }

  return (
    <Can
      screen='CONFIRM_EKYC'
      action='approve'
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement='bottomRight'
        trigger='click'
        title='Xét duyệt phiên mới nhất'
        content={
          <div className='flex min-w-44 flex-col gap-2'>
            <ButtonComponent
              type='default'
              size='small'
              content='Chấp nhận'
              onClick={() => choose('approve')}
            />
            <ButtonComponent
              type='default'
              size='small'
              danger
              content='Từ chối'
              onClick={() => choose('reject')}
            />
          </div>
        }
      >
        <span className='inline-flex'>
          <EkycIconButton
            tone='success'
            label='Xét duyệt'
            aria-label={`Xét duyệt eKYC ${record.fullName ?? record.username ?? ''}`}
            icon={<CheckOutlined aria-hidden />}
          />
        </span>
      </Popover>
    </Can>
  )
}
