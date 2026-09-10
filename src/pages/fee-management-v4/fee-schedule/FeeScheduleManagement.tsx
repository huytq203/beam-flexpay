import * as Icons from '@components/icons'
import {
  CardComponent,
  ExportCsvButton,
  SegmentedComponent,
  Table
} from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { FEE_DOMAIN_LABELS } from '@constants/feeLabels'
import { feeScheduleColumns, type FeeScheduleRow } from './columns/FeeSchedule.column'
import { useFeeSchedule, type FeeDomainFilter } from './hooks/useFeeSchedule'

const DOMAIN_OPTIONS: { value: FeeDomainFilter; label: string }[] = [
  { value: 'BANK', label: FEE_DOMAIN_LABELS.BANK },
  { value: 'EWALLET', label: FEE_DOMAIN_LABELS.EWALLET },
  { value: 'MERCHANT', label: FEE_DOMAIN_LABELS.MERCHANT }
]

const DOMAIN_HINT: Record<FeeDomainFilter, string> = {
  BANK: 'Phần phí nhà cung cấp đối tác/bankđược hưởng — dùng bảng này để đối soát với ngân hàng.',
  EWALLET: 'Phần phí FlexPay được hưởng trên các giao dịch ví.',
  MERCHANT: 'Phần phí phát sinh trên các giao dịch của merchant.'
}

const FeeScheduleManagement = () => {
  const {
    feeDomain,
    handleChangeDomain,
    dataSource,
    total,
    isLoading,
    isFetching,
    isError,
    refetch,
    page,
    size,
    setPage,
    setPageSize,
    handleExport,
    isExporting
  } = useFeeSchedule()

  return (
    <div className='space-y-3'>
      <CardComponent>
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <div className='flex items-start gap-3'>
            <div className='rounded-lg bg-blue-50 p-2'>
              <Icons.BankIcon size={20} className='text-blue-600' />
            </div>
            <div>
              <p className='text-[18px] font-bold leading-tight text-gray-800'>
                Biểu phí hiệu lực
              </p>
              <p className='mt-0.5 max-w-xl text-[12px] font-medium text-gray-500'>
                Toàn bộ luật phí đang áp dụng sau khi gán, đã tách theo bên được
                hưởng. Đây là bảng để đối soát, không phải nơi chỉnh cấu hình.
              </p>
            </div>
          </div>
          <ExportCsvButton
            onExport={handleExport}
            loading={isExporting}
            disabled={total === 0}
            tooltip='File tải về lấy theo miền phí đang chọn, không giới hạn theo trang.'
          />
        </div>

        <div className='mt-4 border-t border-border pt-3'>
          <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-foreground'>
            Miền phí
          </p>
          <SegmentedComponent<FeeDomainFilter>
            ariaLabel='Lọc theo miền phí'
            value={feeDomain}
            options={DOMAIN_OPTIONS}
            onChange={handleChangeDomain}
          />
          <p className='mt-2 text-xs text-muted-foreground'>
            {DOMAIN_HINT[feeDomain]}
          </p>
        </div>
      </CardComponent>

      <CardComponent>
        {isLoading ? (
          <SkeletonTable rows={6} columns={6} noContainer />
        ) : isError ? (
          <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-danger-strong/40 bg-red-50 py-12 text-center'>
            <Icons.WarningIcon size={40} color='#c62828' />
            <p className='font-medium text-danger-strong'>
              Không tải được biểu phí hiệu lực
            </p>
            <button
              type='button'
              onClick={refetch}
              className='rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-slate-50'
            >
              Thử lại
            </button>
          </div>
        ) : dataSource.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center'>
            <Icons.ScalesIcon size={40} className='text-muted-foreground' />
            <p className='font-medium text-foreground'>
              Chưa có luật phí nào đang hiệu lực cho miền{' '}
              {FEE_DOMAIN_LABELS[feeDomain]}
            </p>
            <p className='max-w-md text-xs text-muted-foreground'>
              Luật phí chỉ xuất hiện ở đây sau khi chính sách được gán và có
              hiệu lực.
            </p>
          </div>
        ) : (
          <Table<FeeScheduleRow>
            rowKey='rowKey'
            columns={feeScheduleColumns}
            dataSource={dataSource}
            size='small'
            loading={isFetching}
            onRefresh={refetch}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: page,
              pageSize: size,
              total,
              showSizeChanger: true,
              onChange: (nextPage, nextSize) => {
                setPage(nextPage)
                setPageSize(nextSize)
              },
              showTotal: (count, range) =>
                `Hiển thị ${range[0]}-${range[1]} / ${count} luật phí`
            }}
          />
        )}
      </CardComponent>
    </div>
  )
}

export default FeeScheduleManagement
