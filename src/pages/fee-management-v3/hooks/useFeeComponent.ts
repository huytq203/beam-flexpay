// ============================================
// useFeeComponent - Fee Component CRUD Operations Hook
// ============================================

import { useState, useCallback } from 'react'
import { useMessage } from '@hooks/useMessage'
import {
  useDeleteFeeComponentPoliciesMutation,
  usePostFeeComponentPoliciesMutation,
  usePutFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { FeeComponentFormValues } from '../schemas'
import { transformComponentToPayload } from '../utils'
import type { FeeComponent } from '../types'

// ============================================
// Hook Options Interface
// ============================================
interface UseFeeComponentOptions {
  feePolicyId?: string
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

// ============================================
// Hook Result Interface
// ============================================
interface UseFeeComponentResult {
  // State
  updateComponentId: string | null
  deletingId: string | null
  isDeleteDialogOpen: boolean

  // State setters
  setUpdateComponentId: (id: string | null) => void
  setDeletingId: (id: string | null) => void
  openDeleteDialog: (id: string) => void
  closeDeleteDialog: () => void

  // Actions
  createComponent: (data: FeeComponentFormValues) => Promise<string | undefined>
  updateComponent: (data: FeeComponentFormValues) => Promise<void>
  deleteComponent: (id: string) => Promise<void>

  // Loading states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isSubmitting: boolean
}

// ============================================
// Hook Implementation
// ============================================
export const useFeeComponent = ({
  feePolicyId,
  onSuccess,
  onError
}: UseFeeComponentOptions): UseFeeComponentResult => {
  // State
  const [updateComponentId, setUpdateComponentId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Hooks
  const { successMess, errorMess } = useMessage()

  // API Mutations
  const [postComponent, { isLoading: isCreating }] =
    usePostFeeComponentPoliciesMutation()
  const [putComponent, { isLoading: isUpdating }] =
    usePutFeeComponentPoliciesMutation()
  const [deleteComponentApi, { isLoading: isDeleting }] =
    useDeleteFeeComponentPoliciesMutation()

  // Delete dialog handlers
  const openDeleteDialog = useCallback((id: string) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeletingId(null)
    setIsDeleteDialogOpen(false)
  }, [])

  // Create component
  const createComponent = useCallback(
    async (data: FeeComponentFormValues): Promise<string | undefined> => {
      try {
        const payload = transformComponentToPayload(data, feePolicyId)
        const result = await postComponent(payload).unwrap()
        successMess('Thêm thành phần phí thành công')
        onSuccess?.()
        return result?.id
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        errorMess(err?.data?.message || 'Có lỗi xảy ra')
        onError?.(error)
        return undefined
      }
    },
    [feePolicyId, postComponent, successMess, errorMess, onSuccess, onError]
  )

  // Update component
  const updateComponent = useCallback(
    async (data: FeeComponentFormValues): Promise<void> => {
      if (!updateComponentId) {
        errorMess('Không tìm thấy ID thành phần phí')
        return
      }

      try {
        const payload = {
          componentType: data.componentType,
          baseOn: data.baseOn,
          baseComponentType: null,
          calculationMethod: data.calculationMethod,
          fixedAmount: data.fixedAmount ?? 0,
          percentage: data.percentage ?? 0,
          roundMode: data.roundMode,
          minFee: data.minFee ?? 0,
          maxFee: data.maxFee ?? 0,
          payerType: data.payerType,
          payerObjectType: null,
          payerObjectId: null,
          beneficiaryType: data.beneficiaryType,
          beneficiaryObjectType: null,
          beneficiaryObjectId: null
        }

        await putComponent({
          id: updateComponentId,
          body: payload
        }).unwrap()

        successMess('Cập nhật thành công')
        onSuccess?.()
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        errorMess(err?.data?.message || 'Cập nhật thất bại')
        onError?.(error)
        throw error
      }
    },
    [updateComponentId, putComponent, successMess, errorMess, onSuccess, onError]
  )

  // Delete component
  const deleteComponent = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteComponentApi(id).unwrap()
        successMess('Xóa thành công')
        closeDeleteDialog()
        onSuccess?.()
      } catch (error) {
        errorMess('Xóa thất bại')
        onError?.(error)
      }
    },
    [deleteComponentApi, successMess, errorMess, closeDeleteDialog, onSuccess, onError]
  )

  return {
    // State
    updateComponentId,
    deletingId,
    isDeleteDialogOpen,

    // State setters
    setUpdateComponentId,
    setDeletingId,
    openDeleteDialog,
    closeDeleteDialog,

    // Actions
    createComponent,
    updateComponent,
    deleteComponent,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting: isCreating || isUpdating
  }
}

export default useFeeComponent
