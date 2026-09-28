import { useMerchantUserListData } from '../hooks/useMerchantUserListData'
import { useAccessMerchants } from '../hooks/useAccessMerchants'
import { useState } from 'react'
import { Can } from '@/app/permissions'
import { PlusOutlined } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'

import { createMerchantUserColumns } from '../columns/merchantUser.columns'
import { AccessPageShell } from '../components/AccessPageShell'
import { MerchantUserFilters } from '../components/MerchantUserFilters'
import { UserAccessModal } from '../components/UserAccessModal'
import { UserDetailDrawer } from '../components/UserDetailDrawer'
import { UserEditorModal } from '../components/UserEditorModal'
import { UserResetPasswordDialog } from '../components/UserResetPasswordDialog'
import { UserStatusDialog } from '../components/UserStatusDialog'
import type { MerchantUser } from '../types/merchantAccess.types'

export default function MerchantUserListPage() {
  const { getMerchant, getSubMerchant } = useAccessMerchants()
  const {
    draft,
    setDraft,
    page,
    setPage,
    pageSize,
    setPageSize,
    usersQuery,
    users,
    roles,
    filteredUsers,
    apply,
    reset
  } = useMerchantUserListData()
  const [editor, setEditor] = useState<MerchantUser | 'create' | null>(null)
  const [detail, setDetail] = useState<MerchantUser | null>(null)
  const [accessUser, setAccessUser] = useState<MerchantUser | null>(null)
  const [statusUser, setStatusUser] = useState<MerchantUser | null>(null)
  const [resetUser, setResetUser] = useState<MerchantUser | null>(null)
  const columns = createMerchantUserColumns({
    page,
    pageSize,
    roles,
    getMerchant,
    getSubMerchant,
    onView: setDetail,
    onEdit: setEditor,
    onAccess: setAccessUser,
    onResetPassword: setResetUser,
    onStatus: setStatusUser
  })

  return (
    <>
      <AccessPageShell
        title='Danh sách User'
        count={usersQuery.data?.totalElements}
        actions={
          <>
            <Can
              screen='MERCHANT_USER'
              action='create'
            >
              <ButtonComponent
                content='Thêm mới User'
                htmlType='button'
                icon={<PlusOutlined aria-hidden />}
                onClick={() => setEditor('create')}
              />
            </Can>
          </>
        }
        toolbar={
          <MerchantUserFilters
            draft={draft}
            roles={roles}
            getMerchant={getMerchant}
            getSubMerchant={getSubMerchant}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
          />
        }
      >
        {usersQuery.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
          >
            Không thể tải danh sách User.
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void usersQuery.refetch()}
            />
          </div>
        )}
        <Table<MerchantUser>
          columns={columns}
          dataSource={[...filteredUsers]}
          loading={usersQuery.isFetching}
          onRefresh={usersQuery.refetch}
          pagination={{
            current: page,
            pageSize,
            total: usersQuery.data?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            onChange: (nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage)
              setPageSize(nextSize)
            }
          }}
          rowKey='id'
          scroll={{ x: 1300 }}
          size='small'
        />
      </AccessPageShell>
      {editor !== null && (
        <UserEditorModal
          key={editor === 'create' ? 'create' : editor.id}
          onClose={() => setEditor(null)}
          user={editor === 'create' ? null : editor}
        />
      )}
      {detail && (
        <UserDetailDrawer
          onClose={() => setDetail(null)}
          roles={roles}
          user={users.find((row) => row.id === detail.id) ?? detail}
        />
      )}
      {accessUser && (
        <UserAccessModal
          key={accessUser.id}
          onClose={() => setAccessUser(null)}
          roles={roles}
          user={users.find((row) => row.id === accessUser.id) ?? accessUser}
        />
      )}
      {resetUser && (
        <UserResetPasswordDialog
          user={resetUser}
          getMerchant={getMerchant}
          onClose={() => setResetUser(null)}
        />
      )}
      {statusUser && (
        <UserStatusDialog
          user={statusUser}
          getMerchant={getMerchant}
          onClose={() => setStatusUser(null)}
        />
      )}
    </>
  )
}
