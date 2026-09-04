import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
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
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import {
  CreateMerchantSchema,
  type CreateMerchantSchemaType
} from '../schemas/Merchant.schema'
import useHandle from '../hooks/useHandle'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetMerchantByIdQuery } from '@services/apiMerchant'

interface MerchantFormSectionProps {
  id: string
  step: string
  title: string
  children: ReactNode
}

interface WalletOption {
  value: string
  label: string
  walletType: 'BUSINESS' | 'PERSONAL'
  ownerInfo: string
  merchantCode: string
  contactEmail: string
  contactPhone: string
}

const EMPTY_FORM_VALUES: CreateMerchantSchemaType = {
  walletType: 'BUSINESS',
  walletId: '',
  signSeparateSubMerchantContract: false,
  merchantContract: [],
  mcc: '',
  merchantType: 'BUSINESS',
  merchantName: '',
  merchantLogo: [],
  website: '',
  productDescription: ''
}

// Dữ liệu lựa chọn tạm thời theo prototype. Thay bằng API tra cứu ví khi
// backend cung cấp endpoint dành riêng cho luồng đăng ký ĐVCNTT.
const REFERENCE_WALLETS: WalletOption[] = [
  {
    value: 'wallet-vtqt',
    label: 'Công ty CP Việt Thái Quốc Tế',
    walletType: 'BUSINESS',
    ownerInfo: 'Việt Thái Quốc Tế · MST 0304xxxxxx · NĐDPL: Nguyễn Văn Hải',
    merchantCode: 'VTQT',
    contactEmail: 'merchant@vtqt.vn',
    contactPhone: '0900000000'
  },
  {
    value: 'wallet-personal-demo',
    label: 'Nguyễn Minh Anh',
    walletType: 'PERSONAL',
    ownerInfo: 'Nguyễn Minh Anh · CCCD 0792xxxxxxx · Đã xác thực eKYC',
    merchantCode: 'NMA',
    contactEmail: 'minhanh@example.com',
    contactPhone: '0912345678'
  }
]

const walletTypeOptions = [
  { label: 'Doanh nghiệp', value: 'BUSINESS' },
  { label: 'Cá nhân', value: 'PERSONAL' }
]

const mccOptions = [
  { label: 'F&B — Chuỗi cà phê (MCC 5814)', value: '5814' },
  { label: 'Nhà hàng (MCC 5812)', value: '5812' },
  { label: 'Bán lẻ tổng hợp (MCC 5399)', value: '5399' },
  { label: 'Thời trang (MCC 5691)', value: '5691' },
  { label: 'Dịch vụ phần mềm (MCC 5734)', value: '5734' }
]

const merchantTypeOptions = [
  { label: 'Doanh nghiệp', value: 'BUSINESS' },
  { label: 'Hộ kinh doanh', value: 'HOUSEHOLD_BUSINESS' },
  { label: 'Cá nhân', value: 'PERSONAL' }
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

  const { control, handleSubmit, reset, setValue } =
    useForm<CreateMerchantSchemaType>({
      resolver: zodResolver(CreateMerchantSchema),
      defaultValues: EMPTY_FORM_VALUES
    })

  const walletType = useWatch({ control, name: 'walletType' })
  const walletId = useWatch({ control, name: 'walletId' })
  const signsAtSubMerchant = useWatch({
    control,
    name: 'signSeparateSubMerchantContract'
  })

  const walletCatalog = useMemo(() => {
    if (!isEditMode || !merchantDetail) return REFERENCE_WALLETS

    return [
      ...REFERENCE_WALLETS,
      {
        value: merchantDetail.code,
        label: merchantDetail.name,
        walletType: 'BUSINESS' as const,
        ownerInfo: `${merchantDetail.name} · Mã merchant ${merchantDetail.code}`,
        merchantCode: merchantDetail.code,
        contactEmail: merchantDetail.contactEmail,
        contactPhone: merchantDetail.contactPhone
      }
    ]
  }, [isEditMode, merchantDetail])

  const availableWallets = walletCatalog.filter(
    (wallet) => wallet.walletType === walletType
  )
  const selectedWallet = walletCatalog.find(
    (wallet) => wallet.value === walletId
  )

  useEffect(() => {
    if (isEditMode && merchantDetail) {
      reset({
        ...EMPTY_FORM_VALUES,
        walletType: 'BUSINESS',
        walletId: merchantDetail.code,
        merchantName: merchantDetail.name ?? ''
      })
    }
  }, [merchantDetail, isEditMode, reset])

  const onSubmit = (data: CreateMerchantSchemaType) => {
    if (isEditMode && merchantId && merchantDetail) {
      handlePutMerchant(
        merchantId,
        {
          name: data.merchantName,
          contactEmail: merchantDetail.contactEmail,
          contactPhone: merchantDetail.contactPhone
        },
        () => navigate(-1)
      )
      return
    }

    const wallet = walletCatalog.find((item) => item.value === data.walletId)
    if (!wallet) return

    // Adapter tạm thời cho contract /merchants hiện tại. Các field hồ sơ mới
    // vẫn nằm trong form và sẽ được chuyển nguyên trạng khi API ĐVCNTT sẵn sàng.
    handleCreateMerchant(
      {
        name: data.merchantName,
        code: wallet.merchantCode,
        contactEmail: wallet.contactEmail,
        contactPhone: wallet.contactPhone
      },
      () => reset(EMPTY_FORM_VALUES)
    )
  }

  const isSubmitting = isEditMode ? isLoadingPutMerchant : isLoadingPostMerchant

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
            title='Chọn ví điện tử (cá nhân / doanh nghiệp)'
          >
            <div className='grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2'>
              <FormSelect
                control={control}
                name='walletType'
                className='flex flex-col'
                label={requiredLabel('Loại ví')}
                options={walletTypeOptions}
                allowClear={false}
                classNameLable='text-sm font-medium text-foreground'
                onChange={() => {
                  setValue('walletId', '', {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }}
              />
              <FormSelect
                control={control}
                name='walletId'
                className='flex flex-col'
                label={requiredLabel('Chọn ví điện tử')}
                placeholder='Tìm theo tên chủ ví'
                showSearch
                optionFilterProp='label'
                options={availableWallets.map(({ label, value }) => ({
                  label,
                  value
                }))}
                classNameLable='text-sm font-medium text-foreground'
              />

              <div className='md:col-span-2'>
                <label className='text-sm font-medium text-foreground'>
                  Thông tin chủ ví (từ KYB/eKYC)
                </label>
                <div
                  aria-live='polite'
                  className='mt-1 flex min-h-10 items-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground'
                >
                  {selectedWallet?.ownerInfo ?? (
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
        </form>
      </div>
      <ScrollToTopButton />
    </div>
  )
}

export default CreateMerchant
