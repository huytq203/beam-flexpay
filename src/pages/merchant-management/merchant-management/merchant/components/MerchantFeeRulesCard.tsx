import { ButtonComponent, ExportCsvButton, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { useCustomerSegmentNames } from '@hooks/useCustomerSegmentNames'
import {
  FeeRulesEmptyState,
  FeeSettingCard
} from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/components/FeeSettingCard'
import {
  getApplicableFeeRuleColumns,
  type ApplicableFeeRuleTableRow
} from '@/pages/wallet-administration/e-walletManagement/components/detail-infor/Personal/configs/FeeSetting.column'
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
    merchantId
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
    <ExportCsvButton
      onExport={handleExport}
      loading={isExporting}
      disabled={totalElements === 0}
      totalRows={totalElements}
      tooltip={EXPORT_TOOLTIP}
    />
  )

  const body = () => {
    if (isLoading) {
      return (
        <SkeletonTable
          columns={columns.length}
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
      return (
        <FeeRulesEmptyState
          filtered={hasFilter}
          message={EMPTY_MESSAGE}
        />
      )
    }

    return (
      <Table<ApplicableFeeRuleTableRow>
        rowKey='rowKey'
        size='small'
        scroll={{ x: 'max-content' }}
        columns={columns}
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
    <FeeSettingCard
      title={CARD_TITLE}
      totalRows={totalElements}
      action={exportButton}
    >
      {body()}
    </FeeSettingCard>
  )
}
