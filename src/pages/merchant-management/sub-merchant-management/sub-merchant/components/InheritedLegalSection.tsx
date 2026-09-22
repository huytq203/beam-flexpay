import { CardComponent, Input } from '@components/index'

import type { SubMerchantRow } from '../types/subMerchant.type'

interface InheritedLegalSectionProps {
  parent?: SubMerchantRow
}

export function InheritedLegalSection({ parent }: InheritedLegalSectionProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='inherited-legal-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='inherited-legal-title'>Hồ sơ pháp lý kế thừa</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Dữ liệu chỉ đọc, đồng bộ từ Merchant cha đã chọn.</p>
        </header>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <label className='flex flex-col gap-1.5 text-sm font-medium text-foreground'>
            Mã số thuế
            <Input aria-label='Mã số thuế' className='bg-muted/50!' readOnly value={parent?.taxCode ?? 'Chọn Merchant cha để xem'} />
          </label>
          <label className='flex flex-col gap-1.5 text-sm font-medium text-foreground'>
            Người đại diện pháp luật
            <Input aria-label='Người đại diện pháp luật' className='bg-muted/50!' readOnly value={parent?.legalRepresentative ?? 'Chọn Merchant cha để xem'} />
          </label>
        </div>
      </section>
    </CardComponent>
  )
}
