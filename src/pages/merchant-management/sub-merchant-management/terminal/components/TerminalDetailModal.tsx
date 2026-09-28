import { useGetTerminalDetailQuery } from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, DialogModal, TagComponent } from '@components/index'

interface TerminalDetailModalProps {
  terminalId?: string
  onClose: () => void
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return <div className='min-w-0'><dt className='text-xs text-muted-foreground'>{label}</dt><dd className='mt-1 break-words text-sm font-medium text-foreground'>{value || '—'}</dd></div>
}

export function TerminalDetailModal({ terminalId, onClose }: TerminalDetailModalProps) {
  const detail = useGetTerminalDetailQuery(terminalId ?? '', { skip: !terminalId })
  const row = detail.data
  return <DialogModal open={Boolean(terminalId)} title='Chi tiết Terminal' width={{ xs: '95%', md: 760 }} footer={null} onCancel={onClose} onOk={onClose}>
    {detail.isLoading && <p role='status' className='py-8 text-center text-sm text-muted-foreground'>Đang tải chi tiết Terminal…</p>}
    {detail.isError && <div role='alert' className='flex items-center justify-between gap-3 py-4 text-sm text-danger-strong'>Không tải được chi tiết Terminal.<ButtonComponent type='default' size='small' content='Thử lại' onClick={() => void detail.refetch()} /></div>}
    {row && <div className='space-y-5'>
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4'>
        <div><h2 className='text-lg font-semibold text-foreground'>{row.name}</h2><p className='mt-1 font-mono text-sm text-muted-foreground'>{row.tid}</p></div>
        <TagComponent color={row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'warning' : 'default'}>{row.status === 'ACTIVE' ? 'Hoạt động' : row.status === 'INACTIVE' ? 'Không hoạt động' : 'Đã kết thúc'}</TagComponent>
      </div>
      <dl className='grid gap-x-6 gap-y-5 sm:grid-cols-2'>
        <DetailField label='Loại Terminal' value={row.terminalType} />
        <DetailField label='Sub-merchant' value={row.subMerchantName} />
        <DetailField label='Mã Sub-merchant' value={row.subMerchantCode} />
        <DetailField label='Merchant cha' value={row.merchantName} />
        <DetailField label='Địa chỉ điểm bán' value={row.address} />
        <DetailField label='Người liên hệ' value={row.contactPerson} />
        <DetailField label='Số điện thoại' value={row.contactPhone?.value} />
        <DetailField label='Nguồn số điện thoại' value={row.contactPhone?.inherited ? 'Kế thừa từ Sub-merchant' : 'Riêng Terminal'} />
        <DetailField label='Ngày tạo' value={formatUTCToLocalDateTime(row.createdAt)} />
        <DetailField label='Cập nhật lần cuối' value={formatUTCToLocalDateTime(row.updatedAt)} />
      </dl>
      {row.note && <div className='border-t border-border pt-4'><p className='text-xs text-muted-foreground'>Ghi chú</p><p className='mt-1 whitespace-pre-wrap text-sm text-foreground'>{row.note}</p></div>}
    </div>}
  </DialogModal>
}
