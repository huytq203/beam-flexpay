import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { useGetEnterpriseWalletQuery } from '@services/merchantEnterpriseWalletApi'

import { detailToForm } from '../dto/businessWalletForm.dto'
import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM,
  type BusinessWalletFormValues
} from '../schemas/business-wallet.schema'
import { useBusinessWalletPersist } from './useBusinessWalletPersist'
import { useWalletDocumentUrl } from './useWalletDocumentUrl'

export function useBusinessWalletForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const detail = useGetEnterpriseWalletQuery(id ?? '', { skip: !id })
  const { control, handleSubmit, reset, setError, getValues, formState } =
    useForm<BusinessWalletFormValues>({
      resolver: zodResolver(businessWalletFormSchema),
      defaultValues: EMPTY_BUSINESS_WALLET_FORM
    })
  const { onSubmit, onSaveDraft, isSaving } = useBusinessWalletPersist({
    id,
    detailData: detail.data,
    setError,
    getValues
  })
  const resolveFileUrl = useWalletDocumentUrl(id, detail.data, detail.refetch)
  const currentOtpPhone = useWatch({ control, name: 'otpPhone' })
  const requiresAdminPassword = Boolean(
    isEditMode &&
      detail.data &&
      currentOtpPhone?.trim() !== (detail.data.otpPhone ?? '')
  )

  useEffect(() => {
    if (detail.data && !formState.isDirty) reset(detailToForm(detail.data))
  }, [detail.data, formState.isDirty, reset])

  const isNotFound =
    detail.isError &&
    detail.error !== undefined &&
    'status' in detail.error &&
    detail.error.status === 404
  return {
    control,
    handleSubmit,
    onSubmit,
    onSaveDraft,
    canSaveDraft: !isEditMode || detail.data?.verificationStatus === 'DRAFT',
    resolveFileUrl,
    handleCancel: () => {
      void navigate(-1)
    },
    isEditMode,
    requiresAdminPassword,
    isSubmitting: isSaving,
    isLoadingDetail: detail.isLoading,
    isDetailError: detail.isError && !isNotFound,
    isNotFound,
    refetchDetail: () => {
      void detail.refetch()
    }
  }
}
