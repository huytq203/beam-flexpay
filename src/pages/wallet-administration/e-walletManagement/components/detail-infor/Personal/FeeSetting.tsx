import {
  applicableFeeRuleQuerySchema,
  type ApplicableFeeRuleQuery
} from '@/app/schemas/applicable-fee-rule.schema'
import { useGetApplicableFeeRulesQuery } from '@/app/services/apiApplicableFeeRule'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import usePagination from '@hooks/usePagination'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import {
  applicableFeeRuleColumns,
  type ApplicableFeeRuleTableRow
} from './configs/FeeSetting.column'
import { createApplicableFeeRuleRowKey } from './utils/applicable-fee-rule'

interface FeeSettingProps {
  walletId: string
  walletLabel: string
}

interface FeeSettingCardProps {
  children: ReactNode
  totalRows?: number
}

const FeeSettingCard = ({
  children,
  totalRows
}: FeeSettingCardProps) => (
  <CardComponent
    className='mt-3'
    content={
      <section aria-labelledby='applicable-fee-rules-title'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <h2
            id='applicable-fee-rules-title'
            className='text-base font-semibold text-foreground'
          >
            Quy tắc phí đang áp dụng
          </h2>
          {totalRows !== undefined ? (
            <span className='text-xs text-muted-foreground'>
              {totalRows} dòng quy tắc
            </span>
          ) : null}
        </div>
        {children}
      </section>
    }
  />
)

const FeeRulesEmptyState = () => (
  <div
    role='status'
    className='flex min-h-44 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/30 px-4 text-center'
  >
    <p className='font-medium text-foreground'>
      Chưa có quy tắc phí đang áp dụng
    </p>
    <p className='text-sm text-muted-foreground'>
      Ví này chưa có quy tắc riêng hoặc quy tắc áp dụng chung phù hợp.
    </p>
  </div>
)

export const FeeSetting = ({ walletId, walletLabel }: FeeSettingProps) => {
  const { page, size, setPage, setPageSize } = usePagination()
  const parsedQuery = applicableFeeRuleQuerySchema.safeParse({
    merchantId: walletId,
    feeDomain: 'EWALLET',
    page,
    size
  })
  const fallbackQuery: ApplicableFeeRuleQuery = {
    feeDomain: 'EWALLET',
    page,
    size
  }
  const queryArgs = parsedQuery.success ? parsedQuery.data : fallbackQuery
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useGetApplicableFeeRulesQuery(queryArgs, {
    skip: !parsedQuery.success
  })
  const dataSource = useMemo<ApplicableFeeRuleTableRow[]>(
    () =>
      (data?.content ?? []).map((rule, index) => ({
        ...rule,
        rowKey: createApplicableFeeRuleRowKey(rule),
        no: (page - 1) * size + index + 1,
        accountLabel: walletLabel
      })),
    [data, page, size, walletLabel]
  )

  if (!parsedQuery.success) {
    return (
      <FeeSettingCard>
        <p role='alert' className='py-10 text-center text-sm text-danger'>
          Không thể tải quy tắc phí vì mã ví không hợp lệ.
        </p>
      </FeeSettingCard>
    )
  }

  if (isLoading) {
    return (
      <FeeSettingCard>
        <SkeletonTable
          columns={applicableFeeRuleColumns.length}
          rows={size}
          noContainer
        />
      </FeeSettingCard>
    )
  }

  if (isError) {
    return (
      <FeeSettingCard>
        <div
          role='alert'
          className='flex min-h-44 flex-col items-center justify-center gap-3 text-center'
        >
          <div>
            <p className='font-medium text-foreground'>
              Không tải được quy tắc phí
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Vui lòng thử lại hoặc kiểm tra quyền xem chính sách phí.
            </p>
          </div>
          <ButtonComponent
            type='default'
            content='Thử lại'
            onClick={() => refetch()}
          />
        </div>
      </FeeSettingCard>
    )
  }

  if (dataSource.length === 0) {
    return (
      <FeeSettingCard totalRows={data?.totalElements ?? 0}>
        <FeeRulesEmptyState />
      </FeeSettingCard>
    )
  }

  return (
    <FeeSettingCard totalRows={data?.totalElements}>
      <Table<ApplicableFeeRuleTableRow>
        rowKey='rowKey'
        size='small'
        columns={applicableFeeRuleColumns}
        dataSource={dataSource}
        loading={isFetching}
        onRefresh={refetch}
        pagination={{
          current: page,
          pageSize: size,
          total: data?.totalElements,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          }
        }}
      />
    </FeeSettingCard>
  )
}
