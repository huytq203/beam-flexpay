import { CardComponent, DialogModal, Table } from '@components/index'
import { SnowflakeIcon } from '@components/icons'
import React from 'react'
import FormSearch from './components/FormSearch'
import { getColumn } from './columns/FrozenTransactions.column'
import useFrozenTransactions from './hooks/useFrozenTransactions'
import { SkeletonButton, SkeletonInput, SkeletonTable, SkeletonTitle } from '@components/ui/skeletons/Skeleton'
import DialogUnfreeze from './components/DialogUnfreeze'

const FrozenTransactions = () => {
    const {
        dataSource,
        totalElements,
        page,
        pageSize,
        setPage,
        setPageSize,
        isFetching,
        handleSearch,
        isLoading,
        isUnfreezeModalOpen,
        selectedFreezeItem,
        handleOpenUnfreezeModal,
        handleCloseUnfreezeModal,
    } = useFrozenTransactions()

    const columns = getColumn({ onRelease: handleOpenUnfreezeModal })

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
            <DialogModal
                onCancel={handleCloseUnfreezeModal}
                onOk={() => { }}
                open={isUnfreezeModalOpen}
                footer={null}
                content={
                    <DialogUnfreeze
                        freezeItem={selectedFreezeItem ?? undefined}
                        onSuccess={handleCloseUnfreezeModal}
                        onCancel={handleCloseUnfreezeModal}
                    />
                }
                title={
                    <span className="flex items-center gap-2 text-blue-700">
                        <SnowflakeIcon size={18} />
                        Mở băng giao dịch
                    </span>
                }
            />
        </>
    )
}

export default FrozenTransactions