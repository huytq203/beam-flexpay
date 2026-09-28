import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { CardComponent } from '@components/index'
import type { ContentMerchant } from '@type/merchant'
import { MerchantDocumentList } from './MerchantDocumentList'

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className='min-w-0'>
    <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
    <dd className='mt-1 break-words text-sm font-medium text-foreground'>
      {value || '—'}
    </dd>
  </div>
)

export function MerchantDetailsSections({ data }: { data: ContentMerchant }) {
  return (
    <>
      <CardComponent
        title='Thông tin Merchant'
        className='border border-border bg-background shadow-none'
      >
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <Field
            label='ID'
            value={data.id}
          />
          <Field
            label='Mã merchant'
            value={data.code}
          />
          <Field
            label='Tên hiển thị'
            value={data.name}
          />
          <Field
            label='Tên pháp lý'
            value={data.legalName}
          />
          <Field
            label='Mã số thuế'
            value={data.taxCode}
          />
          <Field
            label='Loại merchant'
            value={data.merchantType}
          />
          <Field
            label='MCC'
            value={data.mccCode}
          />
          <Field
            label='Ngành nghề'
            value={data.businessCategory}
          />
          <Field
            label='Email liên hệ'
            value={data.contactEmail}
          />
          <Field
            label='Điện thoại liên hệ'
            value={data.contactPhone}
          />
          <Field
            label='Website'
            value={data.websiteUrl}
          />
          <Field
            label='Liên hệ hỗ trợ'
            value={data.supportContact}
          />
          <Field
            label='Ngày tạo'
            value={formatUTCToLocalDateTime(data.createdAt)}
          />
          <Field
            label='Ngày cập nhật'
            value={formatUTCToLocalDateTime(data.updatedAt)}
          />
        </dl>
      </CardComponent>
      <CardComponent
        title='Hồ sơ & tài liệu'
        className='border border-border bg-background shadow-none'
      >
        <dl className='mb-4'>
          <Field
            label='Mô tả sản phẩm / dịch vụ'
            value={data.productDescription}
          />
        </dl>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <MerchantDocumentList
            merchantId={data.id}
            title='Hợp đồng'
            files={data.contractFile ? [data.contractFile] : []}
          />
          <MerchantDocumentList
            merchantId={data.id}
            title='Logo'
            files={data.logoFile ? [data.logoFile] : []}
          />
          <div className='sm:col-span-2'>
            <MerchantDocumentList
              merchantId={data.id}
              title='Ảnh sản phẩm'
              files={data.productImages ?? []}
            />
          </div>
        </div>
      </CardComponent>
    </>
  )
}
