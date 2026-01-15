import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import FormAddAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormChoosePolicy'
import FormFieldAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormFieldAssign'
import { FormInforAdd } from '@pages/fee-managerment-v3/fee-assignment/components/FeeAssignAdd'
import {
  useGetAssignQuery,
  useLazyGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import {
  FeeAssignment,
} from '@type/feeAssignment'
import { FeeAssignType } from '@pages/fee-managerment-v3/fee-assignment/schemas/feeAssign.schema'

import React, { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import { useSVG } from '@hooks/useSVG'
import { FeeAssignmentManagementColumn } from './configs'
type ModeAction='ADD'|'UPDATE'|''
const FeeAssignmentManagement = () => {
  // state
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState(10)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalSelectPolicy, setOpenModalSelectPolicy] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
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
  } = useForm<FeeAssignType>({
    shouldUnregister: true,
    defaultValues:{
      account:'',
      applyDate:'',
      applyType:'',
      createDate:''
    }
  })
  const [postAssign,{isLoading:isPostAssign}] = usePostAssignMutation()
  const [isSearching, setIsSearching] = useState(false)
  const { svg } = useSVG()

  //logic

  const handleSearch = async (data: FeeAssignType) => {
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
      errorMess(error?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  function handleDelete() {
    alert('Delete ID:' + selectRowId)
  }

  const handlePostAssign = async (data: FeeAssignType) => {


    try {
      const payload = {
        feePolicyId: data.feePolicyId,
        merchantId: data.merchantId,
        bankCode: data.bankCode,
        paymentMethod: data.paymentMethod,
        cardType: data.cardType,
        serviceType: data.serviceType,
        customerGroup: data.customerGroup || '',
        status: data.status,
      }
      await postAssign(payload).unwrap()
      successMess('Thêm mới thành công!')
      setOpenModalAdd(false)
      reset()
    } catch (error: any) {
      errorMess(error?.data?.detail || 'Có lỗi xảy ra')
    }
  }

  const handleSelectPolicy = (feePolicyId: string) => {
    setValue('feePolicyId', feePolicyId)
  }

  const columns = FeeAssignmentManagementColumn({ setOpenModalDelete, setSelectRowId, onToggleStatus: handleToggleStatus, navigate })

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
            <form action="formViewAssign">
              <FormFieldAssign control={control} setValue={setValue} isCreate={isCreate} />
            </form>
            <div className='flex justify-between mt-4'>
              <div className='flex justify-center items-center gap-2'>
                <ButtonComponent icon={svg('/icons.svg#hugeicons-search-01')}
                  content='Search' onClick={handleSubmit(handleSearch)} />
                <ButtonComponent
                 type='default'
                  icon={svg('/icons.svg#hugeicons-delete-02')}
                  content='Xóa bộ lọc' onClick={handleReset} />
              </div>
              <div className='flex justify-center items-center'>
                <ButtonComponent
                  icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
                  content='Thiết lập phí'

                  onClick={() =>{
                    setIsCreate(true);
                    // navigate(FEEMANAGEMENR_V3 + '/fee-assignment/create')
                    setOpenModalAdd(true);
                  }
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
              bordered
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
      <ModalComponent
        title={'Thêm gán phí'}
        width='70%'
        open={openModalAdd}
        // footer={null}
        okButtonProps={{
          htmlType: 'submit', form: 'formAssign'
        }}
        // onOk={handlePostAssign}
        onCancel={() => setOpenModalAdd(false)}
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
        width='70%'
        open={openModalSelectPolicy}
        onOk={() => setOpenModalSelectPolicy(false)}
        onCancel={() => setOpenModalSelectPolicy(false)}
        modalText={<FormAddAssign onSelect={handleSelectPolicy} />}
      />

    </>
  )
}

export default FeeAssignmentManagement
