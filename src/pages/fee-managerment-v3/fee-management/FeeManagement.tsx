import { ModalComponent, CardComponent } from '@components/index'
import FormAddPolicy from '@pages/fee-managerment-v3/components/FormAddPolicy'
import FeeManagementForm from './components/FeeManagement.form'
import useFeeManagement from './hooks/useFeeManagement'
import { SkeletonCard, SkeletonFilterGroup, SkeletonStats, SkeletonTable, SkeletonText } from '@components/ui/skeletons/Skeleton'

const FeeManagement = () => {
  const {
    control,
    handleSubmit,
    handleSearch,
    handleReset,
    reset,
    setOpen,
    dataSource,
    columns,
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    setIsCreate,
    open,
    handleSubmitAdd,
    handleSaveAddFee,
    loadingNewPolicy,
    controlAdd,
    isCreate,
    loadingSearch,
    loadingAll

  } = useFeeManagement()
  return (
    <>
      {

        (loadingAll || loadingSearch) ? (


          <>  <div className=" mb-3">

            <SkeletonFilterGroup />

          </div>
            <SkeletonTable rows={5} columns={3} />
          </>
        )
          : <>

            <FeeManagementForm
              loadingSearch={loadingSearch}
              loadingAll={loadingAll}
              control={control}
              handleSubmit={handleSubmit}
              handleSearch={handleSearch}
              reset={reset}
              onReset={handleReset}
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

            <ModalComponent
              title='Thêm chính sách mới'
              open={open}
              onOk={handleSubmitAdd(handleSaveAddFee)}
              onCancel={() => setOpen(false)}
              width='50%'
              confirmLoading={loadingNewPolicy}
              modalText={
                <CardComponent
                  content={
                    <FormAddPolicy
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
      }
    </>
  )
}

export default FeeManagement
