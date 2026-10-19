import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Can, SCREENS } from '@/app/permissions'
import {
  useGetTerminalPageQuery,
  useDeleteTerminalMutation,
  useSetTerminalLockedMutation,
  type ApiTerminalSummary
} from '@/app/services/merchantHierarchyApi'
import { PlusOutlined, TerminalIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  feedback,
  Table
} from '@components/index'
import { createTerminalApiColumns } from '../columns/terminalApi.columns'
import { TerminalApiFilters } from '../components/TerminalApiFilters'
import { TerminalDetailModal } from '../components/TerminalDetailModal'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { TerminalDeleteDialog } from '../components/TerminalDeleteDialog'
import { TerminalLockDialog } from '../components/TerminalLockDialog'
import { useTerminalListFilters } from '../hooks/useTerminalListFilters'

export default function TerminalListPage(
  _props: { initialListState?: 'loading' | 'error' | 'empty' | 'success' } = {}
) {
  const navigate = useNavigate()
  const basePath = SCREENS.MERCHANT_TERMINAL.path
  const list = useTerminalListFilters()
  const { page, size } = list
  const [viewingId, setViewingId] = useState<string>()
  const [locking, setLocking] = useState<ApiTerminalSummary | null>(null)
  const [reason, setReason] = useState('')
  const [deleting, setDeleting] = useState<ApiTerminalSummary | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const query = useGetTerminalPageQuery({
    page,
    size,
    merchantId: list.merchant?.id,
    subMerchantId: list.subMerchant?.id,
    name: list.searchName,
    terminalType: list.terminalType,
    status: list.status
  })
  const [setLocked, lockState] = useSetTerminalLockedMutation()
  const [deleteTerminal, deleteState] = useDeleteTerminalMutation()

  const closeDelete = () => {
    setDeleting(null)
    setDeleteReason('')
  }
  const confirmDelete = async () => {
    if (!deleting) return
    const text = deleteReason.trim()
    if (!text) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    try {
      await deleteTerminal({ id: deleting.id, reason: text }).unwrap()
      feedback.success('Đã xóa Terminal')
      closeDelete()
    } catch (error) {
      feedback.error(getApiErrorDetail(error, 'Không thể xóa Terminal'))
    }
  }

  const closeLock = () => {
    setLocking(null)
    setReason('')
  }
  const confirmLock = async () => {
    if (!locking) return
    if (!reason.trim()) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    try {
      await setLocked({
        id: locking.id,
        lock: locking.status === 'ACTIVE',
        reason: reason.trim()
      }).unwrap()
      feedback.success('Đã cập nhật trạng thái Terminal')
      closeLock()
    } catch {
      feedback.error('Không thể cập nhật Terminal')
    }
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <TerminalApiFilters
        name={list.name}
        merchant={list.merchant}
        subMerchant={list.subMerchant}
        terminalType={list.terminalType}
        status={list.status}
        onNameChange={list.setName}
        onMerchantChange={list.setMerchant}
        onSubChange={list.setSubMerchant}
        onTypeChange={list.setTerminalType}
        onStatusChange={list.setStatus}
        onClear={list.clear}
        onSearch={list.search}
      />
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <h1 className='flex items-center gap-2 text-base font-semibold'>
            <TerminalIcon aria-hidden /> Quản lý Terminal
          </h1>
          <Can
            screen='MERCHANT_TERMINAL'
            action='create'
          >
            <ButtonComponent
              content='Thêm Terminal'
              icon={<PlusOutlined />}
              onClick={() => navigate(`${basePath}/create`)}
            />
          </Can>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải Terminal.
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<ApiTerminalSummary>
          rowKey='id'
          size='small'
          onRefresh={query.refetch}
          loading={query.isFetching}
          dataSource={query.data?.content ?? []}
          pagination={{
            current: page,
            pageSize: size,
            total: query.data?.totalElements ?? 0,
            onChange: list.changePage
          }}
          columns={createTerminalApiColumns({
            page,
            size,
            onView: (row) => setViewingId(row.id),
            onEdit: (row) =>
              navigate(`${basePath}/edit/${row.id}`, { state: row }),
            onLock: setLocking,
            onDelete: setDeleting
          })}
        />
      </CardComponent>
      <TerminalDetailModal
        terminalId={viewingId}
        onClose={() => setViewingId(undefined)}
      />
      <TerminalDeleteDialog
        terminal={deleting}
        reason={deleteReason}
        loading={deleteState.isLoading}
        onReasonChange={setDeleteReason}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
      <TerminalLockDialog
        terminal={locking}
        reason={reason}
        loading={lockState.isLoading}
        onReasonChange={setReason}
        onClose={closeLock}
        onConfirm={() => void confirmLock()}
      />
    </main>
  )
}
