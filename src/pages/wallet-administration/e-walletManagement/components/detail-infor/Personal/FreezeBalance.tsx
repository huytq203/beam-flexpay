import { ButtonComponent, CardComponent, DialogModal, Table } from '@components/index'
import { SnowflakeIcon } from '@components/icons'
import DialogUnfreeze from './components/DialogUnfreeze'
import React from 'react'
import { getColumn } from './configs/FreezeBalance.column'
import useFetchFreeze from './hooks/useFetchFreeze'

const FreezeBalance = () => {
    const { dataFreeze, isLoadingGetFreeze, dataSource, page, setPage, setPageSize, size, isUnfreezeModalOpen, selectedFreezeItem, handleOpenUnfreezeModal, handleCloseUnfreezeModal } = useFetchFreeze()
    const column = getColumn({ onRelease: handleOpenUnfreezeModal })
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

            < DialogModal
                onCancel={handleCloseUnfreezeModal}
                onOk={() => { }}
                open={isUnfreezeModalOpen}
                footer={null}
                content={
                    < DialogUnfreeze
                        freezeItem={selectedFreezeItem}
                        onSuccess={handleCloseUnfreezeModal}
                        onCancel={handleCloseUnfreezeModal}
                    />
                }
                title={
                    < span className="flex items-center gap-2 text-blue-700" >
                        <SnowflakeIcon size={18} />
                        Mở băng giao dịch
                    </span >
                }
            />
        </div >
    )
}

export default FreezeBalance