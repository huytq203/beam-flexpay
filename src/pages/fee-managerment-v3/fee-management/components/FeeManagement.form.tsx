import { ButtonComponent, CardComponent, Table } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { feePolicies, feeSearch, statusType } from '@pages/fee-managerment-v3/constants/feePolicies'
import { feeDomain, serviceType } from '@pages/fee-managerment-v3/constants/feePoliciesComponent'
import React from 'react'
import { Control, UseFormHandleSubmit, UseFormReset } from 'react-hook-form'
import { ColumnsType } from 'antd/es/table'
import { useSVG } from '@hooks/useSVG'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { is } from 'zod/v4/locales'
import { SkeletonCard, SkeletonStats, SkeletonTable } from '@components/ui/skeletons/Skeleton'
import usePermission from '@hooks/usePermission'
import usePermissionCheck from '@hooks/usePermissionCheck'

interface PolicyRecord {
  key: string
  no: number
  name: string
  serviceType: string
  status: string
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string
}

interface FeeManagementFormProps {
  control: Control<feeSearch>
  handleSubmit: UseFormHandleSubmit<feeSearch>
  reset: UseFormReset<feeSearch>
  handleSearch: (data: feeSearch) => void
  onReset: () => void
  setOpen: (open: boolean) => void
  dataSource: PolicyRecord[]
  columns: ColumnsType<PolicyRecord>
  page: number
  pageSize: number
  total: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setIsCreate: (value: boolean) => void

  loadingSearch: boolean
  loadingAll: boolean
}

const FeeManagementForm = ({
  handleSubmit,
  handleSearch,
  control,
  reset,
  onReset,
  setOpen,
  dataSource,
  columns,
  page,
  pageSize,
  total,
  setPage,
  setPageSize,
  setIsCreate,
  loadingSearch,
  loadingAll
}: FeeManagementFormProps) => {
  const { svg } = useSVG()
  const { hasAnyPermission } = usePermissionCheck()
  const canCreate = hasAnyPermission(['FEE:CREATE', 'FEE:FULL', 'ADMIN:FULL'])

  return (
    <>
      <CardComponent
        className='mb-3'
        content={
          <>

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
                  options={mapEnumToSelectOptions(statusType)}
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
                      icon={svg('/icons.svg#hugeicons-search-01')}
                      content='Search'
                      className='flex-1 md:flex-none'
                    />
                    <ButtonComponent
                      htmlType='button'
                      content='Xóa bộ lọc'
                      onClick={onReset}
                      type='default'
                      icon={svg('/icons.svg#hugeicons-delete-02')}
                      className='flex-1 md:flex-none'
                    />
                  </div>
                  <div className='w-full md:w-auto'>
                    {canCreate && (
                      <ButtonComponent
                        htmlType='button'
                        content='Thêm chính sách mới'
                        onClick={() => {
                          setOpen(true)
                          setIsCreate(true)
                        }}
                        type='primary'
                        icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
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
                pagination={{
                  current: page,
                  showSizeChanger: true,
                  pageSize: pageSize,
                  total: total,
                  onChange: (page, pageSize) => {
                    setPage(page)
                    setPageSize(pageSize)
                  }
                }}
              />
            </div>
          </>
        }
      />


    </>
  )
}

export default FeeManagementForm
