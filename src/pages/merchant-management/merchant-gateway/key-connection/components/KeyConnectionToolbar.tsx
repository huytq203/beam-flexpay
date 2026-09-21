import { Input, SelectInput } from '@components/index'

import {
  KEY_CONNECTION_SCOPE_OPTIONS,
  KEY_CONNECTION_STATUS_OPTIONS
} from '../schemas/keyConnection.schema'
import type { KeyConnectionFilters } from '../types/keyConnection.type'

interface KeyConnectionToolbarProps {
  filters: KeyConnectionFilters
  onFiltersChange: (filters: KeyConnectionFilters) => void
}

export function KeyConnectionToolbar({
  filters,
  onFiltersChange
}: KeyConnectionToolbarProps) {
  const updateFilters = (updates: Partial<KeyConnectionFilters>): void => {
    onFiltersChange({ ...filters, ...updates })
  }

  return (
    <div className='grid w-full grid-cols-1 gap-3 md:grid-cols-3'>
      <div className='flex flex-col gap-1.5'>
        <label className='text-sm font-medium text-foreground' htmlFor='key-query'>
          Tìm kiếm
        </label>
        <Input
          aria-label='Tìm kiếm key kết nối'
          id='key-query'
          placeholder='Tên, mã merchant hoặc Client ID'
          value={filters.query}
          onChange={(event) => updateFilters({ query: event.target.value })}
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        <label className='text-sm font-medium text-foreground' htmlFor='key-scope'>
          Cấp áp dụng
        </label>
        <SelectInput
          allowClear
          aria-label='Cấp áp dụng'
          data={KEY_CONNECTION_SCOPE_OPTIONS}
          id='key-scope'
          placeholder='Tất cả'
          value={filters.scope === 'ALL' ? undefined : filters.scope}
          onClear={() => updateFilters({ scope: 'ALL' })}
          handleChange={(value) =>
            updateFilters({ scope: value === 'SUB' ? 'SUB' : 'MASTER' })
          }
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        <label className='text-sm font-medium text-foreground' htmlFor='key-status'>
          Trạng thái
        </label>
        <SelectInput
          allowClear
          aria-label='Trạng thái key'
          data={KEY_CONNECTION_STATUS_OPTIONS}
          id='key-status'
          placeholder='Tất cả'
          value={filters.status === 'ALL' ? undefined : filters.status}
          onClear={() => updateFilters({ status: 'ALL' })}
          handleChange={(value) =>
            updateFilters({ status: value === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE' })
          }
        />
      </div>
    </div>
  )
}
