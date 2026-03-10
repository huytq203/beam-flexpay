import { CardComponent, DialogModal, Table } from '@components/index'
import { SnowflakeIcon } from '@components/icons'
import React from 'react'
import FormSearch from './components/FormSearch'
import { Column } from './columns/FrozenTransactions.column'
import useFrozenTransactions from './hooks/useFrozenTransactions'
import DialogFreeze from './components/DialogFreeze'
import { SkeletonSearchGroup, SkeletonTable } from '@components/ui/skeletons/Skeleton'
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

    const columns = Column({ onRelease: handleOpenUnfreezeModal })

    return (
        <>
            <CardComponent className="mb-3" content={
                isLoading ? <SkeletonSearchGroup className=' grid grid-cols-1 md:grid-cols-4 gap-4 mb-4' positionButton='end' /> : <FormSearch onSearch={handleSearch} />} />
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
                                showTotal: (total) => `Tổng ${total} bản ghi`,
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
                        freezeItem={selectedFreezeItem}
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