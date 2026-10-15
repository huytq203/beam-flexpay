import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  useGetSubSettlementConfigQuery,
  useUpdateSubSettlementConfigMutation
} from '@/app/services/merchantSettlementApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import {
  toSettlementConfigForm,
  toUpdateBody
} from '../dto/settlementConfig.dto'
import {
  settlementConfigSchema,
  type SettlementConfigForm
} from '../schemas/settlementConfig.schema'

const EMPTY_FORM: SettlementConfigForm = {
  inherit: true,
  settlementMode: 'MANUAL_ONLY',
  autoFrequency: 'DAILY',
  holdbackDays: 0,
  holdReason: '',
  active: true,
  reason: ''
}

export const useSettlementConfig = (subId?: string) => {
  const query = useGetSubSettlementConfigQuery(subId ?? '', { skip: !subId })
  const [update, { isLoading: isSaving }] =
    useUpdateSubSettlementConfigMutation()
  const form = useForm<SettlementConfigForm>({
    resolver: zodResolver(settlementConfigSchema),
    defaultValues: EMPTY_FORM
  })

  // Refetch (vd. sau khi duyệt đề xuất ở panel khác) không được xóa nội dung đang nhập.
  const { isDirty } = form.formState
  const isDirtyRef = useRef(false)
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])
  useEffect(() => {
    if (query.data && !isDirtyRef.current)
      form.reset(toSettlementConfigForm(query.data))
  }, [query.data, form])

  const submit = form.handleSubmit(async (values) => {
    if (!subId) return
    try {
      const result = await update({
        id: subId,
        body: toUpdateBody(values)
      }).unwrap()
      const pending = Boolean(result.pendingChangeId)
      feedback.success(
        pending
          ? 'Thay đổi làm nới lỏng cấu hình nên đã gửi chờ phê duyệt; cấu hình hiện hành giữ nguyên.'
          : 'Đã áp dụng cấu hình quyết toán.'
      )
      form.reset(toSettlementConfigForm(result))
    } catch (error) {
      feedback.error(
        getApiErrorDetail(error, 'Không thể lưu cấu hình quyết toán')
      )
    }
  })

  return { query, form, submit, isSaving }
}
