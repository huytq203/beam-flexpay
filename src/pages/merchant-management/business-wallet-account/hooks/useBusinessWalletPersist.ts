import type { UseFormGetValues, UseFormSetError } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useMessage } from '@hooks/useMessage'
import {
  useCreateEnterpriseWalletMutation,
  useSaveEnterpriseWalletDraftMutation,
  useUpdateEnterpriseWalletMutation,
  type EnterpriseWalletDto
} from '@services/merchantEnterpriseWalletApi'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import { buildWalletPayload } from '../utils/businessWalletPayload'
import {
  isOtpPhoneChanged,
  validateDraft
} from '../utils/businessWalletValidation'
import { useWalletDocumentUpload } from './useWalletDocumentUpload'

interface PersistOptions {
  id: string | undefined
  detailData: EnterpriseWalletDto | undefined
  setError: UseFormSetError<BusinessWalletFormValues>
  getValues: UseFormGetValues<BusinessWalletFormValues>
}

/** Tạo / lưu nháp / cập nhật ví doanh nghiệp, dùng chung một đường dựng payload. */
export function useBusinessWalletPersist({
  id,
  detailData,
  setError,
  getValues
}: PersistOptions) {
  const navigate = useNavigate()
  const { successMess } = useMessage()
  const [createWallet, createState] = useCreateEnterpriseWalletMutation()
  const [saveDraft, draftState] = useSaveEnterpriseWalletDraftMutation()
  const [updateWallet, updateState] = useUpdateEnterpriseWalletMutation()
  const { uploadAll, isUploading } = useWalletDocumentUpload()
  const isEditMode = Boolean(id)

  const persist = async (
    values: BusinessWalletFormValues,
    draft: boolean
  ): Promise<void> => {
    const phoneChanged = isEditMode && isOtpPhoneChanged(values, detailData)
    if (phoneChanged && !values.adminPassword?.trim()) {
      setError('adminPassword', {
        message: 'Vui lòng nhập mật khẩu quản trị khi đổi số OTP'
      })
      return
    }
    try {
      const body = buildWalletPayload(values, await uploadAll(values), {
        draft,
        adminPassword: phoneChanged ? values.adminPassword : undefined
      })
      if (isEditMode && id) {
        delete body.registeredEmail
        await updateWallet({ id, body }).unwrap()
        successMess(
          draft
            ? 'Đã lưu nháp ví doanh nghiệp'
            : 'Cập nhật ví doanh nghiệp thành công'
        )
      } else if (draft) {
        await saveDraft(body).unwrap()
        successMess('Đã lưu nháp ví doanh nghiệp')
      } else {
        await createWallet(body).unwrap()
        successMess('Tạo ví doanh nghiệp thành công')
      }
      void navigate(-1)
    } catch {
      // Lỗi API được xử lý tại base query chung.
    }
  }

  /** "Lưu nháp": chỉ bắt buộc email, không chạy schema đầy đủ. */
  const onSaveDraft = async (): Promise<void> => {
    const values = getValues()
    if (!validateDraft(values, setError)) return
    await persist(values, true)
  }

  return {
    onSubmit: (values: BusinessWalletFormValues) => persist(values, false),
    onSaveDraft,
    isSaving:
      createState.isLoading ||
      draftState.isLoading ||
      updateState.isLoading ||
      isUploading
  }
}
