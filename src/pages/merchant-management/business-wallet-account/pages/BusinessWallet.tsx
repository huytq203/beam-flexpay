import { useNavigate } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { PlusOutlined, WalletIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'

import { BusinessWalletSearch } from '../components/BusinessWalletSearch'
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

  const handleCreate = (): void => {
    void navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create`)
  }

  const handleEdit = (row: BusinessWalletRow): void => {
    void navigate(`${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/${row.id}`)
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
              <WalletIcon aria-hidden size={19} className='text-secondary-foreground' />
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
              <Can screen='BUSINESS_WALLET_ACCOUNT' action='create'>
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
            onRefresh={refetch}
            onPageChange={handlePageChange}
          />
        </section>
      </CardComponent>
    </main>
  )
}

export default BusinessWallet
