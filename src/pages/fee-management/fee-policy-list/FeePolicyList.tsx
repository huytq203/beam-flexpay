import { FeeScopeTabs } from '@pages/fee-management/fee-config/components/FeeScopeTabs'
import {
  FEE_SCOPE,
  policyKindOfScope,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { CardComponent, Table, TooltipComponent } from '@components/index'
import { PATHS } from '@constants/pathConstant'
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
import {
  dateOnly,
  FILTER_KEYS,
  isFeeScope,
  keepFilters
} from './utils/feePolicyUrlFilters'
import { splitPolicyStatusFilter } from './utils/policyStatusFilter'

/**
 * Danh sách chính sách phí tách theo loại chính sách: tab "Phí đầu ra" lấy chính sách phí
 * khách (`CUSTOMER_FEE`), tab "Phí đầu vào" lấy chính sách chi phí đầu vào (`INPUT_COST`,
 * khai riêng theo tuyến thanh toán). Hai loại không chung chính sách nên không còn bản ghi
 * nào xuất hiện ở cả hai tab.
 */
const FeePolicyList = () => {
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

  const feeScope = isFeeScope(filters.feeScope)
    ? filters.feeScope
    : FEE_SCOPE.OUTPUT_FEE
  const [changing, setChanging] = useState<StatusChangePolicy | null>(null)
  const customerSegmentNames = useCustomerSegmentNames()
  const isInputCost = feeScope === FEE_SCOPE.INPUT_COST
  const exportFilters = {
    policyKind: policyKindOfScope(feeScope),
    keyword: filters.keyword,
    serviceType: filters.serviceType,
    status: filters.status,
    // Phí đầu vào không có đối tượng khách, người chịu luôn là Hệ thống và không có bên chịu phí chuyển tiền.
    appliedTarget: isInputCost ? undefined : filters.appliedTarget,
    bankCode: filters.bankCode,
    providerCode: filters.providerCode,
    paymentMethod: filters.paymentMethod,
    payerType: isInputCost ? undefined : filters.payerType,
    beneficiaryType: filters.beneficiaryType,
    feeBearer: isInputCost ? undefined : filters.feeBearer,
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
    filenamePrefix: 'cau-hinh-phi'
  })

  // Đổi luồng phí giữ nguyên mọi bộ lọc khác: loại giao dịch dùng chung cho cả hai luồng.
  const handleScopeChange = (next: FeeScope) =>
    applyFilters(
      keepFilters(
        filters,
        next === FEE_SCOPE.INPUT_COST
          ? {
              feeScope: next,
              direction: null,
              appliedTarget: null,
              payerType: null,
              feeBearer: null
            }
          : { feeScope: next, direction: null }
      )
    )

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
      createPath={
        isInputCost
          ? PATHS.FEE_V4.INPUT_COST_CREATE
          : PATHS.FEE_V4.POLICY_CREATE
      }
    />
  )

  return (
    <>
      <CardComponent className='mb-3!'>
        <FeeScopeTabs
          value={feeScope}
          onChange={handleScopeChange}
          withPanels={false}
        />

        <div className='mt-4 '>
          <FeePolicyFilterBar
            inputCost={isInputCost}
            serviceType={filters.serviceType}
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
                  feeScope,
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
                  feeScope,
                  direction: null,
                  serviceType: filters.serviceType ?? null,
                  validFrom: dateOnly(values.validFrom),
                  validTo: dateOnly(values.validTo),
                  createdAtFrom: dateOnly(values.createdAtFrom),
                  createdAtTo: dateOnly(values.createdAtTo)
                })
              )
            }
            onReset={() => {
              clearFilters()
              applyFilters({ feeScope })
            }}
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
              onEdit: (id) =>
                navigate(
                  isInputCost
                    ? PATHS.FEE_V4.INPUT_COST_EDIT(id)
                    : PATHS.FEE_V4.POLICY_EDIT(id)
                ),
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

export default FeePolicyList
