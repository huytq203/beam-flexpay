// ============================================
// PolicySelectModal - Policy Selection Modal Component
// ============================================
// Refactored from FormAddAssign.tsx
// ============================================

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { Radio } from 'antd'
import { CardComponent, Table } from '@components/common'
import { FormInput } from '@components/form'
import { useForm } from 'react-hook-form'
import useDebounce from '@hooks/useDebounce'
import {
  useGetFeePoliciesQuery,
  useLazySearchFeePoliciesQuery
} from '@services/apiFeePoliciesServices'
import { getEnumLabel } from '../../utils'
import { serviceType } from '../../types'

// ============================================
// Types
// ============================================
interface PolicySelectModalProps {
  onSelect?: (feePolicyId: string) => void
}

interface PolicyRecord {
  key: string
  no: number
  name: string
  serviceType: string
}

// ============================================
// Component
// ============================================
const PolicySelectModal: React.FC<PolicySelectModalProps> = ({ onSelect }) => {
  // State
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Debounced search
  const debouncedSearchValue = useDebounce(searchValue, 500)

  // API queries
  const queryParams = useMemo(() => ({
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'DESC' as const
  }), [page, pageSize])

  const { data: policiesData } = useGetFeePoliciesQuery(queryParams)
  const [triggerSearch, { data: searchResult }] = useLazySearchFeePoliciesQuery()

  // Form for search input
  const { control: searchControl } = useForm({
    defaultValues: { keyword: '' },
    shouldUnregister: true
  })

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue) {
      triggerSearch({
        keyword: debouncedSearchValue,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
    }
  }, [debouncedSearchValue, page, pageSize, triggerSearch])

  // Derived data
  const list = debouncedSearchValue ? searchResult?.content : policiesData?.content
  const total = debouncedSearchValue ? searchResult?.totalElements : policiesData?.totalElements

  const dataSource: PolicyRecord[] = useMemo(() => {
    return (list || []).map((item, index) => ({
      key: item.id!,
      no: (page - 1) * pageSize + index + 1,
      name: item.name,
      serviceType: item.serviceType
    }))
  }, [list, page, pageSize])

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    onSelect?.(id)
  }, [onSelect])

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }, [])

  // Memoized columns
  const columns = useMemo(() => [
    {
      title: 'STT',
      dataIndex: 'no',
      width: 60,
      align: 'center' as const,
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
      title: 'Chọn',
      dataIndex: 'check',
      align: 'center' as const,
      className: 'border border-l-0 border-b-0',
      render: (_: unknown, record: PolicyRecord) => (
        <Radio
          checked={selectedId === record.key}
          onChange={() => handleSelect(record.key)}
        />
      )
    }
  ], [selectedId, handleSelect])

  return (
    <div>
      <CardComponent
        content={
          <>
            <FormInput
              control={searchControl}
              name="keyword"
              label="Tìm kiếm tên chính sách"
              placeholder="Tìm kiếm tên chính sách..."
              onChange={handleSearchChange}
            />
            <div className="mt-3">
              <Table
                size="small"
                columns={columns}
                dataSource={dataSource}
                pagination={{
                  current: page,
                  showSizeChanger: true,
                  pageSize: pageSize,
                  total: total || 0,
                  onChange: handlePaginationChange
                }}
              />
            </div>
          </>
        }
      />
    </div>
  )
}

export default memo(PolicySelectModal)
