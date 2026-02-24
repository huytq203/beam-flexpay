import { CardComponent, DialogModal, Table } from '@components/index'
import { SnowflakeIcon } from '@components/icons'
import React from 'react'
import FormSearch from './components/FormSearch'
import { Column } from './columns/FrozenTransactions.column'
import useFrozenTransactions from './hooks/useFrozenTransactions'
import DialogFreeze from '../transaction-wallet/components/DialogFreeze'

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
    } = useFrozenTransactions()

    const columns = Column()

    return (
        <>
            <CardComponent className="mb-3" content={<FormSearch onSearch={handleSearch} />} />
            <CardComponent
                content={
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
                onCancel={() => { }}
                onOk={() => { }}
                open={false}
                content={<DialogFreeze />}
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