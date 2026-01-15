import {
  ModalComponent,
  CardComponent
} from '@components/common'
import FormAddPolicy from '@pages/fee-managerment-v3/components/FormAddPolicy'
import FeeManagementForm from './FeeManagement.form'
import useFeeManagement from './hooks/useFeeManagement'

const FeeManagement = () => {
 
const{control,handleSubmit,handleSearch,reset,setOpen,dataSource,columns,page,pageSize,total,setPage,setPageSize,setIsCreate,open,handleSubmitAdd,handleSaveAddFee,loadingNewPolicy,controlAdd,isCreate,searchFeePolicies,getSearchParams}=useFeeManagement()
  return (
    <>
      <CardComponent content={
        <FeeManagementForm
          control={control}
          handleSubmit={handleSubmit}
          handleSearch={handleSearch}
          reset={reset}
          onReset={() => {
            reset()
            searchFeePolicies(getSearchParams())
          }}
          setOpen={setOpen}
          dataSource={dataSource}
          columns={columns}
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
          setPageSize={setPageSize}
          setIsCreate={setIsCreate}
        />
      } />


      <ModalComponent
        title='Thêm chính sách mới'
        open={open}
        onOk={handleSubmitAdd(handleSaveAddFee)}
        onCancel={() => setOpen(false)}
        width='50%'
        confirmLoading={loadingNewPolicy}
        modalText={
          <CardComponent
            content={<FormAddPolicy
              control={controlAdd}
              handleSubmit={handleSubmitAdd}
              onSubmit={handleSaveAddFee}
              isCreate={isCreate}
            />
            }
          />

        }
      />
    </>
  )
}

export default FeeManagement
