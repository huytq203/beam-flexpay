import { CardComponent, Table, UnfreezeDecisionDialog, UnfreezeRequestDialog } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import { getColumn } from './columns/FrozenTransactions.column'
import useFrozenTransactions from './hooks/useFrozenTransactions'
import { SkeletonButton, SkeletonInput, SkeletonTable, SkeletonTitle } from '@components/ui/skeletons/Skeleton'

const FrozenTransactions = () => {
    const {
        dataSource,
        totalElements,
        page,
        pageSize,
        setPage,
        setPageSize,
        refetch,
        isFetching,
        handleSearch,
        isLoading,
        isUnfreezeModalOpen,
        selectedFreezeItem,
        handleOpenUnfreezeModal,
        handleCloseUnfreezeModal,
        canApprove,
        openDecision,
        decisionDialogState,
    } = useFrozenTransactions()

    const columns = getColumn({
        canApprove,
        onRelease: handleOpenUnfreezeModal,
        onDecide: openDecision,
    })

    return (
        <>
            <CardComponent className="mb-3!" content={
                isLoading ?
                    <>
                        <div>
                            <SkeletonTitle />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <SkeletonInput key={index} />
                                ))}
                            </div>

                            <div className="flex justify-end mt-3 gap-1">
                                <SkeletonButton size="md" />
                                <SkeletonButton size="md" />
                            </div>
                        </div>
                    </> : <FormSearch onSearch={handleSearch} />} />
            <CardComponent
                content={   
                    isLoading ? <SkeletonTable columns={8} /> :
                        <Table
                            columns={columns}
                            size="small"
                            rowKey="id"
                            bordered
                            loading={isFetching}
                            onRefresh={refetch}
                            scroll={{ x: 'max-content' }}
                            dataSource={dataSource}
                            pagination={{
                                current: page,
                                pageSize,
                                total: totalElements,
                                showSizeChanger: true,
                                onChange: (p, ps) => {
                                    setPage(p)
                                    setPageSize(ps)
                                },
                            }}
                        />
                }
            />
            <UnfreezeRequestDialog
                open={isUnfreezeModalOpen}
                item={selectedFreezeItem}
                onSuccess={handleCloseUnfreezeModal}
                onCancel={handleCloseUnfreezeModal}
            />
            <UnfreezeDecisionDialog {...decisionDialogState} />
        </>
    )
}

export default FrozenTransactions
