import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { Can, useScreenAccess } from '@/app/permissions'
import {
  FormInputNumber,
  FormSelect,
  FormSwitch,
  FormTextArea
} from '@components/form'
import { ButtonComponent, TagComponent } from '@components/index'
import {
  FREQUENCY_OPTIONS,
  MODE_OPTIONS
} from '../../merchant-settlement/constants/settlementConfig.constants'
import { SYSTEM_MODE_OPTIONS } from '../constants/settlementScope.constants'
import { useScopeConfig } from '../hooks/useScopeConfig'
import { isLoosening } from '../utils/settlementScope.utils'
import { ScopeConfigSummary } from './ScopeConfigSummary'
import { ScopeRemovalDialog } from './ScopeRemovalDialog'

interface ScopeConfigPanelProps {
  /** Bỏ trống = mặc định toàn hệ thống. */
  masterId?: string
}

export function ScopeConfigPanel({ masterId }: ScopeConfigPanelProps) {
  const { query, form, submit, isSystem, isSaving } = useScopeConfig(masterId)
  const access = useScreenAccess('MERCHANT_SETTLEMENT_SCOPE')
  const [removing, setRemoving] = useState(false)
  const values = useWatch({ control: form.control })
  const mode = values.settlementMode

  if (query.isLoading)
    return <p aria-busy='true'>Đang tải cấu hình quyết toán...</p>
  if (query.isError || !query.data)
    return (
      <div role='alert'>
        <p>Không tải được cấu hình quyết toán.</p>
        <ButtonComponent
          content='Thử lại'
          htmlType='button'
          onClick={() => void query.refetch()}
        />
      </div>
    )

  const view = query.data
  const needsApprover =
    !isSystem && !access.can('approve') && isLoosening(form.getValues(), view)
  // Cấp Hệ thống đòi APPROVE; cấp Master đòi UPDATE.
  const action = isSystem ? 'approve' : 'update'

  return (
    <div className='flex flex-col gap-4'>
      <ScopeConfigSummary view={view} />
      <Can
        screen='MERCHANT_SETTLEMENT_SCOPE'
        action={action}
      >
        <form
          className='grid grid-cols-12 gap-4 border-t border-border pt-4'
          noValidate
          onSubmit={(event) => void submit(event)}
        >
          <FormSelect
            control={form.control}
            label='Chế độ quyết toán'
            name='settlementMode'
            options={isSystem ? SYSTEM_MODE_OPTIONS : MODE_OPTIONS}
            allowClear={false}
          />
          {mode === 'AUTOMATIC' && (
            <FormSelect
              control={form.control}
              label='Tần suất'
              name='autoFrequency'
              options={FREQUENCY_OPTIONS}
              allowClear={false}
            />
          )}
          <FormInputNumber
            control={form.control}
            label='T+N (ngày chờ)'
            name='holdbackDays'
            min={0}
            max={365}
          />
          {!isSystem && mode === 'HOLD' && (
            <FormTextArea
              className='col-span-12 flex flex-col'
              control={form.control}
              label='Lý do tạm dừng'
              name='holdReason'
              rows={2}
            />
          )}
          {!isSystem && (
            <FormSwitch
              className='col-span-12'
              control={form.control}
              label='Đang áp dụng khối riêng của Master'
              name='active'
            />
          )}
          <FormTextArea
            className='col-span-12 flex flex-col'
            control={form.control}
            label='Lý do thay đổi (tối thiểu 10 ký tự)'
            name='reason'
            rows={2}
          />
          {needsApprover && (
            <div className='col-span-12'>
              <TagComponent color='warning'>
                Rút ngắn T+N hoặc chuyển sang tự động cần quyền phê duyệt cấu
                hình quyết toán
              </TagComponent>
            </div>
          )}
          {isSystem && (
            <p className='col-span-12 text-xs text-muted-foreground'>
              Thay đổi áp dụng cho mọi Merchant và Sub-merchant đang kế thừa,
              chỉ cho giao dịch phát sinh sau thời điểm đổi. Mặc định hệ thống
              không có chế độ Tạm dừng.
            </p>
          )}
          <div className='col-span-12 flex justify-end gap-2'>
            {!isSystem && (
              <ButtonComponent
                content='Gỡ cấu hình riêng'
                danger
                disabled={!view.configuredAtThisLevel}
                htmlType='button'
                onClick={() => setRemoving(true)}
                type='default'
              />
            )}
            <ButtonComponent
              content={isSystem ? 'Lưu mặc định hệ thống' : 'Lưu cấu hình'}
              htmlType='submit'
              loading={isSaving}
            />
          </div>
        </form>
      </Can>
      {!isSystem && removing && masterId && (
        <ScopeRemovalDialog
          masterId={masterId}
          onClose={() => setRemoving(false)}
        />
      )}
    </div>
  )
}
