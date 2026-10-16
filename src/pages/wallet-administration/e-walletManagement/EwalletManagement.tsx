import {
  SnowflakeIcon,
  LockOutlined,
  UnlockOutlined,
  StopOutlined,
  WarningIcon
} from '@components/icons'
import { CardComponent, DialogModal, Table } from '@components/index'
import {
  SkeletonTable,
  SkeletonSearchGroup
} from '@components/ui/skeletons/Skeleton'
import React from 'react'
import { FormSearch } from './components/FormSearch'
import useEwalletManagement from './hooks/useEwalletManagement'
import DialogFreeze from './components/DialogFreeze'
import DialogUnfreeze from './components/DialogUnfreeze'
import DialogLock from './components/DialogLock'
import DialogUnlock from './components/DialogUnlock'
import DialogUnlockLogin from './components/DialogUnlockLogin'
import DialogDeleteWallet from './components/detail-infor/Personal/components/DialogDeleteWallet'
import DialogFreezeWallet from './components/detail-infor/Personal/components/DialogFreezeWallet'

const EwalletManagement = () => {
  const {
    filters,
    clearFilters,
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
    isOpeningDetail,
    refetch
  } = useEwalletManagement()

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          loadingGetAccount ? (
            <SkeletonSearchGroup
              items={3}
              className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'
              noContainer
            />
          ) : (
            <>
              <FormSearch
                filters={filters}
                handleSearch={handleSearch}
                onReset={clearFilters}
              />
            </>
          )
        }
      />

      <CardComponent
        content={
          loadingGetAccount ? (
            <SkeletonTable
              columns={column?.length || 5}
              rows={size || 5}
              noContainer
            />
          ) : (
            <>
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                size='small'
                columns={column}
                bordered
                dataSource={dataSource}
                loading={isFetching || isOpeningDetail}
                onRefresh={refetch}
                pagination={{
                  current: page,
                  showSizeChanger: true,
                  pageSize: size,
                  total: getAccount?.totalElements,
                  onChange: (page, pageSize) => {
                    // Hai setter cùng ghi URL từ một bản cũ: chỉ gọi đúng cái thay đổi.
                    if (pageSize !== size) setPageSize(pageSize)
                    else setPage(page)
                  }
                }}
              />
            </>
          )
        }
      />

      <DialogModal
        onCancel={closeModal}
        onOk={() => {}}
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
        onOk={() => {}}
        open={modalType === 'freeze'}
        footer={null}
        content={
          <DialogFreeze
            accountId={selectedAccount?.id}
            ownerName={selectedAccount?.ownerUsername}
            availableBalance={selectedAccount?.availableBalance}
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
        onOk={() => {}}
        open={modalType === 'unfreeze'}
        footer={null}
        content={
          <DialogUnfreeze
            accountId={selectedAccount?.id}
            ownerName={selectedAccount?.ownerUsername}
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
        onOk={() => {}}
        open={modalType === 'lock'}
        footer={null}
        content={
          <DialogLock
            ownerId={selectedAccount?.ownerId}
            ownerName={selectedAccount?.ownerUsername}
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
        onOk={() => {}}
        open={modalType === 'unlock'}
        footer={null}
        content={
          <DialogUnlock
            ownerId={selectedAccount?.ownerId}
            ownerName={selectedAccount?.ownerUsername}
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
        onCancel={closeModal}
        onOk={() => {}}
        open={modalType === 'unlockLogin'}
        footer={null}
        content={
          <DialogUnlockLogin
            ownerId={selectedAccount?.ownerId}
            ownerName={selectedAccount?.ownerUsername}
            onSuccess={() => {
              closeModal()
              refetch()
            }}
            onCancel={closeModal}
          />
        }
        title={
          <span className='flex items-center gap-2 text-green-700'>
            <UnlockOutlined /> Mở khóa đăng nhập
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
          <span className='flex-start gap-2 text-red'>
            <WarningIcon weight='fill' /> Yêu cầu hủy/xóa ví
          </span>
        }
      />
    </div>
  )
}

export default EwalletManagement
