import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { Can, SCREENS } from '@/app/permissions'
import { PlusOutlined, WalletIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  feedback
} from '@components/index'
import { useApproveEnterpriseWalletMutation } from '@services/merchantEnterpriseWalletApi'

import { BusinessWalletSearch } from '../components/BusinessWalletSearch'
import { KybSubmitDialog } from '../components/KybSubmitDialog'
import { KybRejectDialog } from '../components/KybRejectDialog'
import { BusinessWalletTableState } from '../components/BusinessWalletTableState'
import { useBusinessWallet } from '../hooks/useBusinessWallet'
import type { BusinessWalletRow } from '../types/business-wallet.type'

const BusinessWallet = () => {
  const {
    rows,
    totalElements,
    page,
    size,
    isLoading,
    isFetching,
    isError,
    handleSearch,
    handlePageChange,
    refetch
  } = useBusinessWallet()
  const navigate = useNavigate()
  const [walletToApprove, setWalletToApprove] =
    useState<BusinessWalletRow | null>(null)
  const [walletToReject, setWalletToReject] =
    useState<BusinessWalletRow | null>(null)
  const [walletToSubmit, setWalletToSubmit] =
    useState<BusinessWalletRow | null>(null)
  const [approveWallet, { isLoading: isApproving }] =
    useApproveEnterpriseWalletMutation()

  const handleCreate = (): void => {
    void navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create`)
  }

  const handleEdit = (row: BusinessWalletRow): void => {
    void navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/${row.id}`)
  }

  const handleApprove = async (): Promise<void> => {
    if (!walletToApprove) return
    try {
      await approveWallet(walletToApprove.id).unwrap()
      feedback.success('Đã phê duyệt KYB ví doanh nghiệp')
      setWalletToApprove(null)
    } catch {
      feedback.error(
        'Không thể phê duyệt ví. Vui lòng tải lại danh sách và kiểm tra trạng thái hồ sơ.'
      )
    }
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <BusinessWalletSearch
          isSubmitting={isFetching && !isLoading}
          onSearch={handleSearch}
        />
      </CardComponent>

      <CardComponent className='border border-border bg-background shadow-none'>
        <section
          aria-labelledby='business-wallet-list-title'
          aria-busy={isLoading || isFetching}
        >
          <header className='mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3'>
            <div className='flex items-center gap-2'>
              <WalletIcon
                aria-hidden
                size={19}
                className='text-secondary-foreground'
              />
              <h2
                id='business-wallet-list-title'
                className='font-display text-base font-semibold text-foreground'
              >
                Danh sách ví doanh nghiệp
              </h2>
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              {!isLoading && !isError && (
                <span
                  aria-live='polite'
                  className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
                >
                  {totalElements} bản ghi
                </span>
              )}
              <Can
                screen='BUSINESS_WALLET_ACCOUNT'
                action='create'
              >
                <ButtonComponent
                  htmlType='button'
                  icon={<PlusOutlined aria-hidden />}
                  content='Thêm mới ví doanh nghiệp'
                  onClick={handleCreate}
                />
              </Can>
            </div>
          </header>

          <BusinessWalletTableState
            rows={rows}
            totalElements={totalElements}
            page={page}
            size={size}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onEdit={handleEdit}
            onApprove={setWalletToApprove}
            onReject={setWalletToReject}
            onSubmit={setWalletToSubmit}
            onRefresh={refetch}
            onPageChange={handlePageChange}
          />
        </section>
      </CardComponent>

      <DialogModal
        open={walletToApprove !== null}
        title='Phê duyệt KYB ví doanh nghiệp'
        okText='Phê duyệt'
        confirmLoading={isApproving}
        okButtonProps={{ disabled: isApproving }}
        cancelButtonProps={{ disabled: isApproving }}
        closable={!isApproving}
        maskClosable={!isApproving}
        onCancel={() => setWalletToApprove(null)}
        onOk={() => void handleApprove()}
      >
        <p className='text-sm text-foreground'>
          Xác nhận phê duyệt ví{' '}
          <strong>
            {walletToApprove?.legalName || walletToApprove?.registeredEmail}
          </strong>
          ? Sau khi duyệt, ví có thể dùng để đăng ký ĐVCNTT.
        </p>
      </DialogModal>
      <KybSubmitDialog
        wallet={walletToSubmit}
        onClose={() => setWalletToSubmit(null)}
      />
      <KybRejectDialog
        wallet={walletToReject}
        onClose={() => setWalletToReject(null)}
      />
    </main>
  )
}

export default BusinessWallet
