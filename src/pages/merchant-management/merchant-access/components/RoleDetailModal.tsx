import type { ReactNode } from 'react'

import { useGetMerchantGroupQuery } from '@/app/services/merchantAccessApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, DialogModal } from '@components/index'

import { toMerchantRole } from '../dto/merchantAccess.api'
import type { MerchantPermission } from '../types/merchantAccess.types'
import { RolePermissionsModal } from './RolePermissionsModal'

interface Props {
  roleId: string
  catalog: readonly MerchantPermission[]
  merchantName: ReactNode
  canEdit: boolean
  onClose: () => void
}

const TITLE = 'Quản lý quyền trong nhóm'

/**
 * Tải chi tiết nhóm quyền mới nhất trước khi cho xem/sửa quyền, tránh lưu đè
 * lên danh sách quyền cũ của dòng trong bảng.
 */
export function RoleDetailModal({ roleId, onClose, ...rest }: Props) {
  const query = useGetMerchantGroupQuery(roleId, {
    refetchOnMountOrArgChange: true
  })

  if (query.data) {
    return (
      <RolePermissionsModal
        role={toMerchantRole(query.data)}
        onClose={onClose}
        {...rest}
      />
    )
  }

  return (
    <DialogModal
      open
      title={TITLE}
      onCancel={onClose}
      onOk={onClose}
      footer={
        <ButtonComponent
          content='Đóng'
          htmlType='button'
          type='default'
          onClick={onClose}
        />
      }
    >
      {query.isError ? (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(query.error, 'Không thể tải chi tiết nhóm quyền.')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      ) : (
        <p
          role='status'
          className='py-8 text-center text-sm text-muted-foreground'
        >
          Đang tải chi tiết nhóm quyền…
        </p>
      )}
    </DialogModal>
  )
}
