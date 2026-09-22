import { CardComponent } from '@components/index'

import type { ParentMerchantSource } from '../types/subMerchant.type'

interface InheritedLegalSectionProps {
  parent?: ParentMerchantSource
}

export function InheritedLegalSection({ parent }: InheritedLegalSectionProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='inherited-legal-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='inherited-legal-title'>Hồ sơ pháp lý kế thừa</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Dữ liệu chỉ đọc, đồng bộ từ Merchant cha đã chọn.</p>
        </header>
        <dl className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='rounded-lg border border-border bg-muted/30 px-3 py-2.5'>
            <dt className='text-xs font-medium text-muted-foreground'>Mã số thuế</dt>
            <dd className='mt-1 text-sm font-medium text-foreground'>
              {parent?.taxCode ?? 'Chọn Merchant cha để xem'}
            </dd>
          </div>
          <div className='rounded-lg border border-border bg-muted/30 px-3 py-2.5'>
            <dt className='text-xs font-medium text-muted-foreground'>Người đại diện pháp luật</dt>
            <dd className='mt-1 text-sm font-medium text-foreground'>
              {parent?.legalRepresentative ?? 'Chọn Merchant cha để xem'}
            </dd>
          </div>
        </dl>
      </section>
    </CardComponent>
  )
}
