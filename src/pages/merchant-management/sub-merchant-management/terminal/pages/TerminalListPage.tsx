import { useNavigate } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { PlusOutlined, TerminalIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'

import { ManagementPageHeader } from '../../shared/ManagementPageHeader'
import type { ManagementListState } from '../../shared/management.types'
import { TerminalFilters } from '../components/TerminalFilters'
import { TerminalTable } from '../components/TerminalTable'
import { useTerminals } from '../hooks/useTerminals'
import type { TerminalRow } from '../types/terminal.type'
import { hasTerminalFilters } from '../utils/terminal.utils'

export interface TerminalListPageProps {
  initialListState?: ManagementListState
}

export default function TerminalListPage({
  initialListState
}: TerminalListPageProps) {
  const navigate = useNavigate()
  const terminals = useTerminals({ initialListState })
  const basePath = SCREENS.MERCHANT_TERMINAL.path
  const navigateTo = (segment: string, row?: TerminalRow): void => {
    navigate(
      row ? `${basePath}/${segment}/${row.id}` : `${basePath}/${segment}`
    )
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <TerminalFilters
          value={terminals.filters}
          onSearch={terminals.setFilters}
          onReset={terminals.resetFilters}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <section
          aria-labelledby='terminal-list-title'
          className='space-y-4'
        >
          <div className='flex items-start gap-2'>
            <TerminalIcon
              aria-hidden
              className='mt-0.5 text-secondary-foreground'
              size={20}
            />
            <div className='min-w-0 flex-1'>
              <ManagementPageHeader
                title='Quản lý Terminal'
                description='Theo dõi thiết bị và điểm chấp nhận thanh toán theo quan hệ Merchant cha → Sub-merchant.'
                total={
                  terminals.listState === 'success'
                    ? terminals.total
                    : undefined
                }
                primaryAction={
                  <Can
                    screen='MERCHANT_TERMINAL'
                    action='create'
                  >
                    <ButtonComponent
                      content='Thêm Terminal'
                      htmlType='button'
                      icon={<PlusOutlined aria-hidden />}
                      onClick={() => navigateTo('create')}
                    />
                  </Can>
                }
              />
            </div>
          </div>
          <TerminalTable
            filtered={hasTerminalFilters(terminals.filters)}
            onEdit={(row) => navigateTo('edit', row)}
            onPageChange={terminals.setPage}
            onRetry={terminals.retry}
            onStatusChange={terminals.changeStatus}
            onView={(row) => navigateTo('detail', row)}
            page={terminals.page}
            pageSize={terminals.pageSize}
            rows={terminals.rows}
            state={terminals.listState}
            total={terminals.total}
          />
        </section>
      </CardComponent>
    </main>
  )
}
