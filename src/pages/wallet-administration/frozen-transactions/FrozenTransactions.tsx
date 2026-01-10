import { CardComponent, DialogModal, ModalComponent, Table } from '@components/common'
import { SnowflakeIcon } from '@components/icons/common'
import React from 'react'
import DialogFreeze from '@pages/wallet-administration/transaction-management/components/DialogFreeze'
import FormSearch from './components/FormSearch'
import { Column } from './configs/FrozenTransactions.column'
import useFrozenTransactions from './hooks/useFrozenTransactions'

const FrozenTransactions = () => {
    const column = Column()
    const { dataTable } = useFrozenTransactions()
    return (
        <>
            <CardComponent className='mb-3' content={<FormSearch />} />
            <CardComponent
                content={
                    <Table
                        columns={column}
                        size='small'
                        rowKey="id"
                        bordered
                        scroll={{ x: 'max-content' }}
                        expandable={{
                            expandedRowRender: (record) =>
                            (
                                <div className="space-y-2">
                                    {record.lichSuGiaiToa?.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex border-b pb-1"
                                        >
                                            <span>{item.ngay}:</span>
                                            <span>{item.lyDo}</span>
                                        </div>
                                    ))}
                                </div>
                            ),
                            rowExpandable: (record) =>
                                Array.isArray(record?.lichSuGiaiToa) &&
                                record.lichSuGiaiToa.length > 0,
                        }}
                        dataSource={dataTable} />} />
            <DialogModal  onCancel={() => { }} onOk={() => { }} open={false} content={<DialogFreeze />} title={<span className='flex items-center gap-2 text-blue-700'><SnowflakeIcon size={18} />Mở băng giao dịch</span>} />
        </>
    )
}

export default FrozenTransactions