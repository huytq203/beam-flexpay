import {
  applicableFeeRuleQuerySchema,
  type ApplicableFeeRuleExportQuery,
  type ApplicableFeeRuleQuery
} from '@/app/schemas/applicable-fee-rule.schema'
import { useGetApplicableFeeRulesQuery } from '@/app/services/apiApplicableFeeRule'
import {
  ButtonComponent,
  Table
} from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportApplicableFeeRulesMutation } from '@services/apiExportCsv'
import { useMemo } from 'react'
import {
  applicableFeeRuleColumns,
  type ApplicableFeeRuleTableRow
} from './configs/FeeSetting.column'
import { createApplicableFeeRuleRowKey } from './utils/applicable-fee-rule'
import {
  FeeRulesEmptyState,
  FeeSettingCard
} from './components/FeeSettingCard'

interface FeeSettingProps {
  walletId: string
  walletLabel: string
}

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
  const [triggerExport, { reset: resetExport }] =
    useExportApplicableFeeRulesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'cau-hinh-phi'
  })
  const exportParams: ApplicableFeeRuleExportQuery = {
    merchantId: walletId,
    feeDomain: 'EWALLET'
  }
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
  // const exportButton = (
  //   <ExportCsvButton
  //     onExport={() => exportFile(exportParams)}
  //     loading={isExporting}
  //     disabled={!walletId || (data?.totalElements ?? 0) === 0}
  //   />
  // )

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
      <FeeSettingCard
        totalRows={data?.totalElements ?? 0}
        // action={exportButton}
      >
        <FeeRulesEmptyState />
      </FeeSettingCard>
    )
  }

  return (
    <FeeSettingCard totalRows={data?.totalElements} >
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
