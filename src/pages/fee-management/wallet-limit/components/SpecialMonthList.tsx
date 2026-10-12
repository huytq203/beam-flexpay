import dayjs from 'dayjs'
import { Can } from '@/app/permissions'
import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import {
  ButtonComponent,
  CardComponent,
  DateInput,
  Table
} from '@components/index'
import { createSpecialMonthColumns } from '../columns/specialMonth.columns'
import type { useSpecialMonths } from '../hooks/useSpecialMonths'
import { ALL_YEARS, MAX_YEAR, MIN_YEAR } from '../utils/specialMonth.utils'

type SpecialMonthsState = ReturnType<typeof useSpecialMonths>

interface SpecialMonthListProps {
  state: SpecialMonthsState
  onAdd: () => void
  onRename: (month: WalletLimitSpecialMonth) => void
  onDelete: (month: WalletLimitSpecialMonth) => void
}

const YEAR_FORMAT = 'YYYY'

const EmptyState = () => (
  <div className='py-8 text-center'>
    <p className='font-semibold'>Chưa có tháng đặc biệt nào</p>
    <p className='text-xs text-muted-foreground'>
      Bấm Thêm tháng đặc biệt hoặc chọn một ô trống trên lịch để áp hạn mức
      tháng (đặc biệt).
    </p>
  </div>
)

export function SpecialMonthList({
  state,
  onAdd,
  onRename,
  onDelete
}: SpecialMonthListProps) {
  const { year, setYear, query, months } = state

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-base font-bold'>Danh sách</h2>
        <Can
          screen='WALLET_LIMIT_SPECIAL_MONTH'
          action='create'
        >
          <ButtonComponent
            content='Thêm tháng đặc biệt'
            onClick={onAdd}
          />
        </Can>
      </div>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor='special-month-year'
            className='font-medium'
          >
            Năm
          </label>
          <DateInput
            id='special-month-year'
            picker='year'
            format={YEAR_FORMAT}
            placeholder='Tất cả năm'
            allowClear
            className='w-40'
            value={year === ALL_YEARS ? null : dayjs(year, YEAR_FORMAT)}
            disabledDate={(date) =>
              date.year() < MIN_YEAR || date.year() > MAX_YEAR
            }
            onChange={(date) => setYear(date ? String(date.year()) : ALL_YEARS)}
          />
        </div>
        <span className='text-xs text-muted-foreground'>
          {months.length} tháng · sắp theo thời gian tăng dần
        </span>
      </div>
      {query.isError ? (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải danh sách tháng đặc biệt.
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      ) : (
        <Table<WalletLimitSpecialMonth>
          rowKey='id'
          size='small'
          loading={query.isFetching}
          dataSource={months}
          pagination={false}
          locale={{ emptyText: <EmptyState /> }}
          columns={createSpecialMonthColumns({ onRename, onDelete })}
        />
      )}
    </CardComponent>
  )
}
