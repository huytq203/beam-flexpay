import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SCREENS, useScreenAccess } from '@/app/permissions'
import {
  useCreateSubMerchantMutation,
  useGetHierarchyParentByIdQuery,
  useGetSubMerchantDetailQuery,
  useUpdateSubMerchantMutation,
  type ApiParentMerchant
} from '@/app/services/merchantHierarchyApi'
import { FormInput } from '@components/form'
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, feedback } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { InheritableContactFields } from '../components/InheritableContactFields'
import { ParentMerchantField } from '../components/ParentMerchantField'
import {
  EMPTY_SUB_MERCHANT_DRAFT,
  subMerchantApiSchema,
  type SubMerchantApiDraft
} from '../schemas/subMerchantApi.schema'

export default function SubMerchantFormPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const access = useScreenAccess('MERCHANT_SUB_MERCHANT')
  const edit = location.pathname.includes('/edit/')
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path
  const detailQuery = useGetSubMerchantDetailQuery(id ?? '', {
    skip: !edit || !id
  })
  const [create, createState] = useCreateSubMerchantMutation()
  const [update, updateState] = useUpdateSubMerchantMutation()
  const form = useForm<SubMerchantApiDraft>({
    resolver: zodResolver(subMerchantApiSchema),
    defaultValues: EMPTY_SUB_MERCHANT_DRAFT
  })
  const [pickedParent, setPickedParent] = useState<ApiParentMerchant>()
  const merchantId = useWatch({ control: form.control, name: 'merchantId' })
  const inheritPhone = useWatch({ control: form.control, name: 'inheritPhone' })
  const inheritAddress = useWatch({
    control: form.control,
    name: 'inheritAddress'
  })
  // Vừa chọn trong dialog thì đã có đủ thông tin; chỉ gọi API khi mở bản ghi cũ.
  const parentQuery = useGetHierarchyParentByIdQuery(merchantId, {
    skip: !merchantId || pickedParent?.id === merchantId
  })
  const parent =
    pickedParent?.id === merchantId ? pickedParent : parentQuery.data

  useEffect(() => {
    const record = detailQuery.data
    if (!record) return
    form.reset({
      merchantId: record.merchantId,
      name: record.name,
      businessField: record.businessField ?? '',
      inheritPhone: record.phone?.inherited ?? true,
      phone: record.phone?.value ?? '',
      inheritAddress: record.address?.inherited ?? true,
      address: record.address?.value ?? ''
    })
  }, [detailQuery.data, form])

  if (!access.can(edit ? 'edit' : 'create'))
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  const save = async (value: SubMerchantApiDraft) => {
    try {
      const body = {
        name: value.name.trim(),
        businessField: value.businessField.trim() || undefined,
        inheritPhone: value.inheritPhone,
        phone: value.inheritPhone ? undefined : value.phone.trim(),
        inheritAddress: value.inheritAddress,
        address: value.inheritAddress ? undefined : value.address.trim()
      }
      const result =
        edit && id
          ? await update({ id, body }).unwrap()
          : await create({ merchantId: value.merchantId, ...body }).unwrap()
      feedback.success(
        edit ? 'Đã cập nhật Sub-merchant' : 'Đã tạo Sub-merchant'
      )
      navigate(`${basePath}/detail/${result.id}`)
    } catch {
      feedback.error('Không thể lưu Sub-merchant')
    }
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='flex flex-wrap items-center justify-between gap-3 '>
          <div className='flex items-center gap-2'>
            <ButtonComponent
              aria-label='Quay lại'
              type='default'
              size='small'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(basePath)}
            />
            <h1 className='font-display text-base font-semibold text-foreground'>
              {edit ? 'Cập nhật Sub-merchant' : 'Thêm Sub-merchant'}
            </h1>
          </div>
          {edit && detailQuery.data && (
            <span className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground'>
              {detailQuery.data.code}
            </span>
          )}
        </header>
      </CardComponent>
      {edit && detailQuery.isLoading && (
        <CardComponent>
          <p role='status'>Đang tải Sub-merchant…</p>
        </CardComponent>
      )}
      {edit && detailQuery.isError && (
        <CardComponent>
          <p
            role='alert'
            className='text-danger-strong'
          >
            Không thể tải Sub-merchant.
          </p>
        </CardComponent>
      )}
      {(!edit || detailQuery.data) && (
        <form
          id='sub-merchant-form'
          noValidate
          onSubmit={form.handleSubmit(save)}
          className='space-y-3!'
        >
          <CardComponent
            title='Merchant cha'
            className='border border-border bg-background shadow-none'
          >
            <ParentMerchantField
              control={form.control}
              parent={parent}
              isLoadingParent={parentQuery.isFetching}
              locked={edit}
              onPick={setPickedParent}
            />
          </CardComponent>
          <CardComponent
            title='Hồ sơ Sub-merchant'
            className='border border-border bg-background shadow-none'
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <FormInput
                control={form.control}
                name='name'
                label='Tên Sub-merchant'
                maxLength={255}
                required
              />
              <FormInput
                control={form.control}
                name='businessField'
                label='Lĩnh vực kinh doanh'
                maxLength={100}
              />
            </div>
          </CardComponent>
          <CardComponent
            title='Liên hệ'
            className='border border-border bg-background shadow-none'
          >
            <InheritableContactFields
              form={form}
              parent={parent}
              inheritPhone={inheritPhone}
              inheritAddress={inheritAddress}
            />
          </CardComponent>
          <div className='flex flex-wrap justify-end gap-2'>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Hủy'
              onClick={() => navigate(basePath)}
            />
            <ButtonComponent
              form='sub-merchant-form'
              htmlType='submit'
              icon={<SaveOutlined />}
              loading={createState.isLoading || updateState.isLoading}
              content={edit ? 'Lưu thay đổi' : 'Thêm Sub-merchant'}
            />
          </div>
        </form>
      )}
    </main>
  )
}
