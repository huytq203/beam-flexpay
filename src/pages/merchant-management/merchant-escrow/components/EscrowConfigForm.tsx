import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  FormCheckbox,
  FormInputNumber,
  FormSelect,
  FormTextArea
} from '@components/form'
import { ButtonComponent } from '@components/index'
import { CredentialFormError } from '../../merchant-gateway/key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../merchant-gateway/key-connection/components/CredentialOtpDialog'
import {
  ESCROW_OVERDUE_ACTION_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL,
  ESCROW_REVIEW_CYCLE_LABEL
} from '../constants/merchantEscrow.constants'
import { useEscrowConfigSave } from '../hooks/useEscrowConfigSave'
import type {
  EscrowConfig,
  EscrowConfigPreview as Preview
} from '../types/merchantEscrow.types'
import {
  ESCROW_CONFIG_MESSAGE,
  escrowConfigSchema,
  toEscrowConfigFormValues,
  type EscrowConfigFormValues
} from '../utils/escrowConfig.schema'
import { EscrowConfigPreview } from './EscrowConfigPreview'

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

const MODE_OPTIONS = toOptions(ESCROW_REQUIREMENT_MODE_LABEL)
const CYCLE_OPTIONS = toOptions(ESCROW_REVIEW_CYCLE_LABEL)
const OVERDUE_OPTIONS = toOptions(ESCROW_OVERDUE_ACTION_LABEL)

// Tiền là số nguyên VND: không cho phần thập phân, hiển thị dấu chấm nghìn.
const MONEY_PROPS = {
  allowEmpty: true,
  thousandSeparator: true,
  precision: 0,
  min: 0,
  className: 'flex flex-col'
} as const
const DAYS_PROPS = {
  allowEmpty: true,
  precision: 0,
  min: 0,
  className: 'flex flex-col'
} as const

interface EscrowConfigFormProps {
  masterId: string
  current: EscrowConfig | null
  onClose: () => void
}

/**
 * Form sửa cấu hình ký quỹ: kiểm luật ở FE → xem trước → OTP → lưu. Giá trị khởi đầu chỉ đọc
 * một lần lúc mở; khi BE trả 409 và tổng quan được tải lại, form không bị đặt lại để người dùng
 * xem bảng so sánh mới rồi lưu lại mà không phải nhập lại.
 */
export function EscrowConfigForm({
  masterId,
  current,
  onClose
}: EscrowConfigFormProps) {
  const form = useForm<EscrowConfigFormValues>({
    resolver: zodResolver(escrowConfigSchema),
    defaultValues: toEscrowConfigFormValues(current)
  })
  const { preview, save, otp, isPreviewing, previewError } =
    useEscrowConfigSave(masterId, onClose)
  const [shown, setShown] = useState<Preview | null>(null)
  const [reasonError, setReasonError] = useState('')
  const mode = useWatch({ control: form.control, name: 'requirementMode' })
  const allowSetoff = useWatch({ control: form.control, name: 'allowSetoff' })
  const reason = useWatch({ control: form.control, name: 'reason' })

  const openPreview = form.handleSubmit(async (values) => {
    setReasonError('')
    setShown(await preview(values))
  })

  const confirm = () => {
    // Giảm mức bảo đảm phải có lý do cho người duyệt; chặn trước khi tốn một mã OTP.
    if (shown?.reducesProtection && !form.getValues('reason').trim()) {
      setReasonError(ESCROW_CONFIG_MESSAGE.reason)
      return
    }
    setShown(null)
    void save(form.getValues())
  }

  return (
    <form
      className='flex flex-col gap-4'
      noValidate
      onSubmit={(event) => void openPreview(event)}
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <FormSelect
          name='requirementMode'
          control={form.control}
          label='Cách xác định mức'
          options={MODE_OPTIONS}
          allowClear={false}
          className='flex flex-col'
          required
        />
        {mode === 'AVERAGE_REVENUE' ? (
          <>
            <FormInputNumber
              name='revenueDays'
              control={form.control}
              label='Số ngày doanh thu'
              max={90}
              {...DAYS_PROPS}
            />
            <FormInputNumber
              name='minAmount'
              control={form.control}
              label='Mức tối thiểu (VND)'
              {...MONEY_PROPS}
            />
            <FormInputNumber
              name='maxAmount'
              control={form.control}
              label='Mức tối đa (VND)'
              {...MONEY_PROPS}
            />
            <FormSelect
              name='reviewCycle'
              control={form.control}
              label='Chu kỳ soát xét'
              options={CYCLE_OPTIONS}
              allowClear={false}
              className='flex flex-col'
              required
            />
          </>
        ) : (
          <FormInputNumber
            name='fixedAmount'
            control={form.control}
            label='Mức ký quỹ yêu cầu (VND)'
            {...MONEY_PROPS}
          />
        )}
        <FormInputNumber
          name='deadlineDays'
          control={form.control}
          label='Thời hạn phải đủ ký quỹ (ngày)'
          max={365}
          {...DAYS_PROPS}
        />
        <FormInputNumber
          name='reminderDays'
          control={form.control}
          label='Cảnh báo trước hạn (ngày)'
          {...DAYS_PROPS}
        />
        <FormSelect
          name='overdueAction'
          control={form.control}
          label='Xử lý khi quá hạn'
          options={OVERDUE_OPTIONS}
          allowClear={false}
          className='flex flex-col'
          required
        />
      </div>

      <div className='flex flex-col gap-2'>
        <FormCheckbox
          name='allowTransfer'
          control={form.control}
          label='Cho phép nạp bằng chuyển khoản'
        />
        <FormCheckbox
          name='allowSetoff'
          control={form.control}
          label='Cho phép cấn trừ tại lệnh rút'
        />
        {allowSetoff && (
          <FormCheckbox
            name='setoffAcknowledged'
            control={form.control}
            label='Đã đọc cảnh báo hệ quả của việc cấn trừ tại lệnh rút'
          />
        )}
      </div>

      <FormTextArea
        name='reason'
        control={form.control}
        label='Lý do thay đổi (bắt buộc khi giảm mức bảo đảm)'
        rows={2}
      />

      <CredentialFormError message={previewError || otp.formError} />

      <div className='flex justify-end gap-2'>
        <ButtonComponent
          type='default'
          htmlType='button'
          content='Hủy'
          onClick={onClose}
        />
        <ButtonComponent
          htmlType='submit'
          content='Xem trước và lưu'
          loading={isPreviewing}
        />
      </div>

      <EscrowConfigPreview
        preview={shown}
        reason={reason}
        reasonError={reasonError}
        confirmLoading={otp.isPreparing}
        onReasonChange={(value) => {
          form.setValue('reason', value)
          if (reasonError) setReasonError('')
        }}
        onConfirm={confirm}
        onCancel={() => setShown(null)}
      />
      <CredentialOtpDialog otp={otp} />
    </form>
  )
}
