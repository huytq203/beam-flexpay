import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useTypedSelector } from '@/app/store'
import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { BankFilled, PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
  Table
} from '@components/index'
import {
  createBankAccountColumns,
  type BankAccountActionType
} from '../columns/bankAccount.columns'
import { BankAccountActionDialog } from './BankAccountActionDialog'
import { BankAccountDeleteDialog } from './BankAccountDeleteDialog'
import { BankAccountDetailDialog } from './BankAccountDetailDialog'
import {
  BankAccountDecisionDialog,
  type BankAccountDecisionType
} from './BankAccountDecisionDialog'
import { BankAccountVerifyDialog } from './BankAccountVerifyDialog'
import { BankAccountEditorDialog } from './BankAccountEditorDialog'
import { BankAccountFilters } from './BankAccountFilters'
import { useBankAccountList } from '../hooks/useBankAccountList'

type Editing = { row: BankAccountDto | null }
type Action = { type: BankAccountActionType; row: BankAccountDto }
type Decision = { type: BankAccountDecisionType; row: BankAccountDto }

/** Tab danh sách tài khoản ngân hàng: lọc, xuất CSV và các thao tác trên từng tài khoản. */
export const BankAccountListPanel = () => {
  const list = useBankAccountList()
  const { query } = list
  const currentUserId = useTypedSelector((state) => state.auth.profile.jwtId)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [action, setAction] = useState<Action | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<BankAccountDto | null>(null)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <BankAccountFilters
          {...list.filters}
          onKeywordChange={list.setKeyword}
          onMerchantChange={list.setMerchant}
          onLevelChange={list.setLevel}
          onStatusChange={list.setStatus}
          onClear={list.clear}
          onSearch={list.search}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <h1 className='flex items-center gap-2 text-base font-semibold'>
            <BankFilled aria-hidden /> Tài khoản ngân hàng
          </h1>
          <div className='flex flex-wrap gap-2'>
            <Can
              screen='MERCHANT_BANK_ACCOUNT'
              action='export'
            >
              <ExportCsvButton
                onExport={list.exportCsv}
                loading={list.isExporting}
                disabled={!query.data?.totalElements}
              />
            </Can>
            <Can
              screen='MERCHANT_BANK_ACCOUNT'
              action='create'
            >
              <ButtonComponent
                content='Thêm tài khoản'
                icon={<PlusOutlined />}
                onClick={() => setEditing({ row: null })}
              />
            </Can>
          </div>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải tài khoản ngân hàng.
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<BankAccountDto>
          rowKey='id'
          size='small'
          onRefresh={query.refetch}
          loading={query.isFetching}
          dataSource={query.data?.content ?? []}
          pagination={{
            current: list.page,
            pageSize: list.size,
            total: query.data?.totalElements ?? 0,
            onChange: list.changePage
          }}
          columns={createBankAccountColumns({
            page: list.page,
            size: list.size,
            merchantName: list.merchantName,
            onEdit: (row) => setEditing({ row }),
            onView: (row) => setViewingId(row.id),
            onDelete: setDeleting,
            onAction: (type, row) => setAction({ type, row }),
            onDecide: (type, row) => setDecision({ type, row }),
            currentUserId
          })}
        />
      </CardComponent>
      {viewingId && (
        <BankAccountDetailDialog
          id={viewingId}
          merchantName={list.merchantName}
          onClose={() => setViewingId(null)}
        />
      )}
      {deleting && (
        <BankAccountDeleteDialog
          row={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
      {editing && (
        <BankAccountEditorDialog
          row={editing.row}
          initialMerchant={list.defaultMerchant}
          onClose={() => setEditing(null)}
        />
      )}
      {action?.type === 'verify' && (
        <BankAccountVerifyDialog
          row={action.row}
          onClose={() => setAction(null)}
        />
      )}
      {decision && (
        <BankAccountDecisionDialog
          type={decision.type}
          row={decision.row}
          onClose={() => setDecision(null)}
        />
      )}
      {action && action.type !== 'verify' && (
        <BankAccountActionDialog
          type={action.type}
          row={action.row}
          onClose={() => setAction(null)}
        />
      )}
    </main>
  )
}
