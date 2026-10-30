import { zodResolver } from '@hookform/resolvers/zod'
import type { Dayjs } from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useGetSubMerchantPageQuery } from '@/app/services/merchantHierarchyApi'
import { useGetEscrowOverviewQuery } from '@/app/services/merchantEscrowApi'
import {
  FormDatePicker,
  FormInput,
  FormInputNumber,
  FormRadio,
  FormSelect,
  FormTextArea
} from '@components/form'
import { ButtonComponent, DialogModal, Input } from '@components/index'
import { formatCurrency } from '@utils/formatNumber'
import { CredentialFormError } from '../../merchant-gateway/key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../merchant-gateway/key-connection/components/CredentialOtpDialog'
import {
  ESCROW_SOURCE_LABEL,
  ESCROW_STATE_LABEL
} from '../constants/merchantEscrow.constants'
import { useEscrowOrderCreate } from '../hooks/useEscrowOrderCreate'
import type {
  EscrowOrderImpact,
  EscrowOverview,
  EscrowSource
} from '../types/merchantEscrow.types'
import {
  CREATE_ORDER_LABEL,
  createEscrowOrderSchema,
  createOrderBlockReason,
  defaultEscrowOrderValues,
  ESCROW_ORDER_NOTE_MAX,
  overfundOf,
  todayInVietnam,
  type EscrowOrderFormValues
} from '../utils/escrowOrder.schema'
import { EscrowEvidenceUpload } from './EscrowEvidenceUpload'

// Tiền là số nguyên VND, tối đa 15 chữ số (STT 4/10): không cho phần thập phân, hiện dấu chấm nghìn.
const MONEY_PROPS = {
  allowEmpty: true,
  thousandSeparator: true,
  precision: 0,
  min: 0,
  maxLength: 19,
  className: 'flex flex-col'
} as const

/** Danh sách Sub một lần tải; Master có quá 100 Sub đang hoạt động là ngoài thực tế vận hành hiện tại. */
const SUB_PAGE_SIZE = 100

interface EscrowOrderCreateDialogProps {
  open: boolean
  masterId: string
  /** "Mã - Tên" của Master, hiện ở ô Master đã khóa (STT 1). */
  masterLabel: string
  onClose: () => void
}

/**
 * Khóa so sánh giá trị form. Chứng từ chỉ lấy tham chiếu đã tải (`response`) và trạng thái, vì đối
 * tượng `File` không tuần tự hóa được và không đổi nội dung lệnh.
 */
const snapshotKey = (
  values: object & {
    documents?: readonly {
      uid?: string
      status?: string
      response?: { fileRef?: string }
    }[]
  }
): string =>
  JSON.stringify({
    ...values,
    documents: (values.documents ?? []).map((file) => [
      file.uid,
      file.status,
      file.response?.fileRef
    ])
  })

/** Một dòng "nhãn: số tiền" của info box và bảng tóm tắt. */
const Row = ({ label, value }: { label: string; value: string }) => (
  <tr>
    <th
      scope='row'
      className='py-1 pr-4 text-left font-normal text-muted-foreground'
    >
      {label}
    </th>
    <td className='py-1 text-right font-medium tabular-nums'>{value}</td>
  </tr>
)

const moneyOrDash = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : formatCurrency(value)

/** STT 2: tình trạng ký quỹ hiện tại. Số dư null là "chưa đọc được", không bao giờ hiện 0 ₫. */
function StandingInfo({ overview }: { overview: EscrowOverview }) {
  const unknown = overview.state === 'UNKNOWN' || overview.balance === null
  const money = (value: number | null) =>
    unknown ? ESCROW_STATE_LABEL.UNKNOWN : moneyOrDash(value)
  return (
    <section
      aria-label='Tình trạng ký quỹ hiện tại'
      className='rounded-lg border border-border bg-muted/40 p-3 text-sm'
    >
      <table className='w-full'>
        <tbody>
          <Row
            label='Mức yêu cầu'
            value={formatCurrency(overview.requiredAmount)}
          />
          <Row
            label='Số dư ký quỹ hiện có'
            value={money(overview.balance)}
          />
          <Row
            label='Phần còn thiếu'
            value={money(overview.shortfall)}
          />
        </tbody>
      </table>
    </section>
  )
}

/** STT 13: nội dung người phê duyệt sẽ thấy, lấy từ kết quả xem trước của BE. */
function OrderSummary({
  impact,
  source,
  amount
}: {
  impact: EscrowOrderImpact
  source: EscrowSource
  amount: number | null
}) {
  const subAfter =
    impact.subAvailable === null || amount === null
      ? null
      : impact.subAvailable - amount
  return (
    <section className='flex flex-col gap-2 rounded-lg border border-border p-3 text-sm'>
      <table
        aria-label='Tóm tắt lệnh'
        className='w-full'
      >
        <caption className='mb-1 text-left font-semibold'>Tóm tắt lệnh</caption>
        <tbody>
          <Row
            label='Nguồn tiền'
            value={ESCROW_SOURCE_LABEL[source]}
          />
          <Row
            label='Số tiền'
            value={moneyOrDash(amount)}
          />
          <Row
            label='Số dư ký quỹ trước duyệt'
            value={moneyOrDash(impact.balanceBefore)}
          />
          <Row
            label='Số dư ký quỹ sau duyệt'
            value={moneyOrDash(impact.balanceAfter)}
          />
          <Row
            label='Phần còn thiếu sau duyệt'
            value={moneyOrDash(impact.shortfallAfter)}
          />
          {(impact.surplusAfter ?? 0) > 0 && (
            <Row
              label='Ký quỹ dư sau duyệt'
              value={moneyOrDash(impact.surplusAfter)}
            />
          )}
          {/* STT 11: số dư khả dụng của Sub trước/sau chỉ có sau khi BE kiểm ở bước xem trước. */}
          {source === 'SUB_REVENUE' && impact.subAvailable !== null && (
            <>
              <Row
                label='Số dư khả dụng của Sub trước khi trích'
                value={moneyOrDash(impact.subAvailable)}
              />
              <Row
                label='Số dư khả dụng của Sub sau khi trích'
                value={moneyOrDash(subAfter)}
              />
            </>
          )}
        </tbody>
      </table>
      {impact.blockers.length > 0 && (
        <ul
          role='alert'
          className='list-disc rounded-md bg-danger/10 py-2 pr-2 pl-6 text-danger-strong'
        >
          {impact.blockers.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      {impact.warnings.length > 0 && (
        <ul className='list-disc rounded-md bg-warning/10 py-2 pr-2 pl-6 text-warning-strong'>
          {impact.warnings.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Màn tạo lệnh nạp ký quỹ (SRS 3.6.27), mở từ dòng danh sách hoặc tab lệnh nạp của một Master nên
 * Master luôn điền sẵn và khóa (STT 1). Nơi gọi chỉ dựng component khi mở để mỗi lần mở là một form
 * mới và tình trạng ký quỹ được tải lại (STT 2 "cập nhật lại mỗi lần mở màn").
 */
export function EscrowOrderCreateDialog({
  open,
  masterId,
  masterLabel,
  onClose
}: EscrowOrderCreateDialogProps) {
  const overviewQuery = useGetEscrowOverviewQuery(masterId, {
    skip: !open || !masterId,
    refetchOnMountOrArgChange: true
  })
  const overview = overviewQuery.data
  const allowTransfer = overview?.current?.allowTransfer ?? false
  const shortfall = overview?.shortfall ?? null

  // Schema phụ thuộc phần còn thiếu (STT 4/12: vượt phần còn thiếu thì bắt ghi chú).
  const schema = useMemo(
    () => createEscrowOrderSchema({ shortfall }),
    [shortfall]
  )
  const form = useForm<EscrowOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultEscrowOrderValues(true)
  })
  const { preview, submit, otp, isPreviewing, previewError } =
    useEscrowOrderCreate(masterId, onClose)
  // Kết quả xem trước kèm ảnh chụp giá trị form lúc xem: sửa bất kỳ trường nào thì ảnh chụp lệch và
  // bảng tóm tắt cũ bị bỏ, phải xem trước lại mới gửi được (STT 13–14).
  const [previewed, setPreviewed] = useState<{
    key: string
    impact: EscrowOrderImpact
  } | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const values = useWatch({ control: form.control })
  const source = values.source ?? 'BANK_TRANSFER'
  const amount = values.amount ?? null
  const valuesKey = snapshotKey(values)
  const impact = previewed?.key === valuesKey ? previewed.impact : null

  // Nguồn mặc định phụ thuộc cấu hình (STT 3): chỉ biết sau khi tải tổng quan, đặt lại đúng một lần.
  const initialised = useRef(false)
  useEffect(() => {
    if (!overview || initialised.current) return
    initialised.current = true
    form.reset(defaultEscrowOrderValues(allowTransfer))
  }, [allowTransfer, form, overview])

  const subQuery = useGetSubMerchantPageQuery(
    { page: 1, size: SUB_PAGE_SIZE, merchantId: masterId, status: 'ACTIVE' },
    { skip: !open || source !== 'SUB_REVENUE' }
  )
  // STT 9: Sub bị khóa hoặc ngừng hợp tác không được chọn; lọc lại ở FE phòng BE bỏ qua tham số status.
  const subOptions = (subQuery.data?.content ?? [])
    .filter((sub) => sub.status === 'ACTIVE' && sub.merchantId === masterId)
    .map((sub) => ({ value: sub.id, label: `${sub.code} - ${sub.name}` }))

  // FR-MER-0627-01 + cấu hình: BE chỉ ràng nguồn chuyển khoản theo `allowTransfer`; trích từ Sub
  // không phụ thuộc cờ cấn trừ nên luôn hiện.
  const sourceOptions = (
    allowTransfer
      ? (['BANK_TRANSFER', 'SUB_REVENUE'] as const)
      : (['SUB_REVENUE'] as const)
  ).map((value) => ({ value, label: ESCROW_SOURCE_LABEL[value] }))

  const configured =
    overview !== undefined &&
    overview.current !== null &&
    overview.requiredAmount > 0
  const balanceUnknown =
    overview !== undefined &&
    (overview.state === 'UNKNOWN' || overview.balance === null)
  // Chưa đọc được số dư thì không tính được phần còn thiếu/ký quỹ dư; BE cũng từ chối, nên khóa luôn.
  const blocked = !configured || balanceUnknown

  const over = overfundOf(amount, shortfall)
  const surplusAfter =
    overview && overview.balance !== null && amount !== null
      ? overview.balance + amount - overview.requiredAmount
      : 0

  const openSummary = form.handleSubmit(async (submitted) => {
    const key = snapshotKey(submitted)
    const result = await preview(submitted)
    setPreviewed(result ? { key, impact: result } : null)
  })

  // Đọc `isDirty` ngay khi render: react-hook-form chỉ theo dõi trường formState đã được đọc.
  const { isDirty } = form.formState
  const requestClose = () => {
    // STT 15: có dữ liệu đã nhập thì hỏi lại; hủy không tạo lệnh và không giữ chỗ số dư Sub.
    if (isDirty) setConfirmingCancel(true)
    else onClose()
  }

  const footer = (
    <div className='flex flex-wrap justify-end gap-2'>
      <ButtonComponent
        type='default'
        htmlType='button'
        content='Hủy'
        onClick={requestClose}
      />
      <ButtonComponent
        type='default'
        htmlType='button'
        content='Xem tóm tắt lệnh'
        loading={isPreviewing}
        disabled={blocked}
        onClick={() => void openSummary()}
      />
      <ButtonComponent
        htmlType='button'
        content='Gửi phê duyệt'
        loading={otp.isPreparing}
        // STT 14: chỉ bật khi BE đã kiểm nội dung hiện tại ở bước xem trước và không có điểm chặn.
        disabled={blocked || impact === null || impact.blockers.length > 0}
        onClick={() => void submit(form.getValues())}
      />
    </div>
  )

  return (
    <DialogModal
      open={open}
      title={CREATE_ORDER_LABEL}
      onOk={() => undefined}
      onCancel={requestClose}
      footer={footer}
      width={760}
      maskClosable={false}
    >
      <form
        className='flex flex-col gap-4'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void openSummary()
        }}
      >
        <div className='flex flex-col'>
          <label
            htmlFor='escrow-order-master'
            className='font-medium'
          >
            Master Merchant
          </label>
          <Input
            id='escrow-order-master'
            value={masterLabel}
            disabled
          />
        </div>

        {overviewQuery.isError && (
          <CredentialFormError message='Không tải được tình trạng ký quỹ của Master.' />
        )}
        {overview && <StandingInfo overview={overview} />}
        {overview && !configured && (
          <CredentialFormError
            message={
              createOrderBlockReason(false, overview.requiredAmount) ?? ''
            }
          />
        )}

        {overview && configured && (
          <>
            <FormRadio
              name='source'
              control={form.control}
              label='Nguồn tiền'
              options={sourceOptions}
              className='flex flex-col'
            />

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {source === 'BANK_TRANSFER' ? (
                <>
                  <FormInputNumber
                    name='amount'
                    control={form.control}
                    label='Số tiền nạp (VND)'
                    {...MONEY_PROPS}
                  />
                  {/* SRS ghi Dropdown "tài khoản mặc định" nhưng BE chưa có danh mục tài khoản nhận của
                      đơn vị trung gian; tạm nhập tay (BE chỉ đòi không rỗng) để kế toán ghi đúng tài
                      khoản trên sao kê. Đổi sang dropdown khi BE có API danh mục. */}
                  <FormInput
                    name='receivingAccountRef'
                    control={form.control}
                    label='Tài khoản nhận'
                    placeholder='Ngân hàng và số tài khoản đã nhận tiền'
                    maxLength={100}
                    className='flex flex-col'
                  />
                  <FormInput
                    name='transferReference'
                    control={form.control}
                    label='Mã tham chiếu chuyển khoản'
                    placeholder='Mã giao dịch trên sao kê'
                    maxLength={50}
                    className='flex flex-col'
                  />
                  <FormDatePicker
                    name='creditedOn'
                    control={form.control}
                    label='Ngày ngân hàng ghi có'
                    className='flex flex-col'
                    // STT 7: không cho chọn ngày tương lai, "hôm nay" tính theo giờ Việt Nam như BE.
                    disabledDate={(day: Dayjs) =>
                      day.format('YYYY-MM-DD') > todayInVietnam()
                    }
                  />
                  <EscrowEvidenceUpload form={form} />
                </>
              ) : (
                <>
                  <FormSelect
                    name='subMerchantId'
                    control={form.control}
                    label='Sub-merchant nguồn'
                    options={subOptions}
                    loading={subQuery.isFetching}
                    showSearch
                    optionFilterProp='label'
                    placeholder='Chọn Sub-merchant đang hoạt động'
                    className='flex flex-col'
                  />
                  <FormInputNumber
                    name='amount'
                    control={form.control}
                    label='Số tiền trích (VND)'
                    {...MONEY_PROPS}
                  />
                  <p
                    role='note'
                    className='rounded-lg border border-border bg-muted/40 p-3 text-sm md:col-span-2'
                  >
                    Số tiền này bị giữ chỗ ngay khi tạo lệnh, Sub không rút được
                    phần đó trong lúc chờ phê duyệt. Lệnh bị từ chối hoặc bị hủy
                    thì phần giữ chỗ được hoàn lại. Số dư khả dụng của Sub được
                    kiểm và hiển thị ở bước xem tóm tắt.
                  </p>
                </>
              )}
            </div>

            {over > 0 && (
              <p
                role='status'
                className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-strong'
              >
                Số tiền vượt phần còn thiếu {formatCurrency(over)}: sau khi
                duyệt, ký quỹ sẽ dư {formatCurrency(surplusAfter)} so với mức
                yêu cầu. Bắt buộc nhập ghi chú.
              </p>
            )}

            <FormTextArea
              name='note'
              control={form.control}
              label={
                over > 0 ? 'Ghi chú (bắt buộc khi nạp vượt mức)' : 'Ghi chú'
              }
              rows={2}
              maxLength={ESCROW_ORDER_NOTE_MAX}
              showCount
            />

            {impact && (
              <OrderSummary
                impact={impact}
                source={source}
                amount={amount}
              />
            )}
          </>
        )}

        <CredentialFormError message={previewError || otp.formError} />
      </form>

      <CredentialOtpDialog otp={otp} />
      <DialogModal
        open={confirmingCancel}
        title='Bỏ lệnh đang nhập?'
        okText='Bỏ lệnh'
        cancelText='Tiếp tục nhập'
        zIndex={1100}
        onOk={() => {
          setConfirmingCancel(false)
          onClose()
        }}
        onCancel={() => setConfirmingCancel(false)}
      >
        <p className='text-sm'>
          Dữ liệu đã nhập sẽ bị bỏ. Lệnh chưa được tạo và không có số dư nào bị
          giữ chỗ.
        </p>
      </DialogModal>
    </DialogModal>
  )
}
