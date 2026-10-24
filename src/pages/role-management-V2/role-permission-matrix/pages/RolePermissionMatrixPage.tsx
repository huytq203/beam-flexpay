import { Navigate } from 'react-router-dom'
import { CardComponent } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../../merchant-management/sub-merchant-management/shared/ManagementPageHeader'
import { MatrixTable } from '../components/MatrixTable'
import { RoleEditDialog } from '../components/RoleEditDialog'
import { RoleStatusPanel } from '../components/RoleStatusPanel'
import { RoleSyncDialog } from '../components/RoleSyncDialog'
import { useRolePermissionMatrixPage } from '../hooks/useRolePermissionMatrixPage'

const CARD = 'border border-border bg-background shadow-none'

export default function RolePermissionMatrixPage() {
  const page = useRolePermissionMatrixPage()
  const roles = page.matrix?.roles ?? []

  if (!page.canView)
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className={CARD}>
        <ManagementPageHeader
          description='Quyền của nhân sự nội bộ FlexPay theo vai trò và chức năng (SRS §2.4), khác với nhóm quyền của user merchant. Số dòng và cột lấy từ hệ thống, không cố định.'
          title='Ma trận phân quyền'
        />
        <div className='mt-4'>
          <RoleStatusPanel
            canEditRole={page.canEditRole}
            canManage={page.canManage}
            isError={page.syncQuery.isError}
            isLoading={page.syncQuery.isLoading}
            onEdit={(role) => void page.startEdit(role)}
            onRetry={() => void page.syncQuery.refetch()}
            onSync={page.startSync}
            opening={page.opening}
            roles={roles}
            statuses={page.syncStatuses}
          />
        </div>
      </CardComponent>
      <CardComponent className={CARD}>
        <MatrixTable
          groups={page.groups}
          isError={page.matrixQuery.isError}
          isLoading={page.matrixQuery.isLoading}
          onRetry={() => void page.matrixQuery.refetch()}
          onSearch={page.setSearch}
          roles={roles}
          search={page.search}
        />
      </CardComponent>
      {page.editing && (
        <RoleEditDialog
          callerRoles={page.callerRoles}
          matrix={page.editing.matrix}
          onClose={page.closeEdit}
          role={page.editing.role}
        />
      )}
      {page.syncing && (
        <RoleSyncDialog
          onClose={page.closeSync}
          role={page.syncing}
          status={page.syncStatuses.find((s) => s.role === page.syncing)}
        />
      )}
    </main>
  )
}
