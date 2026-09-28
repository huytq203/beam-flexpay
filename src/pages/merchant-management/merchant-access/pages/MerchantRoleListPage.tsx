import { useMerchantRoleListData } from '../hooks/useMerchantRoleListData'
import { useAccessLookups } from '../hooks/useAccessLookups'
import { useState } from 'react'

import { Can, PERMISSION, useAccess } from '@/app/permissions'
import { PlusOutlined } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'

import { createMerchantRoleColumns } from '../columns/merchantRole.columns'
import { AccessPageShell } from '../components/AccessPageShell'
import { MerchantRoleFilters } from '../components/MerchantRoleFilters'
import { RoleDeleteDialog } from '../components/RoleDeleteDialog'
import { RoleEditorModal } from '../components/RoleEditorModal'
import { RolePermissionsModal } from '../components/RolePermissionsModal'
import type { MerchantRole } from '../types/merchantAccess.types'

export default function MerchantRoleListPage() {
  const access = useAccess()
  const canManageSystemGroups = access.has(
    PERMISSION.MERCHANT_SYSTEM_GROUP_MANAGE
  )
  const { merchants, permissions, getMerchant } = useAccessLookups()
  const {
    draft,
    setDraft,
    page,
    setPage,
    pageSize,
    setPageSize,
    rolesQuery,
    roles,
    users,
    filteredRoles,
    apply,
    reset
  } = useMerchantRoleListData()
  const [editor, setEditor] = useState<MerchantRole | 'create' | null>(null)
  const [detail, setDetail] = useState<MerchantRole | null>(null)
  const [deleting, setDeleting] = useState<MerchantRole | null>(null)
  const columns = createMerchantRoleColumns({
    page,
    pageSize,
    users,
    getMerchant,
    canManageSystemGroups,
    onView: setDetail,
    onEdit: setEditor,
    onDelete: setDeleting
  })

  return (
    <>
      <AccessPageShell
        actions={
          <Can
            screen='MERCHANT_ROLE'
            action='create'
          >
            <ButtonComponent
              content='Thêm nhóm quyền'
              htmlType='button'
              icon={<PlusOutlined aria-hidden />}
              onClick={() => setEditor('create')}
            />
          </Can>
        }
        title='Danh sách nhóm quyền'
        count={rolesQuery.data?.totalElements}
        toolbar={
          <MerchantRoleFilters
            draft={draft}
            merchants={merchants}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
          />
        }
      >
        {rolesQuery.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
          >
            Không thể tải nhóm quyền.
            <ButtonComponent
              size='small'
              type='default'
              content='Thử lại'
              onClick={() => void rolesQuery.refetch()}
            />
          </div>
        )}
        <Table<MerchantRole>
          columns={columns}
          dataSource={[...filteredRoles]}
          loading={rolesQuery.isFetching}
          onRefresh={rolesQuery.refetch}
          pagination={{
            current: page,
            pageSize,
            total: rolesQuery.data?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100],
            onChange: (nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage)
              setPageSize(nextSize)
            }
          }}
          rowKey='id'
          scroll={{ x: 1080 }}
          size='small'
        />
      </AccessPageShell>
      {editor !== null && (
        <RoleEditorModal
          existingRoles={roles}
          key={editor === 'create' ? 'create' : editor.id}
          onClose={() => setEditor(null)}
          role={editor === 'create' ? null : editor}
        />
      )}
      {detail && (
        <RolePermissionsModal
          key={detail.id}
          role={roles.find((row) => row.id === detail.id) ?? detail}
          catalog={permissions}
          merchantName={
            detail.merchantId
              ? (getMerchant(detail.merchantId)?.name ??
                'Merchant không xác định')
              : 'Dùng chung toàn hệ thống'
          }
          canEdit={
            detail.system
              ? canManageSystemGroups
              : access.has(PERMISSION.MERCHANT_PERMISSION_GROUP_MANAGE)
          }
          onClose={() => setDetail(null)}
        />
      )}
      {deleting && (
        <RoleDeleteDialog
          role={deleting}
          getMerchant={getMerchant}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  )
}
