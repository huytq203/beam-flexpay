import { CardComponent, CheckboxComponent, Table } from '@components/common'
import { FormInput } from '@components/form'
import { getEnumLabel } from '@pages/fee-managerment-v3/FeeManagement.utils'
import { useGetFeePoliciesQuery } from '@services/apiFeePoliciesServices'
import { serviceType } from '@type/feePoliciesComponent'
import { TableRowSelection } from 'antd/es/table/interface'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

interface FormAddAssignProps {
  onSelect?: (feePolicyId: string) => void
}

const FormAddAssign = ({ onSelect }: FormAddAssignProps) => {
  // state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pageListPolicy, setPageListPolicy] = useState(1)
  const [pageSizeListPolicy, setPageSizeListPolicy] = useState(10)
  // api data

  const { data: dataPolicy } = useGetFeePoliciesQuery({
    pageListPolicy,
    size: pageSizeListPolicy,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  })

  // handle
  const list = dataPolicy?.content || []
  const total = dataPolicy?.totalElements || 0

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
      search: ''
    }
  })

  return (
    <div>
      <CardComponent
        content={
          <>
            <FormInput
              control={controlSearch}
              name='search'
              label='Tìm kiếm tên chính sách'
              placeholder='Tìm kiếm tên chính sách...'
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
                    className: 'border border-l-0  border-b-0'
                  },
                  {
                    title: 'Loại dịch vụ',
                    dataIndex: 'serviceType',
                    className: 'border border-l-0  border-b-0',
                    render: (value: string) => getEnumLabel(value, serviceType)
                  },
                  {
                    title: 'Chọn/bỏ chọn',
                    dataIndex: 'check',
                    align: 'center',
                    className: 'border border-l-0  border-b-0',
                    render: (_, record) => (
                      <CheckboxComponent
                        checked={selectedId === record.key}
                        onChange={() => {
                          const newId = selectedId === record.key ? null : record.key as string
                          setSelectedId(newId)
                          if (newId && onSelect) {
                            onSelect(newId)
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
