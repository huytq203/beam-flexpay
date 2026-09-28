import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { SCREENS, useScreenAccess } from '@/app/permissions'
import {
  useCreateTerminalApiMutation,
  useGetTerminalDetailQuery,
  useUpdateTerminalApiMutation,
  type ApiSubMerchantSummary
} from '@/app/services/merchantHierarchyApi'
import { ArrowLeftOutlined, SaveOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  feedback,
  type PickedEntity
} from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { TerminalApiFormFields } from '../components/TerminalApiFormFields'
import {
  terminalApiSchema,
  type TerminalApiDraft
} from '../schemas/terminalApi.schema'

export default function TerminalFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const edit = Boolean(id)
  const basePath = SCREENS.MERCHANT_TERMINAL.path
  const access = useScreenAccess('MERCHANT_TERMINAL')
  const detail = useGetTerminalDetailQuery(id ?? '', { skip: !id })
  const source = detail.data
  const [pickedMaster, setPickedMaster] = useState<PickedEntity>()
  const [pickedSub, setPickedSub] = useState<ApiSubMerchantSummary>()
  const [create, createState] = useCreateTerminalApiMutation()
  const [update, updateState] = useUpdateTerminalApiMutation()
  const form = useForm<TerminalApiDraft>({
    resolver: zodResolver(terminalApiSchema),
    defaultValues: {
      merchantId: '',
      subMerchantId: '',
      name: '',
      terminalType: 'QR',
      address: '',
      contactPerson: '',
      inheritContactPhone: true,
      contactPhone: '',
      note: ''
    }
  })
  const terminalType = useWatch({ control: form.control, name: 'terminalType' })
  const inheritContactPhone = useWatch({
    control: form.control,
    name: 'inheritContactPhone'
  })
  const { reset } = form

  useEffect(() => {
    if (!source) return
    reset({
      merchantId: source.merchantId,
      subMerchantId: source.subMerchantId,
      name: source.name,
      terminalType: source.terminalType,
      address: source.address ?? '',
      contactPerson: source.contactPerson ?? '',
      inheritContactPhone: source.contactPhone?.inherited ?? true,
      contactPhone: source.contactPhone?.value ?? '',
      note: source.note ?? ''
    })
  }, [source, reset])

  // Sửa không cho đổi đơn vị quản lý, nên nhãn lấy thẳng từ bản ghi đang mở.
  const master: PickedEntity | undefined = source
    ? {
        id: source.merchantId,
        code: source.merchantCode ?? source.merchantId,
        name: source.merchantName ?? 'Master Merchant'
      }
    : pickedMaster
  const sub: PickedEntity | undefined = source
    ? {
        id: source.subMerchantId,
        code: source.subMerchantCode ?? source.subMerchantId,
        name: source.subMerchantName ?? 'Sub-merchant'
      }
    : pickedSub

  if (!access.can(edit ? 'edit' : 'create'))
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  const save = async (value: TerminalApiDraft) => {
    try {
      const body = {
        subMerchantId: value.subMerchantId,
        name: value.name.trim(),
        terminalType: value.terminalType,
        address:
          value.terminalType === 'ONLINE' && !edit
            ? undefined
            : value.address.trim() || undefined,
        inheritContactPhone: value.inheritContactPhone,
        contactPhone: value.inheritContactPhone
          ? undefined
          : value.contactPhone.trim(),
        contactPerson: value.contactPerson.trim() || undefined,
        note: value.note.trim() || undefined
      }
      if (edit && id) {
        const result = await update({ id, body }).unwrap()
        if (result.typeChangeWarning) feedback.warning(result.typeChangeWarning)
      } else await create(body).unwrap()
      feedback.success(edit ? 'Đã cập nhật Terminal' : 'Đã tạo Terminal')
      navigate(basePath)
    } catch {
      feedback.error('Không thể lưu Terminal')
    }
  }

  return (
    <main className='mx-auto flex w-full  min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <ButtonComponent
              aria-label='Quay lại'
              type='default'
              size='small'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(basePath)}
            />
            <div>
              <h1 className='text-lg font-semibold text-foreground'>
                {edit ? 'Cập nhật Terminal' : 'Thêm Terminal'}
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Thiết lập điểm chấp nhận thanh toán trực thuộc Sub-merchant
              </p>
            </div>
          </div>
          {(!edit || source) && (
            <ButtonComponent
              form='terminal-api-form'
              htmlType='submit'
              icon={<SaveOutlined />}
              loading={createState.isLoading || updateState.isLoading}
              content={edit ? 'Lưu thay đổi' : 'Thêm Terminal'}
            />
          )}
        </header>
      </CardComponent>
      {edit && detail.isLoading && (
        <CardComponent>
          <div
            role='status'
            className='text-sm text-muted-foreground'
          >
            Đang tải Terminal…
          </div>
        </CardComponent>
      )}
      {edit && detail.isError && (
        <CardComponent>
          <div
            role='alert'
            className='flex items-center gap-3 text-sm text-muted-foreground'
          >
            Không tải được Terminal.{' '}
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void detail.refetch()}
            />
          </div>
        </CardComponent>
      )}
      {(!edit || source) && (
        <form
          id='terminal-api-form'
          onSubmit={form.handleSubmit(save)}
          noValidate
        >
          <TerminalApiFormFields
            form={form}
            edit={edit}
            source={source}
            terminalType={terminalType}
            inheritContactPhone={inheritContactPhone}
            master={master}
            sub={sub}
            inheritedPhone={pickedSub?.phone?.value}
            onPickMaster={setPickedMaster}
            onPickSub={setPickedSub}
          />
        </form>
      )}
    </main>
  )
}
