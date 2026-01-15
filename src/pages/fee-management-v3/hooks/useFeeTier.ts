// ============================================
// useFeeTier - Fee Tier Management Hook
// ============================================

import { useCallback } from 'react'
import { useMessage } from '@hooks/useMessage'
import {
  useDeleteFeeComponentTierMutation,
  usePostFeeComponentTierMutation,
  usePutFeeComponentTierMutation,
  useGetFeeComponentTierQuery
} from '@services/apiFeeComponentTier'
import { transformTiersToPayload } from '../utils'
import type { FeeTier } from '../types'

// ============================================
// Hook Options Interface
// ============================================
interface UseFeeTierOptions {
  feeComponentId?: string
  onSuccess?: () => void
}

// ============================================
// Hook Result Interface
// ============================================
interface UseFeeTierResult {
  // Data
  tiers: FeeTier[]
  isLoading: boolean

  // Actions
  createTiers: (tiers: FeeTier[], roundMode: string) => Promise<void>
  updateTiers: (tiers: FeeTier[], roundMode: string) => Promise<void>
  deleteTier: (tierId: string) => Promise<void>

  // Loading states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

// ============================================
// Hook Implementation
// ============================================
export const useFeeTier = ({
  feeComponentId,
  onSuccess
}: UseFeeTierOptions): UseFeeTierResult => {
  // Hooks
  const { successMess, errorMess } = useMessage()

  // Query
  const { data: tiersData, isLoading } = useGetFeeComponentTierQuery(
    feeComponentId ?? '',
    { skip: !feeComponentId }
  )

  // Mutations
  const [postTier, { isLoading: isCreating }] = usePostFeeComponentTierMutation()
  const [putTier, { isLoading: isUpdating }] = usePutFeeComponentTierMutation()
  const [deleteTierApi, { isLoading: isDeleting }] = useDeleteFeeComponentTierMutation()

  // Transform fetched tiers to match our interface
  const tiers: FeeTier[] = (tiersData ?? []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    minValue: item.minValue as number,
    maxValue: item.maxValue as number,
    roundMode: item.roundMode as string,
    minFee: item.minFee as number,
    maxFee: item.maxFee as number,
    fixedAmount: item.fixedAmount as number,
    percentage: item.percentage as number
  }))

  // Create multiple tiers
  const createTiers = useCallback(
    async (tierData: FeeTier[], roundMode: string): Promise<void> => {
      if (!feeComponentId) {
        errorMess('Không tìm thấy ID thành phần phí')
        return
      }

      if (!tierData || tierData.length === 0) {
        errorMess('Không có dữ liệu tier để thêm')
        return
      }

      try {
        const payload = transformTiersToPayload(tierData, feeComponentId, roundMode)
        await postTier(payload).unwrap()
        successMess('Thêm tier thành công')
        onSuccess?.()
      } catch (error) {
        errorMess('Thêm tier thất bại')
        throw error
      }
    },
    [feeComponentId, postTier, successMess, errorMess, onSuccess]
  )

  // Update all tiers
  const updateTiers = useCallback(
    async (tierData: FeeTier[], roundMode: string): Promise<void> => {
      if (!feeComponentId) {
        errorMess('Không tìm thấy ID thành phần phí')
        return
      }

      if (!tierData || tierData.length === 0) {
        return
      }

      try {
        const payload = transformTiersToPayload(tierData, feeComponentId, roundMode)
        await putTier({ body: payload }).unwrap()
        onSuccess?.()
      } catch (error) {
        throw error
      }
    },
    [feeComponentId, putTier, errorMess, onSuccess]
  )

  // Delete single tier
  const deleteTier = useCallback(
    async (tierId: string): Promise<void> => {
      try {
        await deleteTierApi(tierId).unwrap()
        successMess('Xóa tier thành công')
        onSuccess?.()
      } catch (error) {
        errorMess('Xóa tier thất bại')
        throw error
      }
    },
    [deleteTierApi, successMess, errorMess, onSuccess]
  )

  return {
    tiers,
    isLoading,
    createTiers,
    updateTiers,
    deleteTier,
    isCreating,
    isUpdating,
    isDeleting
  }
}

export default useFeeTier
