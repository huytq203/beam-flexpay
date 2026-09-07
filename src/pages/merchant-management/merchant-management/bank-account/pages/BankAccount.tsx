import { Can } from '@/app/permissions'
import { BankFilled, PlusOutlined } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'

import { BankAccountFormDialog } from '../components/BankAccountFormDialog'
import { BankAccountLockDialog } from '../components/BankAccountLockDialog'
import { BankAccountSearch } from '../components/BankAccountSearch'
import { BankAccountTableState } from '../components/BankAccountTableState'
import { useBankAccount } from '../hooks/useBankAccount'
import { useBankAccountDialog } from '../hooks/useBankAccountDialog'
import type { BankAccountRow } from '../types/bank-account.type'

const BankAccount = () => {
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
    refetch,
    saveRecord,
    toggleStatus
  } = useBankAccount()
  const { dialog, openCreate, openEdit, openLock, close } =
    useBankAccountDialog()

  const handleSaved = (row: BankAccountRow): void => {
    saveRecord(row)
    close()
  }

  const handleLockConfirmed = (): void => {
    if (dialog?.kind === 'lock') toggleStatus(dialog.row.id)
    close()
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <BankAccountSearch
          isSubmitting={isFetching && !isLoading}
          onSearch={handleSearch}
        />
      </CardComponent>

      <CardComponent className='border border-border bg-background shadow-none'>
        <section
          aria-labelledby='bank-account-list-title'
          aria-busy={isLoading || isFetching}
        >
          <header className='mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3'>
            <div className='flex min-w-0 items-start gap-2'>
              <BankFilled
                aria-hidden
                className='mt-0.5 text-lg text-secondary-foreground'
              />
              <div className='min-w-0 space-y-1'>
                <h2
                  id='bank-account-list-title'
                  className='font-display text-base font-semibold text-foreground'
                >
                  Tài khoản ngân hàng
                </h2>
                <p className='max-w-[76ch] text-xs leading-relaxed text-muted-foreground'>
                  Tài khoản nhận quyết toán và rút tiền theo cấp Master &amp;
                  Sub. Số tài khoản hiển thị che; chỉ vai trò được cấp quyền mới
                  xem đầy đủ (NĐ 13/2023).
                </p>
              </div>
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
              <Can screen='MERCHANT_BANK_ACCOUNT' action='create'>
                <ButtonComponent
                  htmlType='button'
                  icon={<PlusOutlined aria-hidden />}
                  content='Thêm mới tài khoản'
                  onClick={openCreate}
                />
              </Can>
            </div>
          </header>

          <BankAccountTableState
            rows={rows}
            totalElements={totalElements}
            page={page}
            size={size}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onEdit={openEdit}
            onToggleLock={openLock}
            onRefresh={refetch}
            onPageChange={handlePageChange}
          />
        </section>
      </CardComponent>

      <BankAccountFormDialog
        open={dialog?.kind === 'form'}
        mode={dialog?.kind === 'form' ? dialog.mode : 'create'}
        row={dialog?.kind === 'form' ? dialog.row : null}
        onSaved={handleSaved}
        onCancel={close}
      />

      <BankAccountLockDialog
        open={dialog?.kind === 'lock'}
        mode={dialog?.kind === 'lock' ? dialog.mode : 'lock'}
        row={dialog?.kind === 'lock' ? dialog.row : null}
        onConfirmed={handleLockConfirmed}
        onCancel={close}
      />
    </main>
  )
}

export default BankAccount
