import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { Can } from '@/app/permissions'
import { useProposeWithdrawalLimitMutation } from '@/app/services/merchantLimitApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { FormInputNumber, FormTextArea } from '@components/form'
import { ButtonComponent, feedback } from '@components/index'
import { LIMIT_FIELD_LABEL } from '../constants/withdrawalLimit.constants'
import {
  limitOutcomeMessage,
  normalizeLimitForm,
  toLimitRequest
} from '../dto/withdrawalLimit.dto'
import {
  withdrawalLimitSchema,
  type WithdrawalLimitForm as LimitFormValues
} from '../schemas/withdrawalLimit.schema'
import type { LimitLevel } from '../types/withdrawalLimit.types'

interface WithdrawalLimitFormProps {
  level: LimitLevel
  targetId?: string
}

const resolver: Resolver<LimitFormValues> = (values, context, options) =>
  zodResolver(withdrawalLimitSchema)(
    normalizeLimitForm(values),
    context,
    options
  )

const MONEY_FIELDS = [
  'minimumWithdrawalAmount',
  'maximumWithdrawalAmount',
  'dailyWithdrawalLimit',
  'autoApprovalThreshold'
] as const

export function WithdrawalLimitForm({
  level,
  targetId
}: WithdrawalLimitFormProps) {
  const [propose, { isLoading }] = useProposeWithdrawalLimitMutation()
  const form = useForm<LimitFormValues>({
    resolver,
    defaultValues: {
      targetLevel: level,
      targetId: targetId ?? '',
      activeFrom: new Date().toISOString(),
      reason: ''
    }
  })

  useEffect(() => {
    form.setValue('targetLevel', level)
    form.setValue('targetId', targetId ?? '')
  }, [level, targetId, form])

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await propose(
        toLimitRequest({ ...values, activeFrom: new Date().toISOString() })
      ).unwrap()
      feedback.success(limitOutcomeMessage(result.approvalStatus))
      form.reset({
        targetLevel: level,
        targetId: targetId ?? '',
        activeFrom: new Date().toISOString(),
        reason: ''
      })
    } catch (error) {
      feedback.error(getApiErrorDetail(error, 'Không thể gửi đề xuất hạn mức'))
    }
  })

  return (
    <Can
      screen='MERCHANT_WITHDRAWAL_LIMIT'
      action='update'
    >
      <form
        className='grid grid-cols-12 gap-4'
        noValidate
        onSubmit={(event) => void submit(event)}
      >
        {MONEY_FIELDS.map((name) => (
          <FormInputNumber
            key={name}
            allowEmpty
            className='col-span-12 flex flex-col md:col-span-6'
            control={form.control}
            label={LIMIT_FIELD_LABEL[name]}
            min={0}
            name={name}
            precision={0}
            style={{ width: '100%' }}
          />
        ))}
        <FormInputNumber
          allowEmpty
          className='col-span-12 flex flex-col md:col-span-6'
          control={form.control}
          label={LIMIT_FIELD_LABEL.maximumDailyWithdrawalCount}
          name='maximumDailyWithdrawalCount'
          style={{ width: '100%' }}
        />
        <FormTextArea
          className='col-span-12 flex flex-col'
          control={form.control}
          label='Lý do'
          name='reason'
          rows={2}
        />
        <div className='col-span-12 flex justify-end'>
          <ButtonComponent
            content='Gửi đề xuất'
            htmlType='submit'
            loading={isLoading}
          />
        </div>
      </form>
    </Can>
  )
}
