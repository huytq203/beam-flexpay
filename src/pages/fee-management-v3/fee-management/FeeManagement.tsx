import FeeManagementForm from './components/FeeManagement.form'
import useFeeManagement from './hooks/useFeeManagement'
import { SkeletonFilterGroup, SkeletonTable } from '@components/ui/skeletons/Skeleton'
import StepPolicyModal from './components/StepPolicyModal'

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
    resetAdd,
    loadingSearch,
    loadingAll
  } = useFeeManagement()

  return (
    <>
      {
        (loadingAll) ? (
          <>
            <div className=" mb-3">
              <SkeletonFilterGroup />
            </div>
            <SkeletonTable rows={5} columns={3} />
          </>
        ) : <>
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
            
          <StepPolicyModal
            open={open}
            onClose={() => setOpen(false)}
            controlAdd={controlAdd}
            handleSubmitAdd={handleSubmitAdd}
            handleSaveAddFee={handleSaveAddFee}
            loadingNewPolicy={loadingNewPolicy}
            resetAdd={resetAdd}
          />
        </>
      }
    </>
  )
}

export default FeeManagement
