import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import type { UploadFile } from '@components/form'
import {
  useGetMerchantByIdQuery,
  useLazyGetMerchantDocumentUrlQuery,
  useUploadMerchantDocumentMutation
} from '@services/apiMerchant'
import {
  useGetEnterpriseWalletQuery,
  type EnterpriseWalletDto
} from '@services/merchantEnterpriseWalletApi'
import type { MerchantType } from '@type/merchant'
import {
  CreateMerchantSchema,
  type CreateMerchantSchemaType
} from '../schemas/Merchant.schema'
import useHandle from './useHandle'

const EMPTY_FORM_VALUES: CreateMerchantSchemaType = {
  walletType: 'ENTERPRISE',
  walletId: '',
  signSeparateSubMerchantContract: false,
  merchantContract: [],
  mcc: '',
  merchantType: 'ENTERPRISE',
  merchantName: '',
  merchantLogo: [],
  productImages: [],
  website: '',
  productDescription: '',
  adminPassword: ''
}

export const useMerchantForm = () => {
  const navigate = useNavigate()
  const { id: merchantId } = useParams<{ id: string }>()
  const isEditMode = Boolean(merchantId)

  const {
    handleCreateMerchant,
    isLoadingPostMerchant,
    handlePutMerchant,
    isLoadingPutMerchant
  } = useHandle()
  const { data: merchantDetail } = useGetMerchantByIdQuery(merchantId ?? '', {
    skip: !merchantId
  })
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false)
  const [pickedWallet, setPickedWallet] = useState<EnterpriseWalletDto | null>(
    null
  )
  const [uploadDocument, { isLoading: isUploadingDocument }] =
    useUploadMerchantDocumentMutation()
  const [getDocumentUrl] = useLazyGetMerchantDocumentUrlQuery()

  const resolveFileUrl = useCallback(
    async (file: UploadFile) => {
      if (!merchantId) throw new Error('Merchant is not saved')
      const result = await getDocumentUrl(
        { merchantId, documentId: file.uid },
        false
      ).unwrap()
      return result.url
    },
    [getDocumentUrl, merchantId]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors }
  } = useForm<CreateMerchantSchemaType>({
    resolver: zodResolver(CreateMerchantSchema),
    defaultValues: EMPTY_FORM_VALUES
  })

  const walletType = useWatch({ control, name: 'walletType' })
  const walletId = useWatch({ control, name: 'walletId' })
  const { data: loadedWallet } = useGetEnterpriseWalletQuery(walletId, {
    skip:
      !walletId ||
      pickedWallet?.id === walletId ||
      merchantDetail?.enterpriseWallet?.id === walletId
  })
  const signsAtSubMerchant = useWatch({
    control,
    name: 'signSeparateSubMerchantContract'
  })
  const contractFiles = useWatch({ control, name: 'merchantContract' })
  const mcc = useWatch({ control, name: 'mcc' })
  const requiresAdminPassword = Boolean(
    isEditMode &&
      merchantDetail &&
      (mcc !== merchantDetail.mccCode ||
        signsAtSubMerchant !== Boolean(merchantDetail.contractSignedWithSub) ||
        contractFiles.some((file) => Boolean(file.originFileObj)))
  )

  const selectedWallet = walletId
    ? pickedWallet?.id === walletId
      ? pickedWallet
      : merchantDetail?.enterpriseWallet?.id === walletId
        ? merchantDetail.enterpriseWallet
        : loadedWallet
    : undefined

  useEffect(() => {
    if (isEditMode && merchantDetail) {
      reset({
        ...EMPTY_FORM_VALUES,
        walletType:
          merchantDetail.enterpriseWallet?.businessType ?? 'ENTERPRISE',
        walletId: merchantDetail.enterpriseWalletId ?? '',
        merchantType: merchantDetail.merchantType ?? 'ENTERPRISE',
        merchantName: merchantDetail.name ?? '',
        mcc: merchantDetail.mccCode ?? '',
        website: merchantDetail.websiteUrl ?? '',
        productDescription: merchantDetail.productDescription ?? '',
        signSeparateSubMerchantContract:
          merchantDetail.contractSignedWithSub ?? false,
        merchantContract: merchantDetail.contractFile
          ? [
              {
                uid: merchantDetail.contractFile.id,
                name: merchantDetail.contractFile.filename,
                status: 'done',
                type: merchantDetail.contractFile.contentType,
                size: merchantDetail.contractFile.sizeBytes
              }
            ]
          : [],
        merchantLogo: merchantDetail.logoFile
          ? [
              {
                uid: merchantDetail.logoFile.id,
                name: merchantDetail.logoFile.filename,
                status: 'done',
                type: merchantDetail.logoFile.contentType,
                size: merchantDetail.logoFile.sizeBytes
              }
            ]
          : [],
        productImages:
          merchantDetail.productImages?.map((file) => ({
            uid: file.id,
            name: file.filename,
            status: 'done' as const,
            type: file.contentType,
            size: file.sizeBytes
          })) ?? []
      })
    }
  }, [merchantDetail, isEditMode, reset])

  const uploadFile = async (
    file: (typeof EMPTY_FORM_VALUES.merchantLogo)[number],
    documentType:
      | 'MERCHANT_CONTRACT'
      | 'MERCHANT_LOGO'
      | 'MERCHANT_PRODUCT_IMAGE'
  ): Promise<string | undefined> => {
    if (!file.originFileObj) return undefined
    const result = await uploadDocument({
      file: file.originFileObj,
      documentType
    }).unwrap()
    return result.stagingId
  }

  const onSubmit = async (data: CreateMerchantSchemaType) => {
    if (!selectedWallet && !isEditMode) return
    if (requiresAdminPassword && !data.adminPassword?.trim()) {
      setError('adminPassword', {
        message: 'Vui lòng nhập mật khẩu quản trị để xác nhận thay đổi nhạy cảm'
      })
      return
    }

    try {
      const contractStagingId = data.merchantContract[0]
        ? await uploadFile(data.merchantContract[0], 'MERCHANT_CONTRACT')
        : undefined
      const logoStagingId = data.merchantLogo[0]
        ? await uploadFile(data.merchantLogo[0], 'MERCHANT_LOGO')
        : undefined
      const productImageStagingIds = (
        await Promise.all(
          data.productImages
            .filter((file) => Boolean(file.originFileObj))
            .map((file) => uploadFile(file, 'MERCHANT_PRODUCT_IMAGE'))
        )
      ).filter((id): id is string => Boolean(id))
      const retainedImageIds = new Set(
        data.productImages.map((file) => file.uid)
      )
      const removedProductImageIds = merchantDetail?.productImages
        ?.filter((file) => !retainedImageIds.has(file.id))
        .map((file) => file.id)

      if (isEditMode && merchantId && merchantDetail) {
        await handlePutMerchant(
          merchantId,
          {
            name: data.merchantName,
            mccCode: data.mcc,
            websiteUrl: data.website || undefined,
            productDescription: data.productDescription || undefined,
            businessCategory: merchantDetail.businessCategory,
            supportContact: merchantDetail.supportContact,
            contractSignedWithSub: data.signSeparateSubMerchantContract,
            contractStagingId,
            logoStagingId,
            productImageStagingIds,
            removedProductImageIds,
            adminPassword: requiresAdminPassword
              ? data.adminPassword
              : undefined
          },
          () => navigate(-1)
        )
        return
      }
      await handleCreateMerchant(
        {
          enterpriseWalletId: data.walletId,
          merchantType: data.merchantType as MerchantType,
          name: data.merchantName,
          mccCode: data.mcc,
          websiteUrl: data.website || undefined,
          productDescription: data.productDescription || undefined,
          contractSignedWithSub: data.signSeparateSubMerchantContract,
          contractStagingId,
          logoStagingId,
          productImageStagingIds,
          submitForApproval: true
        },
        () => {
          reset(EMPTY_FORM_VALUES)
          setPickedWallet(null)
        }
      )
    } catch {
      // The shared API base query shows the server error; keep the form values.
    }
  }

  const isSubmitting =
    isUploadingDocument ||
    (isEditMode ? isLoadingPutMerchant : isLoadingPostMerchant)

  return {
    isEditMode,
    isSubmitting,
    control,
    handleSubmit,
    onSubmit,
    selectedWallet,
    errors,
    setPickedWallet,
    setValue,
    walletId,
    walletType,
    isWalletPickerOpen,
    setIsWalletPickerOpen,
    signsAtSubMerchant,
    resolveFileUrl,
    requiresAdminPassword
  }
}
