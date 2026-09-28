import { useGetSubMerchantDetailQuery } from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, DialogModal } from '@components/index'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { toSubMerchantRow } from '../../shared/hierarchyAdapter'

interface SubMerchantDetailModalProps {
  subMerchantId?: string
  onClose: () => void
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return <div className='min-w-0'>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='mt-1 break-words text-sm font-medium text-foreground'>{value || '—'}</dd>
  </div>
}

export function SubMerchantDetailModal({ subMerchantId, onClose }: SubMerchantDetailModalProps) {
  const detail = useGetSubMerchantDetailQuery(subMerchantId ?? '', { skip: !subMerchantId })
  const record = detail.data
  const row = record ? toSubMerchantRow(record) : undefined

  return <DialogModal
    open={Boolean(subMerchantId)}
    title='Chi tiết Sub-merchant'
    width={{ xs: '95%', md: 760 }}
    footer={null}
    onCancel={onClose}
    onOk={onClose}
  >
    {detail.isLoading && <p role='status' className='py-8 text-center text-sm text-muted-foreground'>Đang tải chi tiết Sub-merchant…</p>}
    {detail.isError && <div role='alert' className='flex items-center justify-between gap-3 py-4 text-sm text-danger-strong'>Không tải được chi tiết Sub-merchant.<ButtonComponent type='default' size='small' content='Thử lại' onClick={() => void detail.refetch()} /></div>}
    {record && <div className='space-y-5'>
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4'>
        <div>
          <h2 className='text-lg font-semibold text-foreground'>{record.name}</h2>
          <p className='mt-1 font-mono text-sm text-muted-foreground'>{record.code}</p>
        </div>
        {row && <ManagementStatusTag status={row.status} />}
      </div>
      <dl className='grid gap-x-6 gap-y-5 sm:grid-cols-2'>
        <DetailField label='Merchant cha' value={[record.merchantName, record.merchantCode].filter(Boolean).join(' · ')} />
        <DetailField label='Tên pháp lý' value={record.legalName} />
        <DetailField label='Mã số thuế' value={record.taxCode} />
        <DetailField label='Người đại diện' value={record.legalRepresentativeName} />
        <DetailField label='Lĩnh vực kinh doanh' value={record.businessField} />
        <DetailField label='Số điện thoại' value={record.phone?.value} />
        <DetailField label='Địa chỉ' value={record.address?.value} />
        <DetailField label='Ngày tạo' value={formatUTCToLocalDateTime(record.createdAt)} />
        <DetailField label='Ngày cập nhật' value={formatUTCToLocalDateTime(record.updatedAt)} />
      </dl>
    </div>}
  </DialogModal>
}
