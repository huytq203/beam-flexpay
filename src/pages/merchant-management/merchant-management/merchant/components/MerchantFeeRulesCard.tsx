import { useCustomerSegmentNames } from '@hooks/useCustomerSegmentNames'
import {
  FeeRulesBody,
  FeeRulesExportButton
} from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/components/FeeRulesBody'
import { FeeSettingCard } from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/components/FeeSettingCard'
import { getApplicableFeeRuleColumns } from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/configs/FeeSetting.column'
import { useFeeSettingRules } from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/hooks/useFeeSettingRules'

interface MerchantFeeRulesCardProps {
  merchantId: string
  /** Tên merchant, hiện ở dòng phụ của bản gán "Merchant cụ thể". */
  merchantLabel: string
}

const CARD_TITLE = 'Quy tắc phí thu hộ / chi hộ dành riêng cho merchant này'
const EMPTY_MESSAGE =
  'Merchant này chưa có quy tắc phí riêng — đang áp dụng biểu phí chung.'
const EXPORT_TOOLTIP =
  'File lấy trọn bộ lọc đang áp, không giới hạn theo trang, và chỉ gồm quy tắc riêng của merchant hoặc nhóm của merchant.'

/**
 * Quy tắc phí thu hộ / chi hộ áp riêng cho merchant: bản gán trực tiếp và bản gán theo nhóm.
 * Dùng chung hook, cột và khung thẻ với tab Cấu hình phí của ví, chỉ khác chủ thể và nhãn.
 */
export const MerchantFeeRulesCard = ({
  merchantId,
  merchantLabel
}: MerchantFeeRulesCardProps) => {
  const customerSegmentNames = useCustomerSegmentNames()
  const columns = getApplicableFeeRuleColumns(customerSegmentNames, 'MERCHANT')
  const {
    hasValidSubject,
    dataSource,
    totalElements,
    hasFilter,
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
  } = useFeeSettingRules({
    accountLabel: merchantLabel,
    subjectId: merchantId,
    subjectType: 'MERCHANT',
    feeDomain: 'MERCHANT',
    // Thiếu merchantId thì backend thêm `merchantId IS NULL` và khối mất mọi bản gán riêng.
    merchantId,
    exportFilenamePrefix: 'cau-hinh-phi-dvcntt'
  })

  if (!hasValidSubject) {
    return (
      <FeeSettingCard title={CARD_TITLE}>
        <p
          role='alert'
          className='py-10 text-center text-sm text-danger'
        >
          Không thể tải quy tắc phí vì thiếu mã merchant.
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

  return (
    <FeeSettingCard
      title={CARD_TITLE}
      totalRows={totalElements}
      action={exportButton}
    >
      <FeeRulesBody
        columns={columns}
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
        emptyMessage={EMPTY_MESSAGE}
      />
    </FeeSettingCard>
  )
}
