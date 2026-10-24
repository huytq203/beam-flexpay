import { DialogModal, TextArea } from '@components/index'
import { AdminUserName } from '../../merchant-assignment/components/AdminUserName'
import type { useHoldRuleDecisions } from '../hooks/useHoldRuleDecisions'
import { HoldRuleConfigList } from './HoldRuleConfigList'
import { HoldRuleTargetCell } from './HoldRuleTargetCell'

interface HoldRuleDecisionDialogProps {
  flow: ReturnType<typeof useHoldRuleDecisions>
}

const COPY = {
  approve: { title: 'Phê duyệt quy tắc tạm giữ', ok: 'Duyệt' },
  reject: { title: 'Từ chối đề xuất quy tắc tạm giữ', ok: 'Từ chối' }
} as const

/** Hiện lại nội dung đề xuất và người đề xuất để người duyệt xem trước khi quyết định. */
export function HoldRuleDecisionDialog({ flow }: HoldRuleDecisionDialogProps) {
  const decision = flow.decision
  const kind = decision?.kind
  const row = decision?.row
  return (
    <DialogModal
      open={decision !== null}
      title={kind ? COPY[kind].title : ''}
      okText={kind ? COPY[kind].ok : 'Xác nhận'}
      okButtonProps={{ loading: flow.isLoading, danger: kind === 'reject' }}
      onCancel={flow.close}
      onOk={() => void flow.confirm()}
      width={640}
    >
      {row && (
        <div className='flex flex-col gap-3'>
          <dl className='m-0 grid grid-cols-3 gap-2 text-sm'>
            <dt className='text-muted-foreground'>Đối tượng</dt>
            <dd className='col-span-2 m-0'>
              <HoldRuleTargetCell
                level={row.targetLevel}
                targetId={row.targetId}
              />
            </dd>
            <dt className='text-muted-foreground'>Phiên bản</dt>
            <dd className='col-span-2 m-0'>{row.version}</dd>
            <dt className='text-muted-foreground'>Người đề xuất</dt>
            <dd className='col-span-2 m-0'>
              <AdminUserName userId={row.authorId} />
            </dd>
            <dt className='text-muted-foreground'>Lý do đề xuất</dt>
            <dd className='col-span-2 m-0'>{row.changeReason || '—'}</dd>
            <dt className='text-muted-foreground'>Cấu hình đề xuất</dt>
            <dd className='col-span-2 m-0'>
              <HoldRuleConfigList config={row.proposedConfig} />
            </dd>
          </dl>
          {kind === 'approve' ? (
            <p className='text-sm'>
              Sau khi duyệt, quy tắc có hiệu lực từ ngày bắt đầu đã chọn (nếu đã
              qua thì tính từ thời điểm duyệt) và Merchant bị ảnh hưởng sẽ nhận
              email thông báo.
            </p>
          ) : (
            <TextArea
              aria-label='Lý do từ chối'
              maxLength={500}
              onChange={(event) => flow.setReason(event.target.value)}
              placeholder='Lý do từ chối (không bắt buộc)'
              rows={3}
              value={flow.reason}
            />
          )}
        </div>
      )}
    </DialogModal>
  )
}
