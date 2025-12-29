import { CardComponent, CheckboxComponent, Table } from '@components/common'
import { Radio } from 'antd'
import { FormInput } from '@components/form'
import { getEnumLabel } from '@pages/fee-managerment-v3/utils/FeeManagement.utils'
import { useGetFeePoliciesQuery, useLazySearchFeePoliciesQuery } from '@services/apiFeePoliciesServices'
import useDebounce from '@hooks/useDebounce'
import { serviceType } from '@type/feePoliciesComponent'
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

interface FormAddAssignProps {
  onSelect?: (feePolicyId: string) => void
}

const FormAddAssign = ({ onSelect }: FormAddAssignProps) => {
  // state
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pageListPolicy, setPageListPolicy] = useState(1)
  const [pageSizeListPolicy, setPageSizeListPolicy] = useState(10)
  // api data

  const queryParams = useMemo(() => ({
    page: pageListPolicy,
    size: pageSizeListPolicy,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  }), [pageListPolicy, pageSizeListPolicy])
  const { data: dataPolicy } = useGetFeePoliciesQuery(queryParams)

  const debouncedSearchValue = useDebounce(searchValue, 500)
  const [triggerSearch, { data: searchResult, isFetching: isSearching }] = useLazySearchFeePoliciesQuery()

  // handle
  const list = (debouncedSearchValue ? searchResult?.content : dataPolicy?.content) || []
  const total = (debouncedSearchValue ? searchResult?.totalElements : dataPolicy?.totalElements) || 0

  React.useEffect(() => {
    if (debouncedSearchValue) {
      triggerSearch({
        keyword: debouncedSearchValue, page: pageListPolicy,
        size: pageSizeListPolicy,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
    }
  }, [debouncedSearchValue])

  const dataSource = list.map((item, index) => ({
    key: item.id,
    no: (pageListPolicy - 1) * pageSizeListPolicy + index + 1,
    name: item.name,
    serviceType: item.serviceType,
    status: item.status,
    feeDomain: item.feeDomain,
    currency: item.currency,
    validFrom: item.validFrom,
    validTo: item.validTo
  }))
  const {
    control: controlSearch,
    handleSubmit: handleSunmitSearch,
    reset: resetSearch
  } = useForm({
    defaultValues: {
      keyword: ''
    },
    shouldUnregister: true
  })

  return (
    <div>
      <CardComponent
        content={
          <>
            <FormInput
              control={controlSearch}
              name='keyword'
              label='Tìm kiếm tên chính sách'
              placeholder='Tìm kiếm tên chính sách...'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            />
            <div className='mt-3'>
              <Table
                size='small'
                columns={[
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
                    className: 'border border-l-0  border-b-0',
                  },
                  {
                    title: 'Loại dịch vụ',
                    dataIndex: 'serviceType',
                    className: 'border border-l-0  border-b-0',
                    render: (value: string) => getEnumLabel(value, serviceType)
                  },
                  {
                    title: 'Chọn',
                    dataIndex: 'check',
                    align: 'center',
                    className: 'border border-l-0  border-b-0',
                    render: (_, record) => (
                      <Radio
                        checked={selectedId === record.key}
                        onChange={() => {
                          setSelectedId(record.key as string)
                          if (onSelect) {
                            onSelect(record.key as string)
                          }
                        }}
                      />
                    )
                  }
                ]}
                dataSource={dataSource}
                pagination={{
                  current: pageListPolicy,
                  showSizeChanger: true,
                  pageSize: pageSizeListPolicy,
                  total: total,
                  onChange: (page, pageSize) => {
                    setPageListPolicy(page)
                    setPageSizeListPolicy(pageSize)
                  }
                }}
              />
            </div>
          </>
        }
      />
    </div>
  )
}

export default FormAddAssign
