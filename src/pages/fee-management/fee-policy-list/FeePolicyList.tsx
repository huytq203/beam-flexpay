import { FeeScopeTabs } from '@pages/fee-management/fee-config/components/FeeScopeTabs'
import {
  FEE_SCOPE,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import {
  CardComponent,
  ReasonDialog,
  Table,
  TooltipComponent
} from '@components/index'
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
  FeePolicyScheduleDialog,
  type SchedulingPolicy
} from './components/FeePolicyScheduleDialog'
import { useSchedulePermissions } from './hooks/useSchedulePermissions'
import { getFeePolicyColumns } from './columns/FeePolicyList.column'
import { useExpandedPolicyIds } from './hooks/useExpandedPolicyIds'
import { useFeePolicyList } from './hooks/useFeePolicyList'
import { useFeePolicyStatus } from './hooks/useFeePolicyStatus'
import {
  dateOnly,
  FILTER_KEYS,
  isFeeScope,
  keepFilters
} from './utils/feePolicyUrlFilters'
import { splitPolicyStatusFilter } from './utils/policyStatusFilter'

/**
 * Danh sách chính sách phí tách theo luồng phí: tab "Phí đầu ra" (đầu ra) chỉ lấy chính
 * sách có phí thu của khách, tab "Phí đầu vào" (đầu vào) chỉ lấy chính sách có khoản ví
 * phải trả ngân hàng hoặc đối tác. Một chính sách có cả hai luồng thì có mặt ở cả hai tab và
 * mỗi tab chỉ hiện các thành phần của luồng đó, để đối soát từng luồng riêng.
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
  const status = useFeePolicyStatus()
  const { allowedActions } = useSchedulePermissions()
  const [scheduling, setScheduling] = useState<SchedulingPolicy | null>(null)
  const customerSegmentNames = useCustomerSegmentNames()
  const exportFilters = {
    feeScope,
    keyword: filters.keyword,
    subjectKeyword: filters.subjectKeyword,
    serviceType: filters.serviceType,
    status: filters.status,
    appliedTarget: filters.appliedTarget,
    bankCode: filters.bankCode,
    providerCode: filters.providerCode,
    paymentMethod: filters.paymentMethod,
    payerType: filters.payerType,
    beneficiaryType: filters.beneficiaryType,
    feeBearer: filters.feeBearer,
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
    applyFilters(keepFilters(filters, { feeScope: next, direction: null }))

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
            serviceType={filters.serviceType}
            values={{
              keyword: filters.keyword ?? '',
              subjectKeyword: filters.subjectKeyword ?? '',
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
              onEdit: (id) => navigate(PATHS.FEE_V4.POLICY_EDIT(id)),
              onActivate: status.askActivate,
              onDeactivate: status.deactivate,
              onSchedule: (id, name, policyStatus) =>
                setScheduling({ id, name, status: policyStatus }),
              busyId: status.busyId,
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

      <FeePolicyScheduleDialog
        policy={scheduling}
        allowedActions={allowedActions}
        onClose={() => setScheduling(null)}
      />

      <ReasonDialog
        open={Boolean(status.activating)}
        title='Kích hoạt chính sách phí'
        description={
          status.activating
            ? `Chính sách “${status.activating.name}” sẽ bắt đầu áp vào giao dịch thật.`
            : ''
        }
        label='Lý do kích hoạt'
        placeholder='Ví dụ: áp dụng biểu phí mới từ đầu quý'
        okText='Kích hoạt'
        confirmLoading={status.isActivating}
        onConfirm={status.confirmActivate}
        onCancel={status.cancelActivate}
      />
    </>
  )
}

export default FeePolicyList
