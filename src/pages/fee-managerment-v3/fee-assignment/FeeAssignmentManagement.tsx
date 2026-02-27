import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import FormAddAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormChoosePolicy'
import FormFieldAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormFieldAssign'
import { FormInforAdd } from '@pages/fee-managerment-v3/fee-assignment/components/FeeAssignAdd'
import {
  useLazyGetAssignQuery,
  useLazyGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import { FeeAssignment } from '@pages/fee-managerment-v3/constants/feeAssignment'
import { FeeAssignType } from '@pages/fee-managerment-v3/fee-assignment/schemas/feeAssign.schema'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import { useSVG } from '@hooks/useSVG'
import { FeeAssignmentManagementColumn } from './configs'
import usePagination from '@hooks/usePagination'
import { SkeletonFilterGroup, SkeletonTable } from '@components/ui/skeletons/Skeleton'
type ModeAction = 'ADD' | 'UPDATE' | ''
const FeeAssignmentManagement = () => {
  // state
  // const [page, setPage] = useState<number>(1)
  // const [pageSize, setPageSize] = useState(10)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalSelectPolicy, setOpenModalSelectPolicy] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
  // call api

  const { params, page, size, pageSize, setPage, setPageSize } = usePagination()

  const [getAllAssign, { data: dataFeeAssign, isLoading: loadingAll }] = useLazyGetAssignQuery()
  const [patchAssignActive] = usePatchAssignActiveMutation()
  const [patchAssignInActive] = usePatchAssignInActiveMutation()
  const [getAssignSearch, { data: searchData, isLoading: loadingSearch }] = useLazyGetAssignSearchQuery()
  // hook

  const { successMess, errorMess } = useMessage()
  const navigate = useNavigate()
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm<FeeAssignType>({
    shouldUnregister: true,
    defaultValues: {
      account: '',
      applyDate: '',
      applyType: '',
      createDate: ''
    }
  })
  const [postAssign, { isLoading: isPostAssign }] = usePostAssignMutation()
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState<FeeAssignType | null>(null)
  const { svg } = useSVG()

  // useEffect để gọi API khi page/pageSize thay đổi
  useEffect(() => {
    if (isSearching && searchParams) {
      getAssignSearch({
        ...searchParams,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }).unwrap()
    } else if (!isSearching) {
      getAllAssign({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }).unwrap()
    }
  }, [page, pageSize, isSearching, searchParams])

  //logic

  const handleSearch = useCallback(async (data: FeeAssignType) => {
    setPage(1) // Reset về trang 1
    setSearchParams(data) // Lưu params để pagination dùng
    setIsSearching(true) // Chuyển sang search mode
    // Gọi API search ngay lập tức
    await getAssignSearch({
      ...data,
      page: 1,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    }).unwrap()
  }, [pageSize, getAssignSearch, setPage])

  const handleReset = useCallback(() => {
    reset()
    setSearchParams(null)
    setIsSearching(false)
    setPage(1)
    setPageSize(10)
    // Gọi API getAll ngay lập tức
    getAllAssign({
      page: 1,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    })
  }, [reset, setPage, setPageSize, getAllAssign])
  const handleToggleStatus = useCallback(async (record: FeeAssignment) => {
    try {
      if (record.status === 'ACTIVE') {
        await patchAssignInActive(record.id).unwrap()
        successMess('Khóa thành công!')
      } else {
        await patchAssignActive(record.id).unwrap()
        successMess('Mở khóa thành công!')
      }
    } catch (error: any) {
      errorMess(error?.data?.detail || 'Có lỗi xảy ra')
    }
  }, [patchAssignInActive, patchAssignActive, successMess, errorMess])

  const handleDelete = useCallback(() => {
    alert('Delete ID:' + selectRowId)
  }, [selectRowId])

  const handlePostAssign = useCallback(async (data: FeeAssignType) => {
    try {
      const payload = {
        feePolicyId: data.feePolicyId,
        merchantId: data.merchantId,
        bankCode: data.bankCode,
        paymentMethod: data.paymentMethod,
        cardType: data.cardType,
        serviceType: data.serviceType,
        customerGroup: data.customerGroup || '',
        status: data.status
      }
      await postAssign(payload).unwrap()
      successMess('Thêm mới thành công!')
      setOpenModalAdd(false)
      reset()
    } catch {

    }
  }, [postAssign, successMess, reset])

  const handleSelectPolicy = useCallback((feePolicyId: string) => {
    setValue('feePolicyId', feePolicyId)
  }, [setValue])

  const columns = useMemo(() => FeeAssignmentManagementColumn({
    setOpenModalDelete,
    setSelectRowId,
    onToggleStatus: handleToggleStatus,
    navigate
  }), [handleToggleStatus, navigate])

  const listData: FeeAssignment[] = useMemo(() =>
    (isSearching ? searchData?.content : dataFeeAssign?.content) || []
    , [isSearching, searchData?.content, dataFeeAssign?.content])

  const total = useMemo(() =>
    (isSearching ? searchData?.totalElements : dataFeeAssign?.totalElements) || 0
    , [isSearching, searchData?.totalElements, dataFeeAssign?.totalElements])

  const dataSource = useMemo(() => listData.map((item, idx: number) => ({
    ...item,
    no: (page - 1) * pageSize + idx + 1
  })), [listData, page, pageSize])

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }, [setPage, setPageSize])

  const handleOpenModalAdd = useCallback(() => {
    setIsCreate(true)
    setOpenModalAdd(true)
  }, [])

  const handleCloseModalAdd = useCallback(() => {
    setOpenModalAdd(false)
  }, [])

  const handleCloseModalDelete = useCallback(() => {
    setOpenModalDelete(false)
  }, [])

  const handleCloseModalSelectPolicy = useCallback(() => {
    setOpenModalSelectPolicy(false)
  }, [])

  return (
    <>

      {
        (loadingAll) ? (
          <>
            <div className=" mb-3">
              <SkeletonFilterGroup items={2} />
            </div>
            <SkeletonTable rows={5} columns={3} />
          </>
        ) : (
          <>
            <CardComponent
              content={
                <>
                  <form action='formViewAssign'>
                    <FormFieldAssign
                      control={control}
                      setValue={setValue}
                      isCreate={isCreate}
                    />
                  </form>
                  <div className='flex flex-col md:flex-row md:justify-between mt-4'>
                    <div className='flex flex-col md:flex-row  justify-center items-center gap-2'>
                      <ButtonComponent
                        icon={svg('/icons.svg#hugeicons-search-01')}
                        content='Search'
                        onClick={handleSubmit(handleSearch)}
                        className='w-full md:w-auto'
                      />
                      <ButtonComponent
                        type='default'
                        icon={svg('/icons.svg#hugeicons-delete-02')}
                        content='Xóa bộ lọc'
                        onClick={handleReset}
                        className='w-full md:w-auto'
                      />

                    </div>
                    <div className='flex justify-center items-center'>
                      <ButtonComponent
                        icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
                        content='Thiết lập phí'
                        onClick={handleOpenModalAdd}
                        className='w-full md:w-auto'
                      />
                    </div>
                  </div>
                </>
              }
            />

            <CardComponent
              className='mt-3'
              content={
                <Table
                  scroll={{ x: 'max-content' }}
                  rowKey='id'
                  bordered
                  columns={columns}
                  dataSource={dataSource}
                  size='small'
                  pagination={{
                    current: page,
                    showSizeChanger: true,
                    pageSize: pageSize,
                    total: total,
                    onChange: handlePaginationChange
                  }}
                />
              }
            />
          </>
        )


      }




      <DialogModal
        onOk={handleDelete}
        onCancel={handleCloseModalDelete}
        open={openModalDelete}
        content='Bạn có xác nhận xóa ?'
        mode='DELETE'
      />
      <ModalComponent
        title={'Thêm gán phí'}
        width={{ xs: "100% ", md: "70%" }}
        open={openModalAdd}
        // footer={null}
        okButtonProps={{
          htmlType: 'submit',
          form: 'formAssign'
        }}
        // onOk={handlePostAssign}
        onCancel={handleCloseModalAdd}
        confirmLoading={isPostAssign}
        modalText={
          <FormInforAdd
            svg={svg}
            id={undefined}
            handlePutAssign={async () => { }}
            handlePostAssign={handlePostAssign}
            isCreate={isCreate}
          />
        }
      />
      <ModalComponent
        title={'Chọn chính sách phí'}
        width={{ xs: "100% ", md: "70%" }}
        open={openModalSelectPolicy}
        onOk={handleCloseModalSelectPolicy}
        onCancel={handleCloseModalSelectPolicy}
        modalText={<FormAddAssign onSelect={handleSelectPolicy} serviceType={watch('serviceType')} />}
      />
    </>
  )
}

export default FeeAssignmentManagement
