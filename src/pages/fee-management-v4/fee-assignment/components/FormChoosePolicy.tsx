import { CardComponent, Table } from '@components/index'
import { FormInput } from '@components/form'
import React from 'react'
import { ComponentDetail } from './ComponentDetail'
import { FormChoosePolicyColumn } from '@pages/fee-management-v4/fee-assignment/configs'
import { useFormChoosePolicy } from '@pages/fee-management-v4/fee-assignment/hook'
import { feePolicyComponent } from '../constants/feePoliciesComponent'

interface FormChoosePolicyProps {
  onSelect?: (feePolicyId: string) => void
  defaultSelectedId?: string
  serviceType?: string
  dataFeePolicyComponent?: feePolicyComponent[]
}

const FormChoosePolicy = ({ onSelect, defaultSelectedId, serviceType, dataFeePolicyComponent }: FormChoosePolicyProps) => {
  const { controlSearch, handleSunmitSearch, resetSearch, dataSource, isSearching, total, pageListPolicy, setPageListPolicy, pageSizeListPolicy, setPageSizeListPolicy, selectedId, setSelectedId, searchValue, setSearchValue } = useFormChoosePolicy(defaultSelectedId, serviceType)
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
                bordered
                size='small'
                rowKey='id'
                columns={FormChoosePolicyColumn({ selectedId, onSelect, setSelectedId })}
                dataSource={dataSource}
                pagination={{
                  current: pageListPolicy,
                  showSizeChanger: true,
                  pageSize: pageSizeListPolicy,
                  total: total,
                  onChange: (page, pageSize) => {
                    setPageListPolicy(page)
                    setPageSizeListPolicy(pageSize)
                  },
                  showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
                }}
              />
            </div>
          </>
        }
      />
      {selectedId && dataFeePolicyComponent && dataFeePolicyComponent.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Thông tin thành phần</h3>
          {dataFeePolicyComponent.map((data: feePolicyComponent) => (
            <ComponentDetail
              key={data.id}
              data={data}
              setOpenModalDetail={() => { }}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FormChoosePolicy
