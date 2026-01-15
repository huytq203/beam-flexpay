// ============================================
// PolicyListPage - Fee Policy List Container Component
// ============================================
// This is an example of a refactored container component that:
// 1. Uses custom hooks for all business logic
// 2. Follows Single Responsibility Principle
// 3. Optimizes performance with memoization
// 4. Has clean separation of concerns
// ============================================

import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table } from 'antd'
import {
  ModalComponent,
  CardComponent,
  ButtonComponent
} from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'

// Internal imports
import { useFeePolicy, useEnumOptions, useStatusOptions } from '../hooks'
import { StatusBadge, ActionButtons } from '../components/shared'
import PolicyForm from '../components/forms/PolicyForm'
import { getEnumLabel, formatDate, formatDateOrIndefinite } from '../utils'
import { serviceType, feeDomain } from '../types'
import type { PolicyTableRecord, TableColumns } from '../types'

// ============================================
// Column Generator (memoizable)
// ============================================
interface ColumnOptions {
  onEdit: (record: PolicyTableRecord) => void
  onActivate: (record: PolicyTableRecord) => void
  onDeactivate: (record: PolicyTableRecord) => void
}

const createPolicyColumns = ({
  onEdit,
  onActivate,
  onDeactivate
}: ColumnOptions): TableColumns<PolicyTableRecord> => [
  {
    title: 'STT',
    dataIndex: 'no',
    width: 60,
    align: 'center',
    className: 'border'
  },
  {
    title: 'Tên chính sách',
    dataIndex: 'name',
    className: 'border border-l-0 border-b-0'
  },
  {
    title: 'Loại dịch vụ',
    dataIndex: 'serviceType',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, serviceType)
  },
  {
    title: 'Phí miền',
    dataIndex: 'feeDomain',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, feeDomain)
  },
  {
    title: 'Loại tiền',
    dataIndex: 'currency',
    className: 'border border-l-0 border-b-0'
  },
  {
    title: 'Hiệu lực từ',
    dataIndex: 'validFrom',
    className: 'border border-l-0 border-b-0',
    render: (date: string) => formatDate(date)
  },
  {
    title: 'Hiệu lực đến',
    dataIndex: 'validTo',
    className: 'border border-l-0 border-b-0',
    render: (date: string) => formatDateOrIndefinite(date)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    className: 'border border-l-0 border-b-0',
    align: 'center',
    render: (status: string) => <StatusBadge status={status} />
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
    className: 'border border-l-0 border-b-0',
    align: 'center',
    render: (_, record) => (
      <ActionButtons
        record={record}
        status={record.status}
        onEdit={onEdit}
        onToggleStatus={
          record.status === 'ACTIVE'
            ? () => onDeactivate(record)
            : () => onActivate(record)
        }
        showDelete={false}
      />
    )
  }
]

// ============================================
// Search Form Component (presentational)
// ============================================
interface SearchFormProps {
  control: ReturnType<typeof useFeePolicy>['searchControl']
  onSearch: () => void
  onReset: () => void
  serviceTypeOptions: Array<{ label: string; value: string }>
  feeDomainOptions: Array<{ label: string; value: string }>
  statusOptions: Array<{ label: string; value: string }>
}

const SearchForm = React.memo<SearchFormProps>(({
  control,
  onSearch,
  onReset,
  serviceTypeOptions,
  feeDomainOptions,
  statusOptions
}) => (
  <div className="grid grid-cols-12 gap-4 mb-4">
    <FormInput
      control={control}
      name="keyword"
      label="Từ khóa"
      placeholder="Tìm kiếm theo tên..."
      className="col-span-3"
    />
    <FormSelect
      control={control}
      name="serviceType"
      label="Loại dịch vụ"
      placeholder="Tất cả"
      options={serviceTypeOptions}
      className="col-span-3"
    />
    <FormSelect
      control={control}
      name="feeDomain"
      label="Phí miền"
      placeholder="Tất cả"
      options={feeDomainOptions}
      className="col-span-2"
    />
    <FormSelect
      control={control}
      name="status"
      label="Trạng thái"
      placeholder="Tất cả"
      options={statusOptions}
      className="col-span-2"
    />
    <div className="col-span-2 flex items-end gap-2">
      <ButtonComponent
        type="primary"
        icon={<SearchOutlined />}
        content="Tìm kiếm"
        onClick={onSearch}
      />
      <ButtonComponent
        type="default"
        icon={<ReloadOutlined />}
        onClick={onReset}
      />
    </div>
  </div>
))

SearchForm.displayName = 'SearchForm'

// ============================================
// Main Component
// ============================================
/**
 * PolicyListPage - Container component for fee policy management
 *
 * @remarks
 * This component demonstrates the refactored architecture:
 * - All business logic is in the useFeePolicy hook
 * - Enum options are memoized via useEnumOptions
 * - Columns are memoized with useMemo
 * - Event handlers use useCallback to prevent re-renders
 * - Presentational components (SearchForm) are memoized
 */
const PolicyListPage: React.FC = () => {
  const navigate = useNavigate()

  // Custom hooks for all business logic
  const {
    dataSource,
    pagination,
    setPage,
    setPageSize,
    isModalOpen,
    openModal,
    closeModal,
    searchControl,
    handleSearchSubmit,
    resetSearch,
    addPolicyControl,
    handleAddSubmit,
    handleSearch,
    handleSavePolicy,
    handleActivate,
    handleDeactivate,
    isCreating
  } = useFeePolicy()

  // Memoized enum options
  const {
    serviceTypeOptions,
    feeDomainOptions,
    statusTypeOptions
  } = useEnumOptions()

  // Memoized create mode status options
  const createStatusOptions = useStatusOptions(true)

  // Memoized column handlers
  const handleEdit = useCallback(
    (record: PolicyTableRecord) => {
      navigate(`${FEEMANAGEMENT_V3}/edit/${record.key}`)
    },
    [navigate]
  )

  // Memoized columns to prevent re-creation on every render
  const columns = useMemo(
    () => createPolicyColumns({
      onEdit: handleEdit,
      onActivate: handleActivate,
      onDeactivate: handleDeactivate
    }),
    [handleEdit, handleActivate, handleDeactivate]
  )

  // Search form submission
  const onSearchSubmit = useCallback(
    () => handleSearchSubmit(handleSearch)(),
    [handleSearchSubmit, handleSearch]
  )

  // Add policy form submission
  const onAddSubmit = useCallback(
    () => handleAddSubmit(handleSavePolicy)(),
    [handleAddSubmit, handleSavePolicy]
  )

  return (
    <>
      <CardComponent
        content={
          <div>
            {/* Search Form */}
            <SearchForm
              control={searchControl}
              onSearch={onSearchSubmit}
              onReset={resetSearch}
              serviceTypeOptions={serviceTypeOptions}
              feeDomainOptions={feeDomainOptions}
              statusOptions={statusTypeOptions}
            />

            {/* Action Bar */}
            <div className="flex justify-end mb-4">
              <ButtonComponent
                type="primary"
                icon={<PlusOutlined />}
                content="Thêm chính sách"
                onClick={openModal}
              />
            </div>

            {/* Data Table */}
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bản ghi`,
                onChange: (page, size) => {
                  setPage(page)
                  if (size !== pagination.pageSize) {
                    setPageSize(size)
                  }
                }
              }}
              bordered
              size="small"
            />
          </div>
        }
      />

      {/* Add Policy Modal */}
      <ModalComponent
        title="Thêm chính sách mới"
        open={isModalOpen}
        onOk={onAddSubmit}
        onCancel={closeModal}
        width="50%"
        confirmLoading={isCreating}
        modalText={
          <CardComponent
            content={
              <PolicyForm
                control={addPolicyControl}
                statusOptions={createStatusOptions}
                isCreateMode
              />
            }
          />
        }
      />
    </>
  )
}

export default PolicyListPage
