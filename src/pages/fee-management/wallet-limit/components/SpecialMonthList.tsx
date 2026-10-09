import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import {
  ButtonComponent,
  CardComponent,
  SelectComponent,
  Table
} from '@components/index'
import { createSpecialMonthColumns } from '../columns/specialMonth.columns'
import { useSpecialMonths } from '../hooks/useSpecialMonths'
import { getYearOptions } from '../utils/specialMonth.utils'

interface SpecialMonthListProps {
  onRename: (month: WalletLimitSpecialMonth) => void
  onDelete: (month: WalletLimitSpecialMonth) => void
}

const EmptyState = () => (
  <div className='py-8 text-center'>
    <p className='font-semibold'>Chưa có tháng đặc biệt nào</p>
    <p className='text-xs text-muted-foreground'>
      Thêm tháng ở biểu mẫu phía trên để áp hạn mức tháng (đặc biệt).
    </p>
  </div>
)

export function SpecialMonthList({
  onRename,
  onDelete
}: SpecialMonthListProps) {
  const { year, setYear, query, months } = useSpecialMonths()

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor='special-month-year'
            className='font-medium'
          >
            Năm
          </label>
          <SelectComponent<string>
            id='special-month-year'
            className='w-40'
            value={year}
            options={getYearOptions()}
            onChange={setYear}
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
