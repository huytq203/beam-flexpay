import { useCallback, useEffect } from 'react'
import type { UploadFile } from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { getDate } from '@/app/utils/helper-functions/date'
import { useMessage } from '@hooks/useMessage'
import { useUploadMerchantDocumentMutation } from '@services/apiMerchant'
import {
  useCreateEnterpriseWalletMutation,
  useGetEnterpriseWalletQuery,
  useLazyGetEnterpriseWalletDocumentUrlQuery,
  useUpdateEnterpriseWalletMutation,
  type EnterpriseWalletDto,
  type EnterpriseWalletDocument,
  type EnterpriseWalletPayload
} from '@services/merchantEnterpriseWalletApi'
import {
  businessWalletFormSchema,
  EMPTY_BUSINESS_WALLET_FORM,
  type BusinessWalletFormValues
} from '../schemas/business-wallet.schema'

const storedFile = (file?: EnterpriseWalletDocument) =>
  file?.id
    ? [
        {
          uid: file.id,
          name: file.filename || 'Tệp đã tải lên',
          type: file.contentType,
          size: file.sizeBytes,
          status: 'done' as const
        }
      ]
    : []

const detailToForm = (
  wallet: EnterpriseWalletDto
): BusinessWalletFormValues => ({
  ...EMPTY_BUSINESS_WALLET_FORM,
  email: wallet.registeredEmail || '',
  businessName: wallet.legalName || '',
  taxCode: wallet.taxCode || '',
  businessType: wallet.businessType || 'ENTERPRISE',
  headOfficeAddress: wallet.headOfficeAddress || '',
  legalRepName: wallet.legalRepresentativeName || '',
  legalRepIdNumber: wallet.legalRepresentativeIdNumber || '',
  managerName: wallet.managerName || '',
  managerPosition: wallet.managerTitle || '',
  managerIdNumber: wallet.managerIdNumber || '',
  managerIdExpiry: wallet.managerIdExpiryDate || '',
  otpPhone: wallet.otpPhone || '',
  businessLicense: storedFile(wallet.businessLicense),
  authorizationLetter: storedFile(wallet.authorizationLetter),
  idCardFront: storedFile(wallet.idCardFront),
  idCardBack: storedFile(wallet.idCardBack),
  isInternalWallet: wallet.internalWallet || false
})

export function useBusinessWalletForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { successMess } = useMessage()
  const detail = useGetEnterpriseWalletQuery(id ?? '', { skip: !id })
  const [createWallet, createState] = useCreateEnterpriseWalletMutation()
  const [updateWallet, updateState] = useUpdateEnterpriseWalletMutation()
  const [uploadDocument, uploadState] = useUploadMerchantDocumentMutation()
  const [getDocumentUrl] = useLazyGetEnterpriseWalletDocumentUrlQuery()
  const resolveFileUrl = useCallback(
    async (file: UploadFile) => {
      if (!id) throw new Error('Enterprise wallet is not saved')
      const result = await getDocumentUrl(
        { walletId: id, documentId: file.uid },
        false
      ).unwrap()
      return result.url
    },
    [getDocumentUrl, id]
  )
  const { control, handleSubmit, reset, setError } =
    useForm<BusinessWalletFormValues>({
      resolver: zodResolver(businessWalletFormSchema),
      defaultValues: EMPTY_BUSINESS_WALLET_FORM
    })
  const currentOtpPhone = useWatch({ control, name: 'otpPhone' })
  const requiresAdminPassword = Boolean(
    isEditMode &&
      detail.data &&
      currentOtpPhone?.trim() !== (detail.data.otpPhone ?? '')
  )

  useEffect(() => {
    if (detail.data) reset(detailToForm(detail.data))
  }, [detail.data, reset])

  const upload = async (
    file: BusinessWalletFormValues['businessLicense'][number] | undefined,
    documentType:
      | 'BUSINESS_LICENSE'
      | 'ID_CARD_FRONT'
      | 'ID_CARD_BACK'
      | 'AUTHORIZATION_LETTER'
  ): Promise<string | undefined> => {
    if (!file?.originFileObj) return undefined
    const result = await uploadDocument({
      file: file.originFileObj,
      documentType
    }).unwrap()
    return result.stagingId
  }

  const onSubmit = async (values: BusinessWalletFormValues): Promise<void> => {
    const phoneChanged = Boolean(
      isEditMode &&
        detail.data &&
        values.otpPhone.trim() !== (detail.data.otpPhone ?? '')
    )
    if (phoneChanged && !values.adminPassword?.trim()) {
      setError('adminPassword', {
        message: 'Vui lòng nhập mật khẩu quản trị khi đổi số OTP'
      })
      return
    }
    try {
      const body: EnterpriseWalletPayload = {
        registeredEmail: values.email.trim(),
        legalName: values.businessName.trim(),
        taxCode: values.taxCode.trim(),
        businessType: values.businessType,
        headOfficeAddress: values.headOfficeAddress.trim(),
        legalRepresentativeName: values.legalRepName.trim(),
        legalRepresentativeIdNumber: values.legalRepIdNumber.trim(),
        managerName: values.managerName.trim(),
        managerTitle: values.managerPosition.trim(),
        managerIdNumber: values.managerIdNumber.trim(),
        managerIdExpiryDate: getDate(values.managerIdExpiry) || undefined,
        otpPhone: values.otpPhone.trim(),
        adminPassword: phoneChanged ? values.adminPassword : undefined,
        businessLicenseStagingId: await upload(
          values.businessLicense[0],
          'BUSINESS_LICENSE'
        ),
        authorizationLetterStagingId: await upload(
          values.authorizationLetter[0],
          'AUTHORIZATION_LETTER'
        ),
        idCardFrontStagingId: await upload(
          values.idCardFront[0],
          'ID_CARD_FRONT'
        ),
        idCardBackStagingId: await upload(values.idCardBack[0], 'ID_CARD_BACK'),
        internalWallet: values.isInternalWallet
      }
      if (isEditMode && id) {
        delete body.registeredEmail
        await updateWallet({ id, body }).unwrap()
        successMess('Cập nhật ví doanh nghiệp thành công')
      } else {
        await createWallet(body).unwrap()
        successMess('Tạo ví doanh nghiệp thành công')
      }
      void navigate(-1)
    } catch {
      // Lỗi API được xử lý tại base query chung.
    }
  }

  const isNotFound =
    detail.isError &&
    detail.error !== undefined &&
    'status' in detail.error &&
    detail.error.status === 404
  return {
    control,
    handleSubmit,
    onSubmit,
    resolveFileUrl,
    handleCancel: () => {
      void navigate(-1)
    },
    isEditMode,
    requiresAdminPassword,
    isSubmitting:
      createState.isLoading || updateState.isLoading || uploadState.isLoading,
    isLoadingDetail: detail.isLoading,
    isDetailError: detail.isError && !isNotFound,
    isNotFound,
    refetchDetail: () => {
      void detail.refetch()
    }
  }
}
