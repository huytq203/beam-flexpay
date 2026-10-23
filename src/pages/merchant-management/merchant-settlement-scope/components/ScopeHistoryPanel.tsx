import { useMemo, useState } from 'react'
import { useGetSettlementConfigHistoryQuery } from '@/app/services/merchantSettlementScopeApi'
import {
  ButtonComponent,
  SelectComponent,
  Table,
  type PickedEntity
} from '@components/index'
import { createScopeHistoryColumns } from '../columns/scopeHistory.columns'
import { LEVEL_OPTIONS } from '../constants/settlementScope.constants'
import type { HistoryLevel } from '../types/settlementScope.types'
import { toHistoryRows } from '../utils/settlementScope.utils'
import { ScopeTargetPicker } from './ScopeTargetPicker'

const PAGE_SIZE = 10

export function ScopeHistoryPanel({
  initialMaster
}: {
  initialMaster?: PickedEntity
}) {
  const [level, setLevel] = useState<HistoryLevel>(
    initialMaster ? 'MASTER' : 'SYSTEM'
  )
  const [target, setTarget] = useState<PickedEntity | undefined>(initialMaster)
  const [page, setPage] = useState(1)
  const needsTarget = level !== 'SYSTEM'
  const ready = !needsTarget || Boolean(target)
  const query = useGetSettlementConfigHistoryQuery(
    { level, targetId: needsTarget ? target?.id : undefined },
    { skip: !ready }
  )
  const rows = useMemo(() => toHistoryRows(query.data), [query.data])

  return (
    <section
      aria-label='Lịch sử thay đổi'
      className='flex flex-col gap-3'
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div>
          <label
            className='mb-1 block text-xs text-muted-foreground'
            htmlFor='history-level'
          >
            Cấp cấu hình
          </label>
          <SelectComponent
            id='history-level'
            className='w-full'
            allowClear={false}
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(next: HistoryLevel) => {
              setLevel(next)
              setTarget(undefined)
              setPage(1)
            }}
          />
        </div>
        {needsTarget && (
          <ScopeTargetPicker
            kind={level === 'SUB' ? 'sub' : 'master'}
            value={target}
            onChange={(next) => {
              setTarget(next)
              setPage(1)
            }}
          />
        )}
      </div>
      {!ready && (
        <p className='text-sm text-muted-foreground'>
          {level === 'SUB' ? 'Chọn Sub-merchant' : 'Chọn Merchant'} để xem lịch
          sử thay đổi
        </p>
      )}
      {ready && query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải lịch sử thay đổi.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            htmlType='button'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      {ready && !query.isError && (
        <>
          <p className='text-xs text-muted-foreground'>
            Tối đa 500 thay đổi gần nhất, mới nhất trước. So sánh với lần thay
            đổi liền trước của cùng đối tượng.
          </p>
          <Table
            rowKey='id'
            size='small'
            loading={query.isFetching}
            dataSource={rows}
            locale={{ emptyText: 'Chưa có lịch sử thay đổi' }}
            columns={createScopeHistoryColumns(rows, page, PAGE_SIZE)}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: rows.length,
              showSizeChanger: false,
              onChange: setPage
            }}
          />
        </>
      )}
    </section>
  )
}
