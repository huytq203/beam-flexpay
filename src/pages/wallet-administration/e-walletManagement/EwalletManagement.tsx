import { SnowflakeIcon, LockOutlined, UnlockOutlined, StopOutlined, WarningIcon } from '@components/icons'
import { CardComponent, DialogModal, Table } from '@components/index'
import { SkeletonTable, SkeletonFilterGroup, SkeletonSearchGroup } from '@components/ui/skeletons/Skeleton'
import React from 'react'
import FormSearch from './components/FormSearch'
import useEwalletManagement from './hooks/useEwalletManagement'
import DialogFreeze from './components/DialogFreeze'
import DialogUnfreeze from './components/DialogUnfreeze'
import DialogLock from './components/DialogLock'
import DialogUnlock from './components/DialogUnlock'
import DialogDeleteWallet from './components/detail-infor/Personal/components/DialogDeleteWallet'
import DialogFreezeWallet from './components/detail-infor/Personal/components/DialogFreezeWallet'

const EwalletManagement = () => {
  const {
    column,
    dataSource,
    getAccount,
    page,
    size,
    setPage,
    setPageSize,
    handleSearch,
    modalType,
    selectedAccount,
    closeModal,
    loadingGetAccount,
    isFetching,

  } = useEwalletManagement()

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          loadingGetAccount ? (
            <SkeletonSearchGroup items={3}  className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4' noContainer />
          ) : (
            <>
              <FormSearch handleSearch={handleSearch} />
            </>
          )
        }
      />

      <CardComponent
        content={
          loadingGetAccount ? (
            <SkeletonTable columns={column?.length || 5} rows={size || 5} noContainer />
          ) : (
            <>
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                size='small'
                columns={column}
                bordered
                dataSource={dataSource}
                loading={isFetching}
                pagination={{
                  current: page,
                  showSizeChanger: true,
                  pageSize: size,
                  total: getAccount?.totalElements,
                  onChange: (page, pageSize) => {
                    setPage(page)
                    setPageSize(pageSize)
                  },
                }}
              />
            </>
          )
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => { }}
        open={false}
        content={<DialogFreezeWallet />}
        title={
          <span className='flex items-center gap-2 text-red'>
            <StopOutlined /> Phong tỏa ví điện tử
          </span>
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => { }}
        open={modalType === 'freeze'}
        footer={null}
        content={
          <DialogFreeze
            accountId={selectedAccount?.id}
            ownerName={selectedAccount?.ownerName}
            balance={selectedAccount?.balance}
            currency={selectedAccount?.currency}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        }
        title={
          <span className='flex items-center gap-2 text-blue-700'>
            <SnowflakeIcon /> Đóng băng số dư ví
          </span>
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => { }}
        open={modalType === 'unfreeze'}
        footer={null}
        content={
          <DialogUnfreeze
            accountId={selectedAccount?.id}
            ownerName={selectedAccount?.ownerName}
            holdBalance={selectedAccount?.holdBalance}
            currency={selectedAccount?.currency}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        }
        title={
          <span className='flex items-center gap-2 text-green-700'>
            <SnowflakeIcon /> Mở băng số dư ví
          </span>
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => { }}
        open={modalType === 'lock'}
        footer={null}
        content={
          <DialogLock
            userId={selectedAccount?.id}
            ownerName={selectedAccount?.ownerName}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        }
        title={
          <span className='flex items-center gap-2 text-red-600'>
            <LockOutlined /> Khóa tài khoản
          </span>
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => { }}
        open={modalType === 'unlock'}
        footer={null}
        content={
          <DialogUnlock
            userId={selectedAccount?.ownerId}
            ownerName={selectedAccount?.ownerName}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        }
        title={
          <span className='flex items-center gap-2 text-green-700'>
            <UnlockOutlined /> Mở khóa tài khoản
          </span>
        }
      />

      <DialogModal
        mode='DELETE'
        onCancel={() => { }}
        onOk={() => { }}
        open={false}
        content={<DialogDeleteWallet />}
        title={
          <span className='flex-start gap-2 text-red'>
            <WarningIcon weight='fill' /> Yêu cầu hủy/xóa ví
          </span>
        }
      />
    </div>
  )
}

export default EwalletManagement
