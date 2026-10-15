import { useState } from 'react'
import {
  useApproveSettlementChangeMutation,
  useGetSettlementChangesQuery,
  useRejectSettlementChangeMutation
} from '@/app/services/merchantSettlementApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  DialogModal,
  Table,
  TextArea,
  feedback
} from '@components/index'
import { createSettlementChangeColumns } from '../columns/settlementChange.columns'
import type { SettlementChangeDto } from '../types/settlementConfig.types'

interface SettlementChangesPanelProps {
  subId: string
}

type Decision = { row: SettlementChangeDto; kind: 'approve' | 'reject' }

export function SettlementChangesPanel({ subId }: SettlementChangesPanelProps) {
  const query = useGetSettlementChangesQuery(subId)
  const [approve, approveState] = useApproveSettlementChangeMutation()
  const [reject, rejectState] = useRejectSettlementChangeMutation()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [note, setNote] = useState('')

  const close = () => {
    setDecision(null)
    setNote('')
  }

  const confirm = async () => {
    if (!decision) return
    const changeId = decision.row.id
    try {
      if (decision.kind === 'approve') {
        await approve({ id: subId, changeId }).unwrap()
        feedback.success('Đã phê duyệt thay đổi cấu hình quyết toán')
      } else {
        await reject({
          id: subId,
          changeId,
          note: note.trim() || undefined
        }).unwrap()
        feedback.success('Đã từ chối thay đổi cấu hình quyết toán')
      }
      close()
    } catch (error) {
      feedback.error(getApiErrorDetail(error, 'Không thể xử lý đề xuất'))
    }
  }

  if (query.isError)
    return (
      <div role='alert'>
        <p>Không tải được danh sách đề xuất.</p>
        <ButtonComponent
          content='Thử lại'
          htmlType='button'
          onClick={() => void query.refetch()}
        />
      </div>
    )

  const isApprove = decision?.kind === 'approve'
  return (
    <section aria-label='Đề xuất nới lỏng cấu hình quyết toán'>
      <h2 className='mb-3 text-sm font-semibold'>Đề xuất nới lỏng</h2>
      <Table
        columns={createSettlementChangeColumns({
          onApprove: (row) => setDecision({ row, kind: 'approve' }),
          onReject: (row) => setDecision({ row, kind: 'reject' })
        })}
        dataSource={query.data ?? []}
        loading={query.isLoading}
        locale={{ emptyText: 'Chưa có đề xuất' }}
        pagination={false}
        rowKey='id'
        size='small'
      />
      <DialogModal
        open={decision !== null}
        title={isApprove ? 'Phê duyệt đề xuất' : 'Từ chối đề xuất'}
        okText={isApprove ? 'Duyệt' : 'Từ chối'}
        okButtonProps={{
          loading: approveState.isLoading || rejectState.isLoading,
          danger: !isApprove
        }}
        onCancel={close}
        onOk={() => void confirm()}
      >
        {isApprove ? (
          <p className='text-sm'>
            Áp dụng thay đổi cấu hình quyết toán này lên Sub-merchant?
          </p>
        ) : (
          <TextArea
            aria-label='Ghi chú'
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder='Ghi chú (không bắt buộc)'
            rows={3}
            value={note}
          />
        )}
      </DialogModal>
    </section>
  )
}
