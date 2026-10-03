import { Can } from '@/app/permissions'
import { FeeScopeTabs } from '@pages/fee-management/fee-config/components/FeeScopeTabs'
import {
  FEE_SCOPE,
  FEE_SCOPES,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import {
  PlusIcon,
  WarningCircleIcon
} from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
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
import { FeePolicyExpandedDetail } from './components/FeePolicyExpandedDetail'
import { getFeePolicyColumns } from './columns/FeePolicyList.column'
import { useFeePolicyList } from './hooks/useFeePolicyList'
import { useFeePolicyStatus } from './hooks/useFeePolicyStatus'

const FILTER_KEYS = [
  'feeScope',
  'keyword',
  'subjectKeyword',
  'status',
  'appliedTarget',
  'direction',
  'serviceType',
  'bankCode',
  'paymentMethod',
  'validFrom',
  'validTo',
  'createdAtFrom',
  'createdAtTo'
] as const

const dateOnly = (value: string | undefined): string | null =>
  value ? value.slice(0, 10) : null

const isFeeScope = (value: unknown): value is FeeScope =>
  FEE_SCOPES.some((scope) => scope === value)

/**
 * Danh sách chính sách phí tách theo luồng phí: tab "Phí đầu ra" (đầu ra) chỉ lấy chính
 * sách có phí thu của khách, tab "Phí đầu vào" (đầu vào) chỉ lấy chính sách có khoản ví
 * phải trả ngân hàng hoặc đối tác. Một chính sách có cả hai luồng thì có mặt ở cả hai tab và
 * mỗi tab chỉ hiện các thành phần của luồng đó, để đối soát từng luồng riêng.
 */
const FeePolicyList = () => {
  const navigate = useNavigate()
  const { filters, applyFilters, clearFilters, page, size, setPage, setPageSize } =
    useUrlFilters({ keys: FILTER_KEYS })

  const feeScope = isFeeScope(filters.feeScope)
    ? filters.feeScope
    : FEE_SCOPE.OUTPUT_FEE
  const status = useFeePolicyStatus()
  const customerSegmentNames = useCustomerSegmentNames()
  const exportFilters = {
    feeScope,
    keyword: filters.keyword,
    subjectKeyword: filters.subjectKeyword,
    serviceType: filters.serviceType,
    status: filters.status,
    appliedTarget: filters.appliedTarget,
    bankCode: filters.bankCode,
    paymentMethod: filters.paymentMethod,
    validFrom: filters.validFrom,
    validTo: filters.validTo,
    createdAtFrom: filters.createdAtFrom,
    createdAtTo: filters.createdAtTo
  }
  const expansionResetKey = JSON.stringify({ ...exportFilters, page, size })
  const [expansionState, setExpansionState] = useState<{
    queryKey: string
    policyIds: string[]
  }>({ queryKey: expansionResetKey, policyIds: [] })
  const expandedPolicyIds =
    expansionState.queryKey === expansionResetKey
      ? expansionState.policyIds
      : []
  const updateExpandedPolicyIds = (
    update: (current: string[]) => string[]
  ) =>
    setExpansionState((current) => ({
      queryKey: expansionResetKey,
      policyIds: update(
        current.queryKey === expansionResetKey ? current.policyIds : []
      )
    }))
  const { rows, total, isFetching, isError, refetch } = useFeePolicyList({
    filters: exportFilters,
    page,
    size
  })
  const pagePolicyIds = rows.map(({ id }) => id)
  const allExpanded =
    pagePolicyIds.length > 0 &&
    pagePolicyIds.every((id) => expandedPolicyIds.includes(id))
  const [triggerExport, { reset: resetExport }] =
    useExportFeePoliciesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'cau-hinh-phi'
  })

  // Đổi luồng phí giữ nguyên mọi bộ lọc khác: loại giao dịch dùng chung cho cả hai luồng.
  const handleScopeChange = (next: FeeScope) =>
    applyFilters({
      feeScope: next,
      keyword: filters.keyword ?? null,
      subjectKeyword: filters.subjectKeyword ?? null,
      status: filters.status ?? null,
      appliedTarget: filters.appliedTarget ?? null,
      direction: null,
      serviceType: filters.serviceType ?? null,
      bankCode: filters.bankCode ?? null,
      paymentMethod: filters.paymentMethod ?? null,
      validFrom: filters.validFrom ?? null,
      validTo: filters.validTo ?? null,
      createdAtFrom: filters.createdAtFrom ?? null,
      createdAtTo: filters.createdAtTo ?? null
    })

  const handleToggleAll = () =>
    updateExpandedPolicyIds((current) =>
      allExpanded
        ? current.filter((id) => !pagePolicyIds.includes(id))
        : [...new Set([...current, ...pagePolicyIds])]
    )

  const tableActions = (
    <>
      <ExportCsvButton
        onExport={() => exportFile(exportFilters)}
        loading={isExporting}
        disabled={total === 0 || isError}
        tooltip='File lấy trọn bộ lọc đang áp, không giới hạn theo trang; gồm chính sách phí, bản gán, thành phần phí và các bậc phí.'
      />
      <Can screen='FEE_CONFIG' action='create'>
        <ButtonComponent
          htmlType='button'
          type='primary'
          content='Thêm chính sách phí'
          icon={<PlusIcon size={16} weight='bold' aria-hidden />}
          onClick={() => navigate(PATHS.FEE_V4.POLICY_CREATE)}
        />
      </Can>
    </>
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
              paymentMethod: filters.paymentMethod ?? '',
              validFrom: filters.validFrom ?? '',
              validTo: filters.validTo ?? '',
              createdAtFrom: filters.createdAtFrom ?? '',
              createdAtTo: filters.createdAtTo ?? ''
            }}
            onServiceTypeChange={(serviceType) =>
              applyFilters({
                feeScope,
                keyword: filters.keyword ?? null,
                subjectKeyword: filters.subjectKeyword ?? null,
                status: filters.status ?? null,
                appliedTarget: filters.appliedTarget ?? null,
                direction: null,
                serviceType: serviceType ?? null,
                bankCode: filters.bankCode ?? null,
                paymentMethod: null,
                validFrom: filters.validFrom ?? null,
                validTo: filters.validTo ?? null,
                createdAtFrom: filters.createdAtFrom ?? null,
                createdAtTo: filters.createdAtTo ?? null
              })
            }
            onSubmit={(values) =>
              applyFilters({
                feeScope,
                direction: null,
                serviceType: filters.serviceType ?? null,
                keyword: values.keyword,
                subjectKeyword: values.subjectKeyword,
                status: values.status,
                appliedTarget: values.appliedTarget,
                bankCode: values.bankCode,
                paymentMethod: values.paymentMethod,
                validFrom: dateOnly(values.validFrom),
                validTo: dateOnly(values.validTo),
                createdAtFrom: dateOnly(values.createdAtFrom),
                createdAtTo: dateOnly(values.createdAtTo)
              })
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
          <div className='flex flex-col items-start gap-3 py-8'>
            <p className='flex items-center gap-2 text-[13px] font-semibold text-danger-strong'>
              <WarningCircleIcon size={18} weight='bold' aria-hidden />
              Không tải được danh sách chính sách phí
            </p>
            <p className='max-w-[60ch] text-[13px] text-muted-foreground'>
              Dịch vụ phí chưa trả lời. Thử lại; nếu vẫn lỗi thì báo đội vận hành
              hệ thống.
            </p>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Thử lại'
              onClick={refetch}
            />
          </div>
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
