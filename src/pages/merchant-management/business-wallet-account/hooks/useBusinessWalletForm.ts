import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { useMessage } from '@hooks/useMessage'
import {
  toBusinessWalletPayload,
  usePostBusinessWalletMutation,
  usePutBusinessWalletMutation
} from '@services/apiBusinessWallet.api'
import { useGetAccountByIdQuery } from '@services/apiWalletAccount.api'

import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM,
  type BusinessWalletFormValues
} from '../schemas/business-wallet.schema'

export function useBusinessWalletForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { successMess, warningMess } = useMessage()
  const detail = useGetAccountByIdQuery(id ?? '', { skip: !id })
  const [postBusinessWallet, postState] = usePostBusinessWalletMutation()
  const [putBusinessWallet, putState] = usePutBusinessWalletMutation()
  const { control, handleSubmit, reset, getValues, setValue } =
    useForm<BusinessWalletFormValues>({
      resolver: zodResolver(businessWalletFormSchema),
      defaultValues: EMPTY_BUSINESS_WALLET_FORM
    })

  useEffect(() => {
    if (!isEditMode || !detail.data) return
    reset({
      ...EMPTY_BUSINESS_WALLET_FORM,
      businessName: detail.data.ownerUsername ?? ''
    })
  }, [detail.data, isEditMode, reset])

  const handleCopyContactPhone = (): void => {
    const contactPhone = getValues('contactPhone').trim()

    if (!contactPhone) {
      warningMess('Vui lòng nhập SĐT liên hệ trước khi sao chép')
      return
    }

    setValue('otpPhone', contactPhone, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    successMess('Đã sao chép SĐT liên hệ sang SĐT nhận OTP')
  }
  const handleCancel = (): void => {
    void navigate(-1)
  }
  const onSubmit = async (values: BusinessWalletFormValues): Promise<void> => {
    const body = toBusinessWalletPayload(values)
    try {
      if (isEditMode && id) {
        await putBusinessWallet({ id, body }).unwrap()
        successMess('Cập nhật ví doanh nghiệp thành công')
      } else {
        await postBusinessWallet(body).unwrap()
        successMess('Thêm mới ví doanh nghiệp thành công')
      }
      navigate(-1)
    } catch {
      // Lỗi HTTP đã được fetchBaseQueryCustom xử lý tập trung.
    }
  }

  const isNotFound = detail.isError && detail.error !== undefined &&
    'status' in detail.error && detail.error.status === 404

  return {
    control, handleSubmit, onSubmit, handleCopyContactPhone, handleCancel,
    isEditMode,
    isSubmitting: postState.isLoading || putState.isLoading,
    isLoadingDetail: detail.isLoading,
    isDetailError: detail.isError && !isNotFound,
    isNotFound,
    refetchDetail: () => { void detail.refetch() }
  }
}
