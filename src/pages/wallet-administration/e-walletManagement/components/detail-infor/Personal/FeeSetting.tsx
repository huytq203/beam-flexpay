import { getApplicableFeeRuleColumns } from './configs/FeeSetting.column'
import { FeeSettingCard } from './components/FeeSettingCard'
import {
  FeeRulesBody,
  FeeRulesExportButton
} from './components/FeeRulesBody'
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
  'File lấy trọn bộ lọc đang áp, không giới hạn theo trang, và chỉ gồm quy tắc riêng của ví hoặc nhóm của chủ ví.'

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
    hasValidSubject,
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
  } = useFeeSettingRules({
    accountLabel: walletLabel,
    subjectId,
    subjectType: 'USER',
    feeDomain: 'EWALLET'
  })

  if (!hasValidSubject) {
    return (
      <FeeSettingCard>
        <p role='alert' className='py-10 text-center text-sm text-danger'>
          Không thể tải quy tắc phí vì thiếu mã chủ ví.
        </p>
      </FeeSettingCard>
    )
  }

  const exportButton = (
    <FeeRulesExportButton
      onExport={handleExport}
      loading={isExporting}
      totalElements={totalElements}
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

  return (
    <div className='space-y-3!'>
      {/* {filterCard} */}
      <SubjectSegmentCard subjectId={subjectId ?? ''} />
      <FeeSettingCard totalRows={totalElements} action={exportButton}>
        <FeeRulesBody
          columns={applicableFeeRuleColumns}
          dataSource={dataSource}
          page={page}
          size={size}
          totalElements={totalElements}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          hasFilter={hasFilter}
          refetch={refetch}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </FeeSettingCard>
    </div>
  )
}
