import { useState } from 'react'
import type {
  ApiTerminalType,
  HierarchyStatus
} from '@/app/services/merchantHierarchyApi'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  Input,
  SelectComponent
} from '@components/index'
import type { PickedEntity } from '../../shared/management.types'
import { ParentMerchantPickerDialog } from '../../shared/ParentMerchantPickerDialog'
import { PickerTrigger } from '../../shared/PickerTrigger'
import { SubMerchantPickerDialog } from '../../shared/SubMerchantPickerDialog'
import { statusOptions, typeOptions } from '../columns/terminalApi.columns'

interface TerminalApiFiltersProps {
  name: string
  merchant?: PickedEntity
  subMerchant?: PickedEntity
  terminalType?: ApiTerminalType
  status?: HierarchyStatus
  onNameChange: (value: string) => void
  onMerchantChange: (value?: PickedEntity) => void
  onSubChange: (value?: PickedEntity) => void
  onTypeChange: (value?: ApiTerminalType) => void
  onStatusChange: (value?: HierarchyStatus) => void
  onClear: () => void
  onSearch: () => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'
const toPicked = ({ id, code, name }: PickedEntity): PickedEntity => ({
  id,
  code,
  name
})
const describe = (entity?: PickedEntity) =>
  entity ? `${entity.code} — ${entity.name}` : undefined

export function TerminalApiFilters(props: TerminalApiFiltersProps) {
  const [picking, setPicking] = useState<'merchant' | 'sub'>()

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <form
        className='space-y-4'
        onSubmit={(event) => {
          event.preventDefault()
          props.onSearch()
        }}
        onReset={props.onClear}
      >
        <div className='flex items-center gap-2 border-b border-border pb-3'>
          <FunnelIcon
            aria-hidden
            size={18}
            className='text-secondary-foreground'
          />
          <h2 className='font-display text-base font-semibold text-foreground'>
            Bộ lọc tìm kiếm
          </h2>
        </div>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
          <div>
            <label
              className={labelClass}
              htmlFor='terminal-search'
            >
              Tên Terminal
            </label>
            <Input
              id='terminal-search'
              value={props.name}
              onChange={(event) => props.onNameChange(event.target.value)}
              placeholder='Tìm theo tên'
            />
          </div>
          <PickerTrigger
            id='terminal-filter-merchant'
            label='Merchant cha'
            value={describe(props.merchant)}
            placeholder='Tất cả Merchant'
            onOpen={() => setPicking('merchant')}
            onClear={() => props.onMerchantChange(undefined)}
          />
          <PickerTrigger
            id='terminal-filter-sub'
            label='Sub-merchant'
            value={describe(props.subMerchant)}
            placeholder='Tất cả Sub-merchant'
            onOpen={() => setPicking('sub')}
            onClear={() => props.onSubChange(undefined)}
          />
          <div>
            <label className={labelClass}>Loại</label>
            <SelectComponent
              aria-label='Loại'
              allowClear
              className='w-full'
              value={props.terminalType}
              onChange={props.onTypeChange}
              options={typeOptions}
              placeholder='Tất cả loại'
            />
          </div>
          <div>
            <label className={labelClass}>Trạng thái</label>
            <SelectComponent
              aria-label='Trạng thái'
              allowClear
              className='w-full'
              value={props.status}
              onChange={props.onStatusChange}
              options={statusOptions}
              placeholder='Tất cả trạng thái'
            />
          </div>
        </div>
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            className='w-full sm:w-auto'
            type='default'
            htmlType='reset'
            content='Xóa bộ lọc'
            icon={
              <BroomIcon
                aria-hidden
                size={18}
              />
            }
          />
          <ButtonComponent
            className='w-full sm:w-auto'
            htmlType='submit'
            content='Tìm kiếm'
            icon={
              <MagnifyingGlassIcon
                aria-hidden
                size={18}
              />
            }
          />
        </div>
      </form>
      <ParentMerchantPickerDialog
        open={picking === 'merchant'}
        selectedId={props.merchant?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(merchant) => {
          props.onMerchantChange(toPicked(merchant))
          setPicking(undefined)
        }}
      />
      <SubMerchantPickerDialog
        open={picking === 'sub'}
        selectedId={props.subMerchant?.id}
        merchantId={props.merchant?.id}
        onCancel={() => setPicking(undefined)}
        onSelect={(sub) => {
          props.onSubChange(toPicked(sub))
          setPicking(undefined)
        }}
      />
    </CardComponent>
  )
}
