import { useState } from 'react'
import {
  useGetMasterRemovalPreviewQuery,
  useRemoveMasterSettlementConfigMutation
} from '@/app/services/merchantSettlementScopeApi'
import {
  ButtonComponent,
  DialogModal,
  TextArea,
  feedback
} from '@components/index'
import { MIN_REASON_LENGTH } from '../constants/settlementScope.constants'
import {
  getScopeErrorMessage,
  removalNeedsApprover
} from '../utils/settlementScope.utils'
import { ScopeConfigSummary } from './ScopeConfigSummary'

interface ScopeRemovalDialogProps {
  masterId: string
  onClose: () => void
}

export function ScopeRemovalDialog({
  masterId,
  onClose
}: ScopeRemovalDialogProps) {
  const preview = useGetMasterRemovalPreviewQuery(masterId)
  const [remove, { isLoading }] = useRemoveMasterSettlementConfigMutation()
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const trimmed = reason.trim()
  const reasonError =
    touched && trimmed.length < MIN_REASON_LENGTH
      ? `Lý do gỡ tối thiểu ${MIN_REASON_LENGTH} ký tự`
      : ''

  const confirm = async () => {
    setTouched(true)
    if (trimmed.length < MIN_REASON_LENGTH) return
    try {
      await remove({ id: masterId, reason: trimmed }).unwrap()
      feedback.success('Đã gỡ cấu hình riêng, Master quay về kế thừa hệ thống')
      onClose()
    } catch (error) {
      feedback.error(
        getScopeErrorMessage(error, 'Không thể gỡ cấu hình quyết toán')
      )
    }
  }

  const data = preview.data
  return (
    <DialogModal
      open
      title='Gỡ cấu hình quyết toán riêng của Master'
      okText='Gỡ cấu hình'
      okButtonProps={{
        danger: true,
        loading: isLoading,
        disabled: !data
      }}
      onCancel={onClose}
      onOk={() => void confirm()}
      width={760}
    >
      {preview.isLoading && <p aria-busy='true'>Đang tải xem trước...</p>}
      {preview.isError && (
        <div role='alert'>
          <p>Không tải được xem trước việc gỡ cấu hình.</p>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={() => void preview.refetch()}
          />
        </div>
      )}
      {data && (
        <div className='flex flex-col gap-4'>
          <p className='text-sm'>
            Sau khi gỡ, Master sẽ kế thừa mặc định hệ thống. Sub-merchant đang
            kế thừa Master sẽ chuyển theo hệ thống.
          </p>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div aria-label='Hiện tại'>
              <p className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>
                Hiện tại
              </p>
              <ScopeConfigSummary view={data.current} />
            </div>
            <div aria-label='Sau khi gỡ'>
              <p className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>
                Sau khi gỡ
              </p>
              <ScopeConfigSummary view={data.afterRemoval} />
            </div>
          </div>
          {removalNeedsApprover(data) && (
            <p
              className='text-sm text-warning-strong'
              role='note'
            >
              Việc gỡ này làm Master chuyển sang tự động hoặc rút ngắn T+N nên
              cần quyền phê duyệt cấu hình quyết toán.
            </p>
          )}
          <div>
            <TextArea
              aria-label='Lý do gỡ'
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              placeholder='Lý do gỡ (tối thiểu 10 ký tự)'
              rows={3}
              status={reasonError ? 'error' : undefined}
              value={reason}
            />
            {reasonError && (
              <p
                className='mt-1 text-xs text-danger-strong'
                role='alert'
              >
                {reasonError}
              </p>
            )}
          </div>
        </div>
      )}
    </DialogModal>
  )
}
