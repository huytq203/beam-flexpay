import { CardComponent, Table } from '@components/common'
import { FormInput } from '@components/form'
import { FormChoosePolicyColumn } from '@pages/fee-managerment-v3/fee-assignment/configs'
import { useFormChoosePolicy } from '@pages/fee-managerment-v3/fee-assignment/hook'

interface FormChoosePolicyProps {
  onSelect?: (feePolicyId: string) => void
  defaultSelectedId?: string
}

const FormChoosePolicy = ({ onSelect, defaultSelectedId }: FormChoosePolicyProps) => {
  const { controlSearch, handleSunmitSearch, resetSearch, dataSource, isSearching, total, pageListPolicy, setPageListPolicy, pageSizeListPolicy, setPageSizeListPolicy, selectedId, setSelectedId, searchValue, setSearchValue } = useFormChoosePolicy(defaultSelectedId)
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

export default FormChoosePolicy
