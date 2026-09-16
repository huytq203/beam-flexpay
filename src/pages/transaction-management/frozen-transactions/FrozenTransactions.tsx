import { CardComponent, ExportCsvButton, Table, UnfreezeRequestDialog } from '@components/index'
import { EXPORT_ORDER_HINT } from '@constants/export'
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
        handleExport,
        isExporting,
    } = useFrozenTransactions()

    const columns = getColumn({
        onRelease: handleOpenUnfreezeModal,
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
                        <>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <span className="font-medium text-gray-600 text-lg">
                                    Giao dịch đóng băng
                                </span>
                                <ExportCsvButton
                                    onExport={handleExport}
                                    loading={isExporting}
                                    disabled={!totalElements}
                                    totalRows={totalElements}
                                    tooltip={`File lấy trọn bộ lọc đang áp, không giới hạn theo trang. ${EXPORT_ORDER_HINT}`}
                                />
                            </div>
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
                        </>
                }
            />
            <UnfreezeRequestDialog
                open={isUnfreezeModalOpen}
                item={selectedFreezeItem}
                onSuccess={handleCloseUnfreezeModal}
                onCancel={handleCloseUnfreezeModal}
            />
        </>
    )
}

export default FrozenTransactions
