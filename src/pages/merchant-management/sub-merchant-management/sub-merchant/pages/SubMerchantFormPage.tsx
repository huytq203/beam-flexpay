import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SCREENS, useScreenAccess } from '@/app/permissions'
import {
  useCreateSubMerchantMutation,
  useGetHierarchyParentsQuery,
  useGetSubMerchantDetailQuery,
  useUpdateSubMerchantMutation
} from '@/app/services/merchantHierarchyApi'
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextArea
} from '@components/form'
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, feedback } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'

const schema = z
  .object({
    merchantId: z.string().min(1, 'Vui lòng chọn Merchant cha'),
    name: z.string().trim().min(1, 'Vui lòng nhập tên Sub-merchant').max(255),
    businessField: z.string().max(100),
    inheritPhone: z.boolean(),
    phone: z.string().max(15),
    inheritAddress: z.boolean(),
    address: z.string().max(500)
  })
  .superRefine((value, context) => {
    if (!value.inheritPhone && !value.phone.trim())
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Vui lòng nhập số điện thoại'
      })
    if (!value.inheritAddress && !value.address.trim())
      context.addIssue({
        code: 'custom',
        path: ['address'],
        message: 'Vui lòng nhập địa chỉ'
      })
  })
type Draft = z.infer<typeof schema>
const empty: Draft = {
  merchantId: '',
  name: '',
  businessField: '',
  inheritPhone: true,
  phone: '',
  inheritAddress: true,
  address: ''
}

export default function SubMerchantFormPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const access = useScreenAccess('MERCHANT_SUB_MERCHANT')
  const edit = location.pathname.includes('/edit/')
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path
  const parentQuery = useGetHierarchyParentsQuery({ page: 1, size: 100 })
  const detailQuery = useGetSubMerchantDetailQuery(id ?? '', {
    skip: !edit || !id
  })
  const [create, createState] = useCreateSubMerchantMutation()
  const [update, updateState] = useUpdateSubMerchantMutation()
  const form = useForm<Draft>({
    resolver: zodResolver(schema),
    defaultValues: empty
  })
  const merchantId = useWatch({ control: form.control, name: 'merchantId' })
  const inheritPhone = useWatch({ control: form.control, name: 'inheritPhone' })
  const inheritAddress = useWatch({
    control: form.control,
    name: 'inheritAddress'
  })
  const parent = parentQuery.data?.content.find(
    (item) => item.id === merchantId
  )

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

  const save = async (value: Draft) => {
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
        <header className='flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
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
            <div className='grid gap-4 md:grid-cols-2'>
              <FormSelect
                control={form.control}
                name='merchantId'
                label='Merchant cha'
                disabled={edit}
                options={(parentQuery.data?.content ?? [])
                  .filter((item) => item.status === 'ACTIVE')
                  .map((item) => ({
                    label: `${item.code} — ${item.name}`,
                    value: item.id
                  }))}
                showSearch
                optionFilterProp='label'
                placeholder='Chọn Merchant cha'
              />
              <div className='rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
                {parent
                  ? `${parent.name} · ${parent.code}`
                  : 'Chọn Merchant cha để xem thông tin'}
              </div>
            </div>
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
              <FormSwitch
                control={form.control}
                name='inheritPhone'
                label='Kế thừa số điện thoại Merchant cha'
              />
              <FormSwitch
                control={form.control}
                name='inheritAddress'
                label='Kế thừa địa chỉ Merchant cha'
              />
              {!inheritPhone && (
                <FormInput
                  control={form.control}
                  name='phone'
                  label='Số điện thoại'
                  maxLength={15}
                />
              )}
              {!inheritAddress && (
                <FormTextArea
                  control={form.control}
                  name='address'
                  label='Địa chỉ'
                  maxLength={500}
                  rows={3}
                  className='md:col-span-2'
                />
              )}
            </div>
          </CardComponent>
          <div className='flex flex-wrap justify-end gap-2'>
            <ButtonComponent htmlType='button' type='default' content='Hủy' onClick={() => navigate(basePath)} />
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
