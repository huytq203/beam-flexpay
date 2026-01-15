// ============================================
// ConfirmDialog - Reusable Confirmation Modal
// ============================================

import React, { memo } from 'react'
import { DialogModal } from '@components/common'

// ============================================
// Types
// ============================================
interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  danger?: boolean
}

// ============================================
// Component
// ============================================
/**
 * ConfirmDialog - Standardized confirmation dialog
 *
 * @remarks
 * Wraps DialogModal with common delete/confirm patterns.
 * Uses React.memo since the dialog's visibility is toggled frequently.
 *
 * @example
 * // Delete confirmation
 * <ConfirmDialog
 *   open={isDeleteDialogOpen}
 *   onConfirm={handleDelete}
 *   onCancel={closeDeleteDialog}
 *   content="Bạn có chắc chắn muốn xóa?"
 *   isLoading={isDeleting}
 *   danger
 * />
 *
 * // Generic confirmation
 * <ConfirmDialog
 *   open={isConfirmOpen}
 *   onConfirm={handleConfirm}
 *   onCancel={closeConfirm}
 *   title="Xác nhận"
 *   content="Bạn có muốn tiếp tục?"
 * />
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title = 'Xác nhận',
  content = 'Bạn có xác nhận thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
  danger = false
}) => {
  return (
    <DialogModal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={isLoading}
      content={content}
    />
  )
}

// ============================================
// Memoized Export
// ============================================
export default memo(ConfirmDialog)
