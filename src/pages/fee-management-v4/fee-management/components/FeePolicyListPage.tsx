import { Can } from '@/app/permissions'
import { FormInput, FormSelect } from '@components/form'
import * as Icons from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  FeeServiceTypeTabs,
  ReasonDialog,
  Table
} from '@components/index'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import { feeDomain } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import {
  BE_SUPPORTS_SERVICE_TYPE_LIST,
  getDirectionServiceTypeParam,
  isFeeDirection
} from '@utils/fee-direction'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getColumnFeePolicy } from '../columns/FeeManagement.column'
import { STATUS_LABEL } from '../constants/FeeManagement.constant'
import type { FeePolicyScope } from '../constants/feePolicyScope'
import useFetchDataFee from '../hooks/useFetchDataFee'
import useHandleAddFeePolicy from '../hooks/useHandleAddFeePolicy'
import type { dataSearch, FeePolicy } from '../types/FeeManagement.type'
import { cn } from '@/lib/utils/cn'

/**
 * Phí ngân hàng đã có màn riêng để đối soát nên không còn là một lựa chọn của
 * bộ lọc miền phí ở đây.
 */
const selectableFeeDomains = Object.fromEntries(
  Object.entries(feeDomain).filter(([key]) => key !== 'BANK')
)

// `direction` nằm chung một hook với các khoá còn lại để mọi thay đổi phạm vi
// chỉ ghi URL đúng MỘT lần — hai lần ghi trong cùng handler sẽ đè lên nhau.
const FILTER_KEYS = [
  'keyword',
  'serviceType',
  'status',
  'feeDomain',
  'direction'
] as const

interface FeePolicyListPageProps {
  scope: FeePolicyScope
}

export const FeePolicyListPage = ({ scope }: FeePolicyListPageProps) => {
  const { filters, applyFilters, clearFilters, page, size, setPage, setPageSize } =
    useUrlFilters({ keys: FILTER_KEYS })
  const direction = isFeeDirection(filters.direction) ? filters.direction : null

  const {
    dataSource,
    total,
    refetch,
    isFetchingFeeManagement
  } = useFetchDataFee({
    filters: {
      ...filters,
      // Khi API lọc được nhiều loại, chọn chiều là đủ; ngược lại chip loại dịch
      // vụ đã chốt sẵn một giá trị nên nhánh này trả undefined.
      serviceType: filters.serviceType || getDirectionServiceTypeParam(direction),
      // Miền phí của màn khoá cứng thì bộ lọc không được phép ghi đè.
      feeDomain: scope.lockedFeeDomain ?? filters.feeDomain
    },
    page,
    size
  })

  // Form chỉ là lớp nhập liệu; URL mới là nguồn sự thật, nên đồng bộ ngược lại
  // để F5 hay dán link vẫn thấy đúng ô đã điền.
  const { control, handleSubmit, reset } = useForm<dataSearch>({
    values: {
      keyword: filters.keyword ?? '',
      status: filters.status ?? '',
      feeDomain: filters.feeDomain ?? ''
    } as dataSearch
  })

  const navigate = useNavigate()
  const [activateId, setActivateId] = useState<string | null>(null)
  const {
    handleActive,
    handleInactive,
    isLoadingPatchActivateFee,
    isLoadingPatchDeactivateFee,
    loadingId
  } = useHandleAddFeePolicy({})

  const columns = useMemo(
    () =>
      getColumnFeePolicy({
        navigate,
        screen: scope.screen,
        editPath: scope.editPath,
        handleActive: setActivateId,
        handleInactive,
        isLoadingPatchActivateFee,
        isLoadingPatchDeactivateFee,
        loadingId
      }),
    [
      navigate,
      scope.screen,
      scope.editPath,
      handleInactive,
      isLoadingPatchActivateFee,
      isLoadingPatchDeactivateFee,
      loadingId
    ]
  )

  const handleConfirmActivate = async (reason: string) => {
    if (!activateId) return
    await handleActive(activateId, reason)
    setActivateId(null)
  }

  const handleReset = () => {
    clearFilters()
    reset({ keyword: '', status: '', feeDomain: '' } as dataSearch)
  }

  return (
    <>
      <CardComponent className='mb-3!'>
        <div className='mb-4 flex items-start gap-3 border-b border-border pb-3'>
          <div className='rounded-lg bg-blue-50 p-2'>
            <Icons.CreditCardOutlined className='text-[20px] text-blue-600' />
          </div>
          <div>
            <p className='text-[18px] font-bold leading-tight text-gray-800'>
              {scope.title}
            </p>
            <p className='mt-0.5 max-w-2xl text-[12px] font-medium text-gray-500'>
              {scope.description}
            </p>
          </div>
        </div>

        <FeeServiceTypeTabs
          direction={direction}
          serviceType={filters.serviceType}
          onChange={(next) =>
            applyFilters({
              ...filters,
              direction: next.direction,
              serviceType: next.serviceType ?? null
            })
          }
          labels={serviceType}
          supportsMultiServiceType={BE_SUPPORTS_SERVICE_TYPE_LIST}
        />

        <div className='mt-4 border-t border-border pt-3'>
          <p className='mb-3 flex items-center gap-2 font-bold text-blue'>
            <Icons.FunnelIcon /> Bộ lọc tìm kiếm
          </p>
          <form
            id='feeManagement'
            onSubmit={handleSubmit((data) =>
              // serviceType do hàng chip phía trên giữ — form không được ghi đè.
              applyFilters({
                direction: filters.direction ?? null,
                serviceType: filters.serviceType ?? null,
                keyword: data.keyword,
                status: data.status,
                feeDomain: data.feeDomain
              })
            )}
          >
            <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
              <FormInput
                name='keyword'
                control={control}
                classNameLable='font-medium'
                label='Tên chính sách'
                placeholder='Nhập tên chính sách..'
                className='col-span-12 flex flex-col md:col-span-6'
              />
              <FormSelect
                name='status'
                control={control}
                label='Trạng thái'
                placeholder='Chọn trạng thái'
                allowClear
                options={mapEnumToSelectOptions(STATUS_LABEL)}
                className={cn(!scope.lockedFeeDomain ? 'col-span-12 flex flex-col md:col-span-3' : 'col-span-12 flex flex-col md:col-span-6')}
              />
              {!scope.lockedFeeDomain && (
                <FormSelect
                  name='feeDomain'
                  control={control}
                  label='Phí miền'
                  placeholder='Chọn phí miền'
                  allowClear
                  options={mapEnumToSelectOptions(selectableFeeDomains)}
                  className='col-span-12 flex flex-col md:col-span-3'
                />
              )}

              <div className='col-span-12 flex flex-col gap-3 md:flex-row md:justify-between'>
                <div className='flex w-full flex-row gap-2 md:w-auto'>
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
                  <Can screen={scope.screen} action='create'>
                    <ButtonComponent
                      htmlType='button'
                      content={scope.createLabel}
                      onClick={() => navigate(scope.createPath)}
                      type='primary'
                      icon={<Icons.PlusCircleOutlined style={{ fontSize: 18 }} />}
                      className='w-full md:w-auto'
                    />
                  </Can>
                </div>
              </div>
            </div>
          </form>
        </div>
      </CardComponent>

      <CardComponent>
        <Table<FeePolicy>
          tableLayout='fixed'
          size='small'
          dataSource={dataSource}
          columns={columns}
          loading={isFetchingFeeManagement}
          onRefresh={refetch}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            showSizeChanger: true,
            pageSize: size,
            total: total,
            onChange: (nextPage, nextSize) => {
              if (nextSize !== size) {
                setPageSize(nextSize)
                return
              }
              setPage(nextPage)
            },
            showTotal: (count, range) =>
              `Hiển thị ${range[0]}-${range[1]}/ ${count} Bản ghi`
          }}
        />
      </CardComponent>

      <ReasonDialog
        open={Boolean(activateId)}
        title='Kích hoạt chính sách phí'
        description='Nhập lý do kích hoạt để lưu vào lịch sử phê duyệt.'
        label='Lý do kích hoạt'
        okText='Kích hoạt'
        confirmLoading={isLoadingPatchActivateFee}
        onConfirm={handleConfirmActivate}
        onCancel={() => setActivateId(null)}
      />
    </>
  )
}

