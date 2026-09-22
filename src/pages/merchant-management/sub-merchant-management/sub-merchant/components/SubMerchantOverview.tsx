import { CardComponent } from '@components/index'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import type { SubMerchantRow } from '../types/subMerchant.type'

interface SubMerchantOverviewProps {
  record: SubMerchantRow
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='min-w-0 space-y-1'>
    <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
    <dd className='break-words text-sm font-medium text-foreground'>{value}</dd>
  </div>
)

export function SubMerchantOverview({ record }: SubMerchantOverviewProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='sub-merchant-overview-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='sub-merchant-overview-title'>Hồ sơ tổng quan</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Thông tin điểm kinh doanh và dữ liệu pháp lý kế thừa từ Merchant cha.</p>
        </header>
        <dl className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3'>
          <DetailItem label='Trạng thái' value={<ManagementStatusTag status={record.status} />} />
          <DetailItem label='Merchant cha' value={`${record.parentMerchantName} (${record.parentMerchantCode})`} />
          <DetailItem label='Lĩnh vực kinh doanh' value={record.businessField} />
          <DetailItem label='Số điện thoại' value={`${record.phone}${record.phoneInherited ? ' · Kế thừa' : ''}`} />
          <DetailItem label='Email' value={record.email} />
          <DetailItem label='Địa chỉ' value={`${record.address}${record.addressInherited ? ' · Kế thừa' : ''}`} />
          <DetailItem label='Mã số thuế' value={record.taxCode} />
          <DetailItem label='Người đại diện pháp luật' value={record.legalRepresentative} />
          <DetailItem label='Cập nhật gần nhất' value={record.updatedAt} />
        </dl>
      </section>
    </CardComponent>
  )
}
