import { useMerchantRoleListData } from '../hooks/useMerchantRoleListData'
import { usePermissionCatalog } from '../hooks/usePermissionCatalog'
import { useState } from 'react'

import { Can, PERMISSION, useAccess } from '@/app/permissions'
import { PlusOutlined } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'

import { createMerchantRoleColumns } from '../columns/merchantRole.columns'
import { AccessPageShell } from '../components/AccessPageShell'
import { MerchantNameText } from '../components/MerchantNameText'
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
  const { permissions } = usePermissionCatalog()
  const {
    draft,
    setDraft,
    page,
    setPage,
    pageSize,
    setPageSize,
    rolesQuery,
    roles,
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
            pageSizeOptions: [10, 20, 50, 100],
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
            detail.merchantId ? (
              <MerchantNameText merchantId={detail.merchantId} />
            ) : (
              'Dùng chung toàn hệ thống'
            )
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
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  )
}
