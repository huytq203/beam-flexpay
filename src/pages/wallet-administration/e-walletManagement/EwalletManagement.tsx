import { SnowflakeIcon, StopOutlined, WarningIcon } from '@components/icons'
import { CardComponent, DialogModal, Table } from '@components/index'
import React from 'react'
import FormSearch from './components/FormSearch'
import useEwalletManagement from './hooks/useEwalletManagement'
import DialogFreeze from '../transaction-management/components/DialogFreeze'
import DialogFreezeWallet from '@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/components/DialogFreezeWallet'
import DialogDeleteWallet from '@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/components/DialogDeleteWallet'

const EwalletManagement = () => {
  const {
    column,
    dataSource,
    getAccount,
    page,
    size,
    setPage,
    setPageSize
  } = useEwalletManagement()
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch />} />

      <CardComponent
        content={
          <>
            <Table
              rowKey={'id'}
              scroll={{ x: 'max-content' }}
              size='small'
              columns={column}
              bordered
              dataSource={dataSource}
              pagination={{
                current: page,
                showSizeChanger: true,
                pageSize: size,
                total: getAccount?.data?.totalElements,
                onChange: (page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
                }
              }}
            />
          </>
        }
      />

      <DialogModal
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        content={<DialogFreezeWallet />}
        title={
          <span className='flex items-center gap-2  text-red '>
            <StopOutlined /> Phong tỏa ví điện tử
          </span>
        }
      />
      <DialogModal
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        content={<DialogFreeze />}
        title={
          <span className='flex items-center gap-2  text-red '>
            <SnowflakeIcon /> Đóng băng ví số dư ví
          </span>
        }
      />
      <DialogModal
        mode='DELETE'
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        content={<DialogDeleteWallet />}
        title={
          <span className='flex-start gap-2  text-red '>
            <WarningIcon weight='fill' /> Yêu cầu hủy/xóa ví
          </span>
        }
      />
    </div>
  )
}

export default EwalletManagement
