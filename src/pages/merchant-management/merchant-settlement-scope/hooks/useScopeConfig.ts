import { useEffect, useMemo, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  useGetMasterSettlementConfigQuery,
  useGetSystemSettlementConfigQuery,
  useUpdateMasterSettlementConfigMutation,
  useUpdateSystemSettlementConfigMutation
} from '@/app/services/merchantSettlementScopeApi'
import { feedback } from '@components/index'
import {
  createScopeConfigSchema,
  type ScopeConfigForm
} from '../schemas/scopeConfig.schema'
import {
  EMPTY_SCOPE_FORM,
  buildScopeBody,
  getScopeErrorMessage,
  toScopeForm
} from '../utils/settlementScope.utils'

/** `masterId` undefined = cấp Hệ thống; có giá trị = khối riêng của Master đó. */
export const useScopeConfig = (masterId?: string) => {
  const isSystem = masterId === undefined
  const system = useGetSystemSettlementConfigQuery(undefined, {
    skip: !isSystem
  })
  const master = useGetMasterSettlementConfigQuery(masterId ?? '', {
    skip: isSystem
  })
  const query = isSystem ? system : master
  const [updateMaster, masterState] = useUpdateMasterSettlementConfigMutation()
  const [updateSystem, systemState] = useUpdateSystemSettlementConfigMutation()
  const schema = useMemo(() => createScopeConfigSchema(isSystem), [isSystem])
  const form = useForm<ScopeConfigForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_SCOPE_FORM
  })

  // Refetch không được xóa nội dung người dùng đang nhập.
  const isDirtyRef = useRef(false)
  const { isDirty } = form.formState
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])
  useEffect(() => {
    if (query.data && !isDirtyRef.current) form.reset(toScopeForm(query.data))
  }, [query.data, form])

  const submit = form.handleSubmit(async (values) => {
    const view = query.data
    if (!view) return
    const body = buildScopeBody(values, view, isSystem)
    try {
      const result = isSystem
        ? await updateSystem(body).unwrap()
        : await updateMaster({ id: masterId, body }).unwrap()
      feedback.success(
        isSystem
          ? 'Đã cập nhật mặc định quyết toán của hệ thống'
          : 'Đã lưu cấu hình quyết toán của Master'
      )
      form.reset(toScopeForm(result))
    } catch (error) {
      feedback.error(
        getScopeErrorMessage(error, 'Không thể lưu cấu hình quyết toán')
      )
    }
  })

  return {
    query,
    form,
    submit,
    isSystem,
    isSaving: masterState.isLoading || systemState.isLoading
  }
}
