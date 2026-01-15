// ============================================
// ActionButtons - Reusable Table Action Buttons
// ============================================

import React, { memo, useCallback } from 'react'
import { ButtonComponent, TooltipComponent } from '@components/common'
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'

// ============================================
// Types
// ============================================
interface ActionButtonsProps<T> {
  record: T
  status?: string
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onToggleStatus?: (record: T) => void
  showEdit?: boolean
  showDelete?: boolean
  showToggle?: boolean
  editTooltip?: string
  deleteTooltip?: string
  lockTooltip?: string
  unlockTooltip?: string
}

// ============================================
// Component
// ============================================
/**
 * ActionButtons - Generic action buttons for table rows
 *
 * @remarks
 * This component consolidates common table actions (edit, delete, toggle status)
 * into a single reusable component. Uses React.memo and useCallback for performance.
 *
 * @example
 * // Basic usage
 * <ActionButtons
 *   record={record}
 *   status={record.status}
 *   onEdit={handleEdit}
 *   onToggleStatus={handleToggle}
 * />
 *
 * // With custom tooltips
 * <ActionButtons
 *   record={record}
 *   onEdit={handleEdit}
 *   showDelete={false}
 *   editTooltip="Chỉnh sửa chính sách"
 * />
 */
function ActionButtonsComponent<T>({
  record,
  status,
  onEdit,
  onDelete,
  onToggleStatus,
  showEdit = true,
  showDelete = false,
  showToggle = true,
  editTooltip = 'Chỉnh sửa',
  deleteTooltip = 'Xóa',
  lockTooltip = 'Khóa',
  unlockTooltip = 'Mở khóa'
}: ActionButtonsProps<T>) {
  // Event handlers with useCallback to prevent re-renders
  const handleEdit = useCallback(() => {
    onEdit?.(record)
  }, [onEdit, record])

  const handleDelete = useCallback(() => {
    onDelete?.(record)
  }, [onDelete, record])

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(record)
  }, [onToggleStatus, record])

  const isActive = status === 'ACTIVE'

  return (
    <div className="flex gap-2 justify-center">
      {showEdit && onEdit && (
        <TooltipComponent title={editTooltip}>
          <ButtonComponent
            type="default"
            icon={<EditOutlined />}
            onClick={handleEdit}
          />
        </TooltipComponent>
      )}

      {showToggle && onToggleStatus && (
        <TooltipComponent title={isActive ? lockTooltip : unlockTooltip}>
          <ButtonComponent
            type="default"
            icon={isActive ? <UnlockOutlined /> : <LockOutlined />}
            onClick={handleToggleStatus}
          />
        </TooltipComponent>
      )}

      {showDelete && onDelete && (
        <TooltipComponent title={deleteTooltip}>
          <ButtonComponent
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          />
        </TooltipComponent>
      )}
    </div>
  )
}

// ============================================
// Memoized Export
// ============================================
const ActionButtons = memo(ActionButtonsComponent) as typeof ActionButtonsComponent
export default ActionButtons
