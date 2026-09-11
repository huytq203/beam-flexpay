import { PATHS } from '@constants/pathConstant'
import { useMessage } from '@hooks/useMessage'
import { usePostAssignMutation, usePutAssignMutation } from '@services/apiFeeAssignment'
import {
  useDeleteFeeComponentPoliciesMutation,
  usePostFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { usePostFeeComponentTierMutation } from '@services/apiFeeComponentTier'
import {
  usePutFeePolicyMutation,
  useSetupFeePolicyMutation
} from '@services/apiFeePolicy.api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import {
  toAssignmentRequest,
  toComponentCreateRequest,
  toPolicyUpdateRequest,
  toSetupRequest,
  toTierCreateRequests
} from '../utils/feeConfigPayload'

/** Những gì đã có trong cơ sở dữ liệu, cần khi sửa. */
export interface FeeConfigSnapshot {
  policyId: string
  componentIds: readonly string[]
  assignmentId: string | null
}

/**
 * Chính sách đã tạo nhưng chưa gán được đối tượng.
 *
 * Không xoá chính sách vừa tạo: người dùng vừa nhập xong cả màn, và một lệnh
 * xoá tự động là thao tác phá huỷ không ai yêu cầu. Giữ id lại để đưa họ sang
 * màn sửa gán bù.
 */
export interface OrphanPolicy {
  id: string
  name: string
}

export interface UseFeeConfigSubmitResult {
  submit: (values: FeeConfigFormValues) => Promise<void>
  isSubmitting: boolean
  orphan: OrphanPolicy | null
  dismissOrphan: () => void
}

/**
 * Lưu chính sách phí.
 *
 * Tạo mới đi qua `POST /fee/policies/setup`: chính sách, thành phần và bậc phí
 * gói trong một transaction, hỏng thì cơ sở dữ liệu sạch.
 *
 * Sửa thì không có đường tương đương — dịch vụ phí chỉ có các endpoint lẻ. Vì
 * vậy màn phải dựng lại toàn bộ thành phần: xoá hết rồi tạo lại theo đúng thứ
 * tự của biểu mẫu, vì thứ tự quyết định thành phần nào tính dựa được trên thành
 * phần nào và không có cột nào lưu thứ tự đó. Chỉ an toàn vì backend khoá sửa
 * cấu hình con ở mọi trạng thái khác Khởi tạo và Từ chối: bản ghi đang sửa chưa
 * áp vào giao dịch nào.
 */
export const useFeeConfigSubmit = (
  snapshot: FeeConfigSnapshot | null
): UseFeeConfigSubmitResult => {
  const navigate = useNavigate()
  const { successMess } = useMessage()
  const [orphan, setOrphan] = useState<OrphanPolicy | null>(null)

  const [setupFeePolicy, { isLoading: isSettingUp }] =
    useSetupFeePolicyMutation()
  const [putFeePolicy, { isLoading: isUpdatingPolicy }] =
    usePutFeePolicyMutation()
  const [deleteComponent, { isLoading: isDeletingComponent }] =
    useDeleteFeeComponentPoliciesMutation()
  const [postComponent, { isLoading: isCreatingComponent }] =
    usePostFeeComponentPoliciesMutation()
  const [postTier, { isLoading: isCreatingTier }] =
    usePostFeeComponentTierMutation()
  const [postAssign, { isLoading: isAssigning }] = usePostAssignMutation()
  const [putAssign, { isLoading: isUpdatingAssign }] = usePutAssignMutation()

  const saveAssignment = async (
    values: FeeConfigFormValues,
    policyId: string
  ): Promise<boolean> => {
    const body = toAssignmentRequest(values, policyId)
    const result = snapshot?.assignmentId
      ? await putAssign({ id: snapshot.assignmentId, body })
      : await postAssign(body)
    return !('error' in result)
  }

  const create = async (values: FeeConfigFormValues): Promise<void> => {
    const setupResult = await setupFeePolicy(toSetupRequest(values))
    if ('error' in setupResult) return

    const policyId = setupResult.data?.policy?.id
    if (!policyId) return

    if (!(await saveAssignment(values, policyId))) {
      setOrphan({ id: policyId, name: values.name })
      return
    }

    successMess('Đã tạo chính sách phí và gán đối tượng')
    navigate(PATHS.FEE_V4.POLICY_LIST)
  }

  const update = async (
    values: FeeConfigFormValues,
    current: FeeConfigSnapshot
  ): Promise<void> => {
    const policyResult = await putFeePolicy({
      id: current.policyId,
      body: toPolicyUpdateRequest(values)
    })
    if ('error' in policyResult) return

    for (const componentId of current.componentIds) {
      const removed = await deleteComponent(componentId)
      if ('error' in removed) return
    }

    for (let index = 0; index < values.components.length; index += 1) {
      const created = await postComponent(
        toComponentCreateRequest(values, index, current.policyId)
      )
      if ('error' in created) return

      const componentId = (
        created.data as { data?: { id?: string } } | undefined
      )?.data?.id
      if (!componentId) return

      for (const tier of toTierCreateRequests(values, index, componentId)) {
        const savedTier = await postTier(tier)
        if ('error' in savedTier) return
      }
    }

    if (!(await saveAssignment(values, current.policyId))) return

    successMess('Đã cập nhật chính sách phí')
    navigate(PATHS.FEE_V4.POLICY_LIST)
  }

  const submit = async (values: FeeConfigFormValues): Promise<void> => {
    setOrphan(null)
    if (snapshot) {
      await update(values, snapshot)
      return
    }
    await create(values)
  }

  return {
    submit,
    isSubmitting:
      isSettingUp ||
      isUpdatingPolicy ||
      isDeletingComponent ||
      isCreatingComponent ||
      isCreatingTier ||
      isAssigning ||
      isUpdatingAssign,
    orphan,
    dismissOrphan: () => setOrphan(null)
  }
}
