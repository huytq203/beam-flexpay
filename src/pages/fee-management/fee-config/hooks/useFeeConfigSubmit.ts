import { useMessage } from '@hooks/useMessage'
import {
  usePostAssignMutation,
  usePutAssignMutation
} from '@services/apiFeeAssignment'
import {
  useSetupFeePolicyMutation,
  useUpdateFeePolicyConfigMutation
} from '@services/apiFeePolicy.api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { POLICY_KIND } from '../constants/feeConfigFields'
import {
  FEE_SCREEN,
  FEE_SCREEN_CONFIG,
  type FeeScreen
} from '../constants/feeScreen'
import {
  toAssignmentRequest,
  toInputCostAssignmentRequest,
  toSetupRequest
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
 * Sửa thì không có endpoint tương đương — dịch vụ phí chỉ có các endpoint lẻ.
 * Vì vậy `updateFeePolicyConfig` dựng lại toàn bộ thành phần: xoá hết rồi tạo
 * lại theo đúng thứ tự của biểu mẫu, vì thứ tự quyết định thành phần nào tính dựa được trên thành
 * phần nào và không có cột nào lưu thứ tự đó. Chỉ an toàn vì backend khoá sửa
 * cấu hình con ở mọi trạng thái khác Khởi tạo và Từ chối: bản ghi đang sửa chưa
 * áp vào giao dịch nào.
 */
export const useFeeConfigSubmit = (
  snapshot: FeeConfigSnapshot | null,
  screen: FeeScreen = FEE_SCREEN.CUSTOMER_FEE
): UseFeeConfigSubmitResult => {
  // Đường về danh sách theo màn chứ không theo loại chính sách: màn ĐVCNTT cùng loại phí đầu ra với màn
  // phí chung nhưng có danh sách riêng, lưu xong phải về đúng danh sách vừa đi vào.
  const { policyKind, listPath } = FEE_SCREEN_CONFIG[screen]
  const isInputCost = policyKind === POLICY_KIND.INPUT_COST
  const toAssignment = isInputCost
    ? toInputCostAssignmentRequest
    : toAssignmentRequest
  const navigate = useNavigate()
  const { successMess } = useMessage()
  const [orphan, setOrphan] = useState<OrphanPolicy | null>(null)

  const [setupFeePolicy, { isLoading: isSettingUp }] =
    useSetupFeePolicyMutation()
  const [updateConfig, { isLoading: isUpdatingConfig }] =
    useUpdateFeePolicyConfigMutation()
  const [postAssign, { isLoading: isAssigning }] = usePostAssignMutation()
  const [putAssign, { isLoading: isUpdatingAssign }] = usePutAssignMutation()

  const saveAssignment = async (
    values: FeeConfigFormValues,
    policyId: string
  ): Promise<boolean> => {
    const body = toAssignment(values, policyId)
    const result = snapshot?.assignmentId
      ? await putAssign({ id: snapshot.assignmentId, body })
      : await postAssign(body)
    return !('error' in result)
  }

  const create = async (values: FeeConfigFormValues): Promise<void> => {
    const setupResult = await setupFeePolicy(toSetupRequest(values, policyKind))
    if ('error' in setupResult) return

    const policyId = setupResult.data?.policy?.id
    if (!policyId) return

    if (!(await saveAssignment(values, policyId))) {
      setOrphan({ id: policyId, name: values.name })
      return
    }

    successMess(
      isInputCost
        ? 'Đã tạo chính sách phí đầu vào và gán tuyến thanh toán'
        : 'Đã tạo chính sách phí và gán đối tượng'
    )
    navigate(listPath)
  }

  const update = async (
    values: FeeConfigFormValues,
    current: FeeConfigSnapshot
  ): Promise<void> => {
    const { policy, components } = toSetupRequest(values, policyKind)
    const result = await updateConfig({
      policyId: current.policyId,
      policy,
      components,
      removeComponentIds: current.componentIds,
      assignmentId: current.assignmentId,
      assignment: toAssignment(values, current.policyId)
    })
    if ('error' in result) return

    successMess('Đã cập nhật chính sách phí')
    navigate(listPath)
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
      isSettingUp || isUpdatingConfig || isAssigning || isUpdatingAssign,
    orphan,
    dismissOrphan: () => setOrphan(null)
  }
}
