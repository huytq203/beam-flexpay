import { Can } from '@/app/permissions'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  ExportCsvButton,
  Input,
  SelectComponent,
  Table
} from '@components/index'
import { AccessFilterActions } from '../../merchant-access/components/AccessFilterActions'
import { createMasterConfigColumns } from '../columns/masterConfigList.columns'
import {
  CONFIG_SEARCH_MAX,
  CONFIG_SOURCE_OPTIONS
} from '../constants/settlementScope.constants'
import { useMasterConfigList } from '../hooks/useMasterConfigList'
import type {
  ConfigListRow,
  ConfigListSource
} from '../types/settlementScope.types'

interface MasterConfigListPanelProps {
  /** Mở cấu hình chi tiết của Master được bấm. */
  onOpen: (row: ConfigListRow) => void
}

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

/** Mọi Master trong phạm vi gán kèm nguồn cấu hình quyết toán hiệu lực. */
export function MasterConfigListPanel({ onOpen }: MasterConfigListPanelProps) {
  const list = useMasterConfigList()
  const { query, draft, page, pageSize } = list
  const columns = createMasterConfigColumns({ page, pageSize, onOpen })

  return (
    <section
      aria-label='Danh sách Master'
      className='flex flex-col gap-3'
    >
      <form
        className='space-y-3'
        onSubmit={(event) => {
          event.preventDefault()
          list.apply()
        }}
        onReset={list.reset}
      >
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <label
              className={labelClass}
              htmlFor='scope-list-search'
            >
              Từ khóa
            </label>
            <Input
              id='scope-list-search'
              allowClear
              maxLength={CONFIG_SEARCH_MAX}
              placeholder='Mã hoặc tên Merchant'
              value={draft.search}
              onChange={(event) =>
                list.setDraft({ ...draft, search: event.target.value })
              }
            />
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor='scope-list-source'
            >
              Nguồn cấu hình
            </label>
            <SelectComponent
              id='scope-list-source'
              allowClear
              className='w-full'
              options={CONFIG_SOURCE_OPTIONS}
              placeholder='Tất cả nguồn'
              value={draft.source}
              onChange={(source: ConfigListSource | undefined) =>
                list.setDraft({ ...draft, source })
              }
            />
          </div>
        </div>
        <AccessFilterActions />
      </form>
      <div className='flex items-center justify-between gap-2'>
        <span
          aria-live='polite'
          className='text-xs text-muted-foreground tabular-nums'
        >
          {query.data ? `${query.data.totalElements} Master` : ''}
        </span>
        <Can
          screen='MERCHANT_SETTLEMENT_SCOPE'
          action='export'
        >
          <ExportCsvButton
            onExport={list.exportCsv}
            loading={list.isExporting}
            disabled={!query.data?.totalElements}
          />
        </Can>
      </div>
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {getApiErrorDetail(query.error, 'Không thể tải danh sách Master.')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<ConfigListRow>
        columns={columns}
        dataSource={query.isError ? [] : [...(query.data?.content ?? [])]}
        loading={query.isFetching}
        locale={{ emptyText: 'Không có Master nào khớp bộ lọc' }}
        onRefresh={query.refetch}
        pagination={{
          current: page,
          pageSize,
          total: query.data?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          onChange: list.paginate
        }}
        rowKey='merchantId'
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </section>
  )
}
