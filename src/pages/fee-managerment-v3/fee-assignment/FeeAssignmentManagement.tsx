import { addWaterWave } from '@antv/g2plot'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import { feeAssignColumn } from '@pages/fee-managerment-v3/fee-assignment/FeeAssignmentManagement.column'
import FormAddAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormAddAssign'
import FormFieldAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormFieldAssign'
import {
  useGetAssignQuery,
  useLazyGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import {
  FeeAssignment,
  FeeAssignmentMockup,
  FeeAssignResponse,
} from '@type/feeAssignment'
import { FeeAssignmentFormData } from '@pages/fee-managerment-v3/fee-assignment/hook/useFeeAssignmentForm'

import React, { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'

const FeeAssignmentManagement = () => {
  // state
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState(10)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')

  // call api

  const { data: dataFeeAssign } = useGetAssignQuery({
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  })
  const [patchAssignActive] = usePatchAssignActiveMutation()
  const [patchAssignInActive] = usePatchAssignInActiveMutation()
  const [getAssignSearch, { data: searchData }] = useLazyGetAssignSearchQuery()
  // hook

  const { successMess, errorMess } = useMessage()
  const navigate = useNavigate()
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue
  } = useForm<FeeAssignmentFormData>()
  const [isSearching, setIsSearching] = useState(false)

  //logic

  const handleSearch = async (data: any) => {
    const payload = {
      ...data,
      page,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    }
    await getAssignSearch(payload).unwrap()
    setIsSearching(true)
  }

  const handleReset = () => {
    reset()
    setPage(1)
    setPageSize(10)
    setIsSearching(false)
  }
  const handleToggleStatus = async (record: FeeAssignment) => {
    try {
      if (record.status === 'ACTIVE') {
        await patchAssignInActive(record.id).unwrap()
        successMess('Khóa thành công!')
      } else {
        await patchAssignActive(record.id).unwrap()
        successMess('Mở khóa thành công!')
      }
    } catch (error: any) {
      errorMess(error?.message || 'Có lỗi xảy ra')
    }
  }

  function handleDelete() {
    alert('Delete ID:' + selectRowId)
  }

  const columns = feeAssignColumn({ setOpenModalDelete, setSelectRowId, onToggleStatus: handleToggleStatus, navigate })

  const listData: FeeAssignment[] = (isSearching ? searchData?.content : dataFeeAssign?.content) || []

  const dataSource = listData.map((item, idx: number) => ({
    ...item,
    no: (page - 1) * pageSize + idx + 1
  }))

  return (
    <>
      <CardComponent
        content={
          <>
            <FormFieldAssign control={control} setValue={setValue}/>
            <div className='flex justify-between mt-4'>
              <div className='flex justify-center items-center gap-2'>
                <ButtonComponent icon={
                  <svg
                    width={20}
                    height={20}
                  >
                    <use href='/icons.svg#hugeicons-search-01' />
                  </svg>
                }
                  content='Search' onClick={handleSubmit(handleSearch)} />
                <ButtonComponent
                  icon={
                    <svg
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-delete-02' />
                    </svg>
                  }
                  content='Xóa bộ lọc' onClick={handleReset} />
              </div>
              <div className='flex justify-center items-center'>
                <ButtonComponent
                  icon={
                    <svg
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-plus-sign-circle' />
                    </svg>
                  }
                  content='Thiết lập phí'
                  onClick={() =>
                    navigate(FEEMANAGEMENR_V3 + '/fee-assignment/create')
                  }
                />
              </div>
            </div>
          </>
        }
      />

      <div className='mt-3'>
        <CardComponent
          content={
            <Table
              scroll={{ x: 'max-content' }}
              rowKey='id'
              columns={columns}
              dataSource={dataSource}
              size='small'
            />
          }
        />
      </div>

      <DialogModal
        onOk={handleDelete}
        onCancel={() => setOpenModalDelete(false)}
        open={openModalDelete}
        content='Bạn có xác nhận xóa ?'
      />
    </>
  )
}

export default FeeAssignmentManagement
