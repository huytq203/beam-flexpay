import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextArea,
  FormUploadCombined
} from '@components/form'
import {
  ButtonComponent,
  CardComponent,
  ScrollToTopButton
} from '@components/index'
import { ArrowLeftOutlined, SaveOutlined, WalletIcon } from '@components/icons'
import {
  CreateMerchantSchema,
  type CreateMerchantSchemaType
} from '../schemas/Merchant.schema'
import useHandle from '../hooks/useHandle'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetMerchantByIdQuery, useUploadMerchantDocumentMutation } from '@services/apiMerchant'
import { useGetEnterpriseWalletQuery, type EnterpriseWalletDto } from '@services/merchantEnterpriseWalletApi'
import type { MerchantType } from '@type/merchant'
import { EnterpriseWalletPickerDialog } from '../components/EnterpriseWalletPickerDialog'

interface MerchantFormSectionProps {
  id: string
  step: string
  title: string
  children: ReactNode
}

const EMPTY_FORM_VALUES: CreateMerchantSchemaType = {
  walletType: 'ENTERPRISE',
  walletId: '',
  signSeparateSubMerchantContract: false,
  merchantContract: [],
  mcc: '',
  merchantType: 'ENTERPRISE',
  merchantName: '',
  merchantLogo: [],
  website: '',
  productDescription: '',
  adminPassword: ''
}

const walletTypeOptions = [
  { label: 'Doanh nghiệp', value: 'ENTERPRISE' },
  { label: 'Hộ kinh doanh', value: 'HOUSEHOLD' }
]

const mccOptions = [
  { label: 'F&B — Chuỗi cà phê (MCC 5814)', value: '5814' },
  { label: 'Nhà hàng (MCC 5812)', value: '5812' },
  { label: 'Bán lẻ tổng hợp (MCC 5399)', value: '5399' },
  { label: 'Thời trang (MCC 5691)', value: '5691' },
  { label: 'Dịch vụ phần mềm (MCC 5734)', value: '5734' }
]

const merchantTypeOptions = [
  { label: 'Doanh nghiệp', value: 'ENTERPRISE' },
  { label: 'Hộ kinh doanh', value: 'HOUSEHOLD' }
]

const uploadFieldClassName =
  'flex flex-col gap-2 [&_.ant-upload-drag]:min-h-28 [&_.ant-upload-drag]:rounded-lg! [&_.ant-upload-drag]:border-border! [&_.ant-upload-drag]:bg-muted/40! [&_.ant-upload-drag]:px-3! [&_.ant-upload-drag]:py-4! [&_.ant-upload-drag-icon]:mb-2! [&_.ant-upload-text]:m-0! [&_.ant-upload-text]:text-sm! [&_.ant-upload-text]:text-foreground! [&_.anticon]:text-primary!'

const requiredLabel = (label: string) => (
  <span>
    {label}
    <span
      aria-hidden='true'
      className='ml-1 text-danger-strong'
    >
      *
    </span>
  </span>
)

const MerchantFormSection = ({
  id,
  step,
  title,
  children
}: MerchantFormSectionProps) => (
  <CardComponent
    className='overflow-hidden border-border bg-background! shadow-none'
    styles={{ body: { padding: 0 } }}
  >
    <section aria-labelledby={id}>
      <div className='flex items-center gap-3 border-b border-border bg-muted/60! px-4 py-3 sm:px-5'>
        <span
          aria-hidden='true'
          className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary! text-xs font-semibold text-primary-foreground'
        >
          {step}
        </span>
        <h2
          id={id}
          className='text-sm font-semibold text-foreground sm:text-base'
        >
          {title}
        </h2>
      </div>
      <div className='p-4 sm:p-5'>{children}</div>
    </section>
  </CardComponent>
)

const CreateMerchant = () => {
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
  const [pickedWallet, setPickedWallet] = useState<EnterpriseWalletDto | null>(null)
  const [uploadDocument, { isLoading: isUploadingDocument }] = useUploadMerchantDocumentMutation()

  const { control, handleSubmit, reset, setValue, setError, formState: { errors } } =
    useForm<CreateMerchantSchemaType>({
      resolver: zodResolver(CreateMerchantSchema),
      defaultValues: EMPTY_FORM_VALUES
    })

  const walletType = useWatch({ control, name: 'walletType' })
  const walletId = useWatch({ control, name: 'walletId' })
  const { data: loadedWallet } = useGetEnterpriseWalletQuery(walletId, {
    skip: !walletId || pickedWallet?.id === walletId || merchantDetail?.enterpriseWallet?.id === walletId
  })
  const signsAtSubMerchant = useWatch({
    control,
    name: 'signSeparateSubMerchantContract'
  })
  const contractFiles = useWatch({ control, name: 'merchantContract' })
  const mcc = useWatch({ control, name: 'mcc' })
  const requiresAdminPassword = Boolean(isEditMode && merchantDetail && (
    mcc !== merchantDetail.mccCode ||
    signsAtSubMerchant !== Boolean(merchantDetail.contractSignedWithSub) ||
    contractFiles.some((file) => Boolean(file.originFileObj))
  ))

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
        walletType: merchantDetail.enterpriseWallet?.businessType ?? 'ENTERPRISE',
        walletId: merchantDetail.enterpriseWalletId ?? '',
        merchantType: merchantDetail.merchantType ?? 'ENTERPRISE',
        merchantName: merchantDetail.name ?? '',
        mcc: merchantDetail.mccCode ?? '',
        website: merchantDetail.websiteUrl ?? '',
        productDescription: merchantDetail.productDescription ?? '',
        signSeparateSubMerchantContract: merchantDetail.contractSignedWithSub ?? false,
        merchantContract: merchantDetail.contractFile ? [{
          uid: merchantDetail.contractFile.id,
          name: merchantDetail.contractFile.filename,
          status: 'done',
          type: merchantDetail.contractFile.contentType,
          size: merchantDetail.contractFile.sizeBytes
        }] : [],
        merchantLogo: merchantDetail.logoFile ? [{
          uid: merchantDetail.logoFile.id,
          name: merchantDetail.logoFile.filename,
          status: 'done',
          type: merchantDetail.logoFile.contentType,
          size: merchantDetail.logoFile.sizeBytes
        }] : []
      })
    }
  }, [merchantDetail, isEditMode, reset])

  const uploadFile = async (file: typeof EMPTY_FORM_VALUES.merchantLogo[number], documentType: 'MERCHANT_CONTRACT' | 'MERCHANT_LOGO'): Promise<string | undefined> => {
    if (!file.originFileObj) return undefined
    const result = await uploadDocument({ file: file.originFileObj, documentType }).unwrap()
    return result.stagingId
  }

  const onSubmit = async (data: CreateMerchantSchemaType) => {
    if (!selectedWallet && !isEditMode) return
    if (requiresAdminPassword && !data.adminPassword?.trim()) {
      setError('adminPassword', { message: 'Vui lòng nhập mật khẩu quản trị để xác nhận thay đổi nhạy cảm' })
      return
    }

    try {
      const contractStagingId = data.merchantContract[0]
        ? await uploadFile(data.merchantContract[0], 'MERCHANT_CONTRACT')
        : undefined
      const logoStagingId = data.merchantLogo[0]
        ? await uploadFile(data.merchantLogo[0], 'MERCHANT_LOGO')
        : undefined

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
          adminPassword: requiresAdminPassword ? data.adminPassword : undefined
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

  const isSubmitting = isUploadingDocument || (isEditMode ? isLoadingPutMerchant : isLoadingPostMerchant)

  return (
    <div className='min-h-full bg-muted/30 px-3 py-4 sm:px-5 sm:py-5'>
      <div className='mx-auto w-full '>
        <header className='z-20 mb-4 rounded-md! border-b border-border bg-background px-3 py-3 sm:top-0 sm:px-5'>
          <div className='mx-auto flex  flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-center gap-3'>
              <ButtonComponent
                type='text'
                icon={<ArrowLeftOutlined />}
                aria-label='Quay lại'
                title='Quay lại'
                className='shrink-0'
                onClick={() => navigate(-1)}
              />
              <div className='min-w-0'>
                <h1 className='text-lg font-semibold text-foreground sm:text-xl'>
                  {isEditMode ? 'Cập nhật ĐVCNTT' : 'Đăng ký ĐVCNTT'}
                </h1>
                <p className='mt-0.5 text-sm text-muted-foreground'>
                  Liên kết ví điện tử và hoàn thiện hồ sơ merchant cấp Master
                </p>
              </div>
            </div>

            <ButtonComponent
              form='merchant-form'
              htmlType='submit'
              type='primary'
              icon={<SaveOutlined />}
              content={isEditMode ? 'Lưu thay đổi' : 'Đăng ký ĐVCNTT'}
              loading={isSubmitting}
              className='w-full sm:w-auto'
            />
          </div>
        </header>

        <form
          id='merchant-form'
          className='space-y-4! pb-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <MerchantFormSection
            id='merchant-wallet-information'
            step='I'
            title='Chọn ví điện tử doanh nghiệp / hộ kinh doanh'
          >
            <div className='grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2'>
              <FormSelect
                control={control}
                name='walletType'
                className='flex flex-col md:col-span-2'
                label={requiredLabel('Loại ví')}
                options={walletTypeOptions}
                allowClear={false}
                classNameLable='text-sm font-medium text-foreground'
                onChange={() => {
                  setPickedWallet(null)
                  setValue('walletId', '', {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }}
              />
              <div className='min-w-0 md:col-span-2'>
                <label htmlFor='wallet-picker-trigger' className='text-sm font-medium text-foreground'>
                  {requiredLabel('Chọn ví điện tử')}
                </label>
                <div className='mt-2 flex min-h-18 min-w-0 flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3'>
                  <ButtonComponent
                    id='wallet-picker-trigger'
                    htmlType='button'
                    type='default'
                    icon={<WalletIcon aria-hidden size={18} />}
                    content={selectedWallet ? 'Đổi ví' : 'Chọn ví'}
                    onClick={() => setIsWalletPickerOpen(true)}
                  />
                  <span className='min-w-0 text-[13px] text-muted-foreground'>
                    {selectedWallet
                      ? `${selectedWallet.legalName || selectedWallet.registeredEmail} · ${selectedWallet.registeredEmail}`
                      : 'Chọn ví đã xác minh để liên kết với ĐVCNTT.'}
                  </span>
                </div>
                {errors.walletId && <p role='alert' className='mt-1 text-xs text-danger-strong'>{errors.walletId.message}</p>}
              </div>

              <div className='md:col-span-2'>
                <label className='text-sm font-medium text-foreground'>
                  Thông tin chủ ví (từ KYB/eKYC)
                </label>
                <div
                  aria-live='polite'
                  className='mt-1 flex min-h-10 items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground'
                >
                  {selectedWallet ? `${selectedWallet.legalName || selectedWallet.registeredEmail} · MST ${selectedWallet.taxCode ?? 'Chưa có'} · ${selectedWallet.registeredEmail}` : (
                    <span className='text-muted-foreground'>
                      Chọn ví điện tử để xem thông tin đã xác thực
                    </span>
                  )}
                </div>
                <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
                  Tự động hiển thị sau khi chọn ví, không chỉnh sửa tại đây.
                </p>
              </div>
            </div>
          </MerchantFormSection>

          <MerchantFormSection
            id='merchant-master-profile'
            step='II'
            title='Hồ sơ ĐVCNTT (cấp Master)'
          >
            <div className='space-y-5'>
              <FormSwitch
                control={control}
                name='signSeparateSubMerchantContract'
                label='Ký hợp đồng riêng với Sub-merchant'
                description='Mặc định tắt để ký hợp đồng ở cấp Master. Bật khi hợp đồng sẽ được ký riêng và bắt buộc tại từng Sub-merchant.'
              />

              <div>
                <FormUploadCombined
                  control={control}
                  name='merchantContract'
                  label={
                    signsAtSubMerchant
                      ? 'Hợp đồng ĐVCNTT (đã ký)'
                      : requiredLabel('Hợp đồng ĐVCNTT (đã ký)')
                  }
                  multiple={false}
                  maxCount={1}
                  accept='.pdf,application/pdf'
                  dragText='Kéo thả hoặc chọn tệp hợp đồng PDF'
                  className={uploadFieldClassName}
                  classNameLabel='text-sm font-medium text-foreground'
                />
                <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
                  PDF, tối đa 10MB. Bắt buộc khi ký ở cấp Master.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2'>
                <FormSelect
                  control={control}
                  name='mcc'
                  className='flex flex-col'
                  label={requiredLabel('Loại hình KD / Ngành nghề (MCC)')}
                  placeholder='Chọn ngành nghề kinh doanh'
                  showSearch
                  optionFilterProp='label'
                  options={mccOptions}
                  classNameLable='text-sm font-medium text-foreground'
                />
                <FormSelect
                  control={control}
                  name='merchantType'
                  className='flex flex-col'
                  label={requiredLabel('Loại ĐVCNTT')}
                  options={merchantTypeOptions}
                  allowClear={false}
                  classNameLable='text-sm font-medium text-foreground'
                />

                <div className='md:col-span-2'>
                  <FormInput
                    control={control}
                    name='merchantName'
                    className='flex flex-col'
                    label={requiredLabel('Tên merchant (tên hiển thị)')}
                    placeholder='Tên hiển thị khi thu/chi hộ'
                    maxLength={200}
                    showCount
                    classNameLable='text-sm font-medium text-foreground'
                  />
                  <p className='mt-1.5 text-xs leading-5 text-muted-foreground'>
                    Có thể khác tên pháp lý, tối đa 200 ký tự.
                  </p>
                </div>
                <div className='col-span-1 md:col-span-2'>
                  <FormUploadCombined
                    control={control}
                    name='merchantLogo'
                    label='Logo Merchant'
                    multiple={false}
                    maxCount={1}
                    accept='image/png,image/jpeg'
                    dragText='Tải lên logo thương hiệu'
                    className={uploadFieldClassName}
                    classNameLabel='text-sm font-medium text-foreground'
                  />
                </div>
                <div className='col-span-1 md:col-span-2'>
                  <FormInput
                    control={control}
                    name='website'
                    className='flex flex-col'
                    label='Địa chỉ website'
                    placeholder='https://example.com'
                    inputMode='url'
                    classNameLable='text-sm font-medium text-foreground'
                  />
                </div>

                <FormTextArea
                  control={control}
                  name='productDescription'
                  label='Mô tả sản phẩm / dịch vụ'
                  placeholder='Mô tả ngắn về sản phẩm hoặc dịch vụ cung cấp'
                  rows={4}
                  maxLength={1000}
                  showCount
                  className='flex flex-col md:col-span-2'
                  classNameLable='text-sm font-medium text-foreground'
                />
              </div>
            </div>
          </MerchantFormSection>
          {requiresAdminPassword && <MerchantFormSection id='merchant-sensitive-confirmation' step='III' title='Xác nhận thay đổi nhạy cảm'>
            <FormInput control={control} name='adminPassword' type='password' autoComplete='current-password' className='flex max-w-md flex-col' label={requiredLabel('Mật khẩu quản trị')} placeholder='Nhập mật khẩu của bạn' />
          </MerchantFormSection>}
        </form>
        <EnterpriseWalletPickerDialog
          open={isWalletPickerOpen}
          selectedId={walletId}
          onCancel={() => setIsWalletPickerOpen(false)}
          onSelect={(wallet) => {
            setPickedWallet(wallet)
            setValue('walletId', wallet.id, { shouldDirty: true, shouldValidate: true })
            if (wallet.businessType && wallet.businessType !== walletType) {
              setValue('walletType', wallet.businessType, { shouldDirty: true, shouldValidate: true })
            }
            setIsWalletPickerOpen(false)
          }}
        />
      </div>
      <ScrollToTopButton />
    </div>
  )
}

export default CreateMerchant
