import {
  FEE_SCOPE,
  POLICY_KIND
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import {
  FEE_SCREEN,
  FEE_SCREEN_CONFIG,
  visibleServiceTypesFor,
  type FeeScreen
} from '@pages/fee-management/fee-config/constants/feeScreen'
import { CardComponent, Table, TooltipComponent } from '@components/index'
import { PUBLISHABLE_SERVICE_TYPES } from '@utils/fee-execution'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { useCustomerSegmentNames } from '@hooks/useCustomerSegmentNames'
import { useExportFeePoliciesMutation } from '@services/apiExportCsv'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FeePolicyFilterBar } from './components/FeePolicyFilterBar'
import { FeePolicyListError } from './components/FeePolicyListError'
import { FeePolicyTableActions } from './components/FeePolicyTableActions'
import { FeePolicyExpandedDetail } from './components/FeePolicyExpandedDetail'
import {
  FeePolicyStatusChangeDialog,
  type StatusChangePolicy
} from './components/FeePolicyStatusChangeDialog'
import { getFeePolicyColumns } from './columns/FeePolicyList.column'
import { useExpandedPolicyIds } from './hooks/useExpandedPolicyIds'
import { useFeePolicyList } from './hooks/useFeePolicyList'
import { dateOnly, FILTER_KEYS, keepFilters } from './utils/feePolicyUrlFilters'
import { splitPolicyStatusFilter } from './utils/policyStatusFilter'

interface FeePolicyListPageProps {
  /**
   * Màn đang dùng bộ danh sách này: Cấu hình phí (`CUSTOMER_FEE`), Cấu hình phí đầu vào (`INPUT_COST`)
   * hoặc Cấu hình phí ĐVCNTT. Mỗi màn luôn gửi đúng một `policyKind` xuống API; đường dẫn, quyền, tên file
   * CSV và miền phí cố định của màn đọc từ `FEE_SCREEN_CONFIG`.
   */
  screen: FeeScreen
}

export const FeePolicyListPage = ({ screen }: FeePolicyListPageProps) => {
  const navigate = useNavigate()
  const {
    filters,
    applyFilters,
    clearFilters,
    page,
    size,
    setPage,
    setPageSize
  } = useUrlFilters({ keys: FILTER_KEYS })

  const config = FEE_SCREEN_CONFIG[screen]
  const { policyKind } = config
  const isInputCost = policyKind === POLICY_KIND.INPUT_COST
  const isMerchantScreen = screen === FEE_SCREEN.MERCHANT_FEE
  // Màn ĐVCNTT chỉ có thu hộ / chi hộ: `serviceType` ngoài hai loại đó trên URL bị bỏ, không hiện và không gửi API.
  const serviceType =
    isMerchantScreen &&
    filters.serviceType &&
    !visibleServiceTypesFor(screen, PUBLISHABLE_SERVICE_TYPES).includes(
      filters.serviceType
    )
      ? undefined
      : filters.serviceType
  const feeScope = isInputCost ? FEE_SCOPE.INPUT_COST : FEE_SCOPE.OUTPUT_FEE
  const [changing, setChanging] = useState<StatusChangePolicy | null>(null)
  const customerSegmentNames = useCustomerSegmentNames()
  const exportFilters = {
    policyKind,
    // Chỉ màn ĐVCNTT ép miền; màn chung không gửi `feeDomain`.
    feeDomain: config.feeDomain,
    keyword: filters.keyword,
    serviceType,
    status: filters.status,
    // Phí đầu vào không có đối tượng khách, người chịu luôn là Hệ thống và không có bên chịu phí chuyển tiền.
    appliedTarget: isInputCost ? undefined : filters.appliedTarget,
    bankCode: filters.bankCode,
    providerCode: filters.providerCode,
    paymentMethod: filters.paymentMethod,
    payerType: isInputCost ? undefined : filters.payerType,
    beneficiaryType: filters.beneficiaryType,
    // Màn ĐVCNTT không có bộ lọc bên chịu phí nên không gửi dù URL mang theo.
    feeBearer: isInputCost || isMerchantScreen ? undefined : filters.feeBearer,
    validFrom: filters.validFrom,
    validTo: filters.validTo,
    createdAtFrom: filters.createdAtFrom,
    createdAtTo: filters.createdAtTo
  }
  const expansionResetKey = JSON.stringify({ ...exportFilters, page, size })
  const { expandedPolicyIds, updateExpandedPolicyIds } =
    useExpandedPolicyIds(expansionResetKey)
  const { rows, total, isFetching, isError, refetch } = useFeePolicyList({
    filters: exportFilters,
    page,
    size
  })
  const pagePolicyIds = rows.map(({ id }) => id)
  const allExpanded =
    pagePolicyIds.length > 0 &&
    pagePolicyIds.every((id) => expandedPolicyIds.includes(id))
  const [triggerExport, { reset: resetExport }] = useExportFeePoliciesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: config.csvPrefix
  })

  const handleToggleAll = () =>
    updateExpandedPolicyIds((current) =>
      allExpanded
        ? current.filter((id) => !pagePolicyIds.includes(id))
        : [...new Set([...current, ...pagePolicyIds])]
    )

  const tableActions = (
    <FeePolicyTableActions
      onExport={() =>
        exportFile({
          ...exportFilters,
          status: undefined,
          ...splitPolicyStatusFilter(exportFilters.status)
        })
      }
      exporting={isExporting}
      exportDisabled={total === 0 || isError}
      screen={config.permissionScreen}
      createPath={config.createPath}
    />
  )

  return (
    <>
      <CardComponent className='mb-3!'>
        <div>
          <FeePolicyFilterBar
            screen={screen}
            serviceType={serviceType}
            values={{
              keyword: filters.keyword ?? '',
              status: filters.status ?? '',
              appliedTarget: filters.appliedTarget ?? '',
              bankCode: filters.bankCode ?? '',
              providerCode: filters.providerCode ?? '',
              paymentMethod: filters.paymentMethod ?? '',
              payerType: filters.payerType ?? '',
              beneficiaryType: filters.beneficiaryType ?? '',
              feeBearer: filters.feeBearer ?? '',
              validFrom: filters.validFrom ?? '',
              validTo: filters.validTo ?? '',
              createdAtFrom: filters.createdAtFrom ?? '',
              createdAtTo: filters.createdAtTo ?? ''
            }}
            onServiceTypeChange={(serviceType) =>
              applyFilters(
                keepFilters(filters, {
                  direction: null,
                  serviceType: serviceType ?? null,
                  paymentMethod: null,
                  // Bên chịu phí chỉ có nghĩa với chuyển tiền: đổi sang loại khác thì bỏ lọc này.
                  feeBearer:
                    serviceType === 'EWALLET_TRANSFER_INTERNAL'
                      ? filters.feeBearer
                      : null
                })
              )
            }
            onSubmit={(values) =>
              applyFilters(
                keepFilters(filters, {
                  ...values,
                  direction: null,
                  serviceType: serviceType ?? null,
                  // Màn ĐVCNTT không có ô này: xoá giá trị dư từ URL cũ thay vì giữ lại mãi.
                  ...(isMerchantScreen ? { feeBearer: null } : {}),
                  validFrom: dateOnly(values.validFrom),
                  validTo: dateOnly(values.validTo),
                  createdAtFrom: dateOnly(values.createdAtFrom),
                  createdAtTo: dateOnly(values.createdAtTo)
                })
              )
            }
            onReset={clearFilters}
          />
        </div>
      </CardComponent>

      <CardComponent>
        {isError ? (
          <FeePolicyListError onRetry={refetch} />
        ) : (
          <Table
            tableLayout='fixed'
            size='small'
            rowKey='key'
            dataSource={rows}
            columns={getFeePolicyColumns({
              feeScope,
              screen: config.permissionScreen,
              onEdit: (id) => navigate(config.editPath(id)),
              onChangeStatus: (id, name, policyStatus) =>
                setChanging({ id, name, status: policyStatus }),
              customerSegmentNames
            })}
            loading={isFetching}
            onRefresh={refetch}
            toolbar={tableActions}
            scroll={{ x: 'max-content' }}
            expandable={{
              columnTitle: (
                <div className='flex w-full items-center justify-center'>
                  <TooltipComponent
                    title={allExpanded ? 'Thu gọn tất cả' : 'Mở tất cả'}
                  >
                    <button
                      type='button'
                      aria-label={allExpanded ? 'Thu gọn tất cả' : 'Mở tất cả'}
                      aria-expanded={allExpanded}
                      disabled={pagePolicyIds.length === 0 || isError}
                      onClick={handleToggleAll}
                      className={`ant-table-row-expand-icon float-none! ${
                        allExpanded
                          ? 'ant-table-row-expand-icon-expanded'
                          : 'ant-table-row-expand-icon-collapsed'
                      }`}
                    />
                  </TooltipComponent>
                </div>
              ),
              columnWidth: 48,
              expandedRowKeys: expandedPolicyIds,
              onExpand: (expanded, row) =>
                updateExpandedPolicyIds((current) =>
                  expanded
                    ? [...current, row.id]
                    : current.filter((id) => id !== row.id)
                ),
              expandedRowRender: (row, _index, _indent, expanded) =>
                expanded ? (
                  <FeePolicyExpandedDetail
                    feeScope={feeScope}
                    policyId={row.id}
                    policyName={row.name}
                    configuration={row.configuration}
                    appliedTargets={row.appliedTargets}
                    serviceType={row.serviceType}
                  />
                ) : null
            }}
            pagination={{
              current: page,
              pageSize: size,
              total,
              showSizeChanger: true,
              onChange: (nextPage, nextSize) => {
                if (nextSize !== size) {
                  setPageSize(nextSize)
                  return
                }
                setPage(nextPage)
              }
            }}
          />
        )}
      </CardComponent>

      <FeePolicyStatusChangeDialog
        policy={changing}
        onClose={() => setChanging(null)}
      />
    </>
  )
}

/** Màn Cấu hình phí: chính sách phí khách (phí đầu ra). */
const FeePolicyList = () => (
  <FeePolicyListPage screen={FEE_SCREEN.CUSTOMER_FEE} />
)

export default FeePolicyList
