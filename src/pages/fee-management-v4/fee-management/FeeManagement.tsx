import { FormInput, FormSelect } from '@components/form'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { feeDomain, serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSVG } from '@hooks/useSVG'
import useFetchDataFee from './hooks/useFetchDataFee'
import useHandleAddFeePolicy from './hooks/useHandleAddFeePolicy'
import { getColumnFeePolicy } from './columns/FeeManagement.column'
import { dataSearch } from './types/FeeManagement.type'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
import * as Icons from '@components/icons'
import { STATUS_LABEL } from './constants/FeeManagement.constant'
const FeeManagement = () => {
  const { dataSource, page, size: pageSize, setPage, setPageSize, total, setFilters, isFetchingFeeManagement } = useFetchDataFee()
  const { svg } = useSVG()
  const { control, handleSubmit, reset } = useForm<dataSearch>()
  const { handleSearch, handleReset, handleActive, handleInactive, isLoadingPatchActivateFee, isLoadingPatchDeactivateFee, loadingId } = useHandleAddFeePolicy({ setFilters, setPage, reset })
  const navigate = useNavigate()
  const columns = useMemo(() => getColumnFeePolicy({ navigate, handleActive, handleInactive, isLoadingPatchActivateFee, isLoadingPatchDeactivateFee, loadingId }), [navigate, handleActive, handleInactive, isLoadingPatchActivateFee, isLoadingPatchDeactivateFee, loadingId])
  return (
    <>
      <CardComponent
        className='mb-3'
        content={
          <>
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
            <form
              action=''
              onSubmit={handleSubmit(handleSearch)}
              id='feeManagement'
            >
              <div className='grid grid-cols-1 md:grid-cols-12  gap-3'>
                <FormInput
                  name='keyword'
                  control={control}
                  classNameLable="font-medium"
                  label='Tên chính sách'
                  placeholder='Nhập tên chính sách..'
                  className='col-span-12 md:col-span-6 flex flex-col'
                />

                <FormSelect
                  name='serviceType'
                  control={control}
                  classNameLable="font-medium"
                  label='Loại dịch vụ'
                  placeholder='Chọn loại dịch vụ'
                  options={mapEnumToSelectOptions(serviceType)}
                  className='col-span-12 md:col-span-6 flex flex-col'
                />
                <FormSelect
                  name='status'
                  control={control}
                  label='Trạng thái'
                  placeholder="Chọn trạng thái"
                  options={mapEnumToSelectOptions(STATUS_LABEL)}
                  className='col-span-12 md:col-span-6 flex flex-col'
                />

                <FormSelect
                  name='feeDomain'
                  control={control}
                  label='Phí miền'
                  placeholder='Chọn phí miền'
                  options={mapEnumToSelectOptions(feeDomain)}
                  className='col-span-12 md:col-span-6 flex flex-col'
                />

                <div className='col-span-12 flex flex-col md:flex-row md:justify-between gap-3'>
                  <div className='flex gap-2 w-full md:w-auto flex-row'>
                    <ButtonComponent
                      htmlType='submit'
                      form='feeManagement'
                      icon={<Icons.SearchOutlined style={{ fontSize: 18 }} />}
                      content='Search'
                      className='flex-1 md:flex-none'
                    />
                    <ButtonComponent
                      htmlType='button'
                      content='Xóa bộ lọc'
                      type='default'
                      onClick={handleReset}
                      icon={<Icons.DeleteOutlined style={{ fontSize: 18 }} />}
                      className='flex-1 md:flex-none'
                    />
                  </div>
                  <div className='w-full md:w-auto'>
                    {true && (
                      <ButtonComponent
                        htmlType='button'
                        content='Thêm chính sách phí'
                        onClick={() => navigate(PATHS.FEE_V4.ADD_FEE_POLICY)}
                        type='primary'
                        icon={<Icons.PlusCircleOutlined style={{ fontSize: 18 }} />}
                        className='w-full md:w-auto'
                      />
                    )}
                  </div>
                </div>
              </div>
            </form>

          </>
        }
      />

      <CardComponent
        content={
          <>
            <div className='mt-2'>
              <Table
                tableLayout="fixed"
                size='small'
                dataSource={dataSource}
                columns={columns}
                loading={isFetchingFeeManagement}
                pagination={{
                  current: page,
                  showSizeChanger: true,
                  pageSize: pageSize,
                  total: total,
                  onChange: (page, pageSize) => {
                    setPage(page)
                    setPageSize(pageSize)
                  },
                  showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
                }}
              />
            </div>
          </>
        }
      />


    </>
  )
}

export default FeeManagement