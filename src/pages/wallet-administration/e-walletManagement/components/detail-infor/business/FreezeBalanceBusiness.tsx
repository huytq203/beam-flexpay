import {
    ButtonComponent,
    CardComponent,
    Table,
    UnfreezeDecisionDialog,
    UnfreezeRequestDialog
} from '@components/index'
import { Column } from './configs/FreezeBalance.column'
import useFetchFreeze from './hooks/useFetchFreeze'

const FreezeBalanceBusiness = () => {
    const {
        dataFreeze,
        isLoadingGetFreeze,
        dataSource,
        page,
        setPage,
        setPageSize,
        size,
        isUnfreezeModalOpen,
        selectedFreezeItem,
        handleOpenUnfreezeModal,
        handleCloseUnfreezeModal,
        canApprove,
        openDecision,
        decisionDialogState
    } = useFetchFreeze()

    const column = Column({
        canApprove,
        onRelease: handleOpenUnfreezeModal,
        onDecide: openDecision
    })

    return (
        <div>
            <CardComponent className='mt-3' content={
                <>
                    <div className="flex justify-between items-center mb-3">
                        <span className='font-medium text-gray-600 text-lg'>Lịch sử đóng/mở băng</span>
                        <ButtonComponent content='Xuất Excel' />
                    </div>

                    <Table
                        scroll={{ x: 'max-content' }}
                        size='small'
                        bordered
                        columns={column}
                        dataSource={dataSource}
                        loading={isLoadingGetFreeze}
                        pagination={{
                            current: page,
                            pageSize: size,
                            total: dataFreeze?.totalElements || 0,
                            onChange: (page, pageSize) => {
                                setPage(page)
                                setPageSize(pageSize)
                            }
                        }}
                    />
                </>} />

            <UnfreezeRequestDialog
                open={isUnfreezeModalOpen}
                item={selectedFreezeItem}
                onSuccess={handleCloseUnfreezeModal}
                onCancel={handleCloseUnfreezeModal}
            />
            <UnfreezeDecisionDialog {...decisionDialogState} />
        </div>
    )
}

export default FreezeBalanceBusiness
