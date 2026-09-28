import type { ApiParentMerchant, ApiSubMerchantSummary, ApiTerminalType, HierarchyStatus } from '@/app/services/merchantHierarchyApi'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, CardComponent, Input, SelectComponent } from '@components/index'
import { statusOptions, typeOptions } from '../columns/terminalApi.columns'

interface TerminalApiFiltersProps {
  name: string
  merchantId?: string
  subMerchantId?: string
  terminalType?: ApiTerminalType
  status?: HierarchyStatus
  parents: ApiParentMerchant[]
  subs: ApiSubMerchantSummary[]
  onNameChange: (value: string) => void
  onMerchantChange: (value?: string) => void
  onSubChange: (value?: string) => void
  onTypeChange: (value?: ApiTerminalType) => void
  onStatusChange: (value?: HierarchyStatus) => void
  onClear: () => void
  onSearch: () => void
}

export function TerminalApiFilters(props: TerminalApiFiltersProps) {
  return <CardComponent className='border border-border bg-background shadow-none'>
    <form className='space-y-4' onSubmit={(event) => { event.preventDefault(); props.onSearch() }} onReset={props.onClear}>
      <div className='flex items-center gap-2 border-b border-border pb-3'>
        <FunnelIcon aria-hidden size={18} className='text-secondary-foreground' />
        <h2 className='font-display text-base font-semibold text-foreground'>Bộ lọc tìm kiếm</h2>
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <div><label className='mb-1 block text-sm font-medium text-foreground' htmlFor='terminal-search'>Tên Terminal</label><Input id='terminal-search' value={props.name} onChange={(event) => props.onNameChange(event.target.value)} placeholder='Tìm theo tên' /></div>
        <div><label className='mb-1 block text-sm font-medium text-foreground'>Merchant cha</label><SelectComponent aria-label='Merchant cha' allowClear className='w-full' showSearch optionFilterProp='label' value={props.merchantId} onChange={props.onMerchantChange} options={props.parents.map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` }))} placeholder='Tất cả Merchant' /></div>
        <div><label className='mb-1 block text-sm font-medium text-foreground'>Sub-merchant</label><SelectComponent aria-label='Sub-merchant' allowClear className='w-full' showSearch optionFilterProp='label' value={props.subMerchantId} onChange={props.onSubChange} options={props.subs.map((item) => ({ value: item.id, label: item.name }))} placeholder='Tất cả Sub-merchant' /></div>
        <div><label className='mb-1 block text-sm font-medium text-foreground'>Loại</label><SelectComponent aria-label='Loại' allowClear className='w-full' value={props.terminalType} onChange={props.onTypeChange} options={typeOptions} placeholder='Tất cả loại' /></div>
        <div><label className='mb-1 block text-sm font-medium text-foreground'>Trạng thái</label><SelectComponent aria-label='Trạng thái' allowClear className='w-full' value={props.status} onChange={props.onStatusChange} options={statusOptions} placeholder='Tất cả trạng thái' /></div>
      </div>
      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent className='w-full sm:w-auto' type='default' htmlType='reset' content='Xóa bộ lọc' icon={<BroomIcon aria-hidden size={18} />} />
        <ButtonComponent className='w-full sm:w-auto' htmlType='submit' content='Tìm kiếm' icon={<MagnifyingGlassIcon aria-hidden size={18} />} />
      </div>
    </form>
  </CardComponent>
}
