import { ButtonComponent, ExportCsvButton, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import {
  getApplicableFeeRuleColumns,
  type ApplicableFeeRuleTableRow
} from './configs/FeeSetting.column'
import { FeeRulesEmptyState, FeeSettingCard } from './components/FeeSettingCard'
import { SubjectSegmentCard } from '@components/fee/SubjectSegmentCard'
import { useFeeSettingRules } from './hooks/useFeeSettingRules'
import { useCustomerSegmentNames } from '@hooks/useCustomerSegmentNames'

interface FeeSettingProps {
  walletId: string
  walletLabel: string
  /** Định danh người dùng chủ ví. Phân khúc gắn theo người, không theo ví. */
  subjectId?: string
}

const EXPORT_TOOLTIP =
  'File lấy trọn bộ lọc đang áp, không giới hạn theo trang, và giữ nguyên các quy tắc áp dụng cho tất cả.'

export const FeeSetting = ({
  walletId,
  walletLabel,
  subjectId
}: FeeSettingProps) => {
  const customerSegmentNames = useCustomerSegmentNames()
  const applicableFeeRuleColumns = getApplicableFeeRuleColumns(
    customerSegmentNames
  )
  const {
    isWalletIdValid,
    dataSource,
    totalElements,
    hasFilter,
    policyOptions,
    isLoading,
    isFetching,
    isError,
    refetch,
    page,
    size,
    setPage,
    setPageSize,
    handleSearch,
    handleExport,
    isExporting
  } = useFeeSettingRules({ walletId, walletLabel })

  if (!isWalletIdValid) {
    return (
      <FeeSettingCard>
        <p role='alert' className='py-10 text-center text-sm text-danger'>
          Không thể tải quy tắc phí vì mã ví không hợp lệ.
        </p>
      </FeeSettingCard>
    )
  }

  const exportButton = (
    <ExportCsvButton
      onExport={handleExport}
      loading={isExporting}
      disabled={totalElements === 0}
      totalRows={totalElements}
      tooltip={EXPORT_TOOLTIP}
    />
  )

  // const filterCard = (
  //   <CardComponent
  //     content={
  //       <>
  //         <p className='mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 font-bold text-blue'>
  //           <Icons.FunnelIcon /> Bộ lọc quy tắc phí
  //         </p>
  //         <FeeSettingSearch
  //           policyOptions={policyOptions}
  //           onSearch={handleSearch}
  //         />
  //       </>
  //     }
  //   />
  // )

  const body = () => {
    if (isLoading) {
      return (
        <SkeletonTable
          columns={applicableFeeRuleColumns.length}
          rows={size}
          noContainer
        />
      )
    }

    if (isError) {
      return (
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
      )
    }

    if (dataSource.length === 0) {
      return <FeeRulesEmptyState filtered={hasFilter} />
    }

    return (
      <Table<ApplicableFeeRuleTableRow>
        rowKey='rowKey'
        size='small'
        scroll={{ x: 'max-content' }}
        columns={applicableFeeRuleColumns}
        dataSource={dataSource}
        loading={isFetching}
        onRefresh={refetch}
        pagination={{
          current: page,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          }
        }}
      />
    )
  }

return (
    <div className='space-y-3!'>
      {/* {filterCard} */}
      <SubjectSegmentCard subjectId={subjectId ?? ''} />
      <FeeSettingCard totalRows={totalElements} action={exportButton}>
        {body()}
      </FeeSettingCard>
    </div>
  )
}
