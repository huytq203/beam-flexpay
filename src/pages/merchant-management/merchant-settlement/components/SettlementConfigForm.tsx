import { useWatch } from 'react-hook-form'
import { Can } from '@/app/permissions'
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
} from '../constants/settlementConfig.constants'
import { useSettlementConfig } from '../hooks/useSettlementConfig'
import { EffectiveConfigSummary } from './EffectiveConfigSummary'

interface SettlementConfigFormProps {
  subId: string
}

export function SettlementConfigForm({ subId }: SettlementConfigFormProps) {
  const { query, form, submit, isSaving } = useSettlementConfig(subId)
  const inherit = useWatch({ control: form.control, name: 'inherit' })
  const mode = useWatch({ control: form.control, name: 'settlementMode' })

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

  return (
    <div className='flex flex-col gap-4'>
      <EffectiveConfigSummary config={query.data} />
      {query.data.modeChangeWarning && (
        <TagComponent color='warning'>
          {query.data.modeChangeWarning}
        </TagComponent>
      )}
      <Can
        screen='MERCHANT_SETTLEMENT_CONFIG'
        action='update'
      >
        <form
          className='grid grid-cols-12 gap-4 border-t border-border pt-4'
          noValidate
          onSubmit={(event) => void submit(event)}
        >
          <FormSwitch
            className='col-span-12'
            control={form.control}
            label='Kế thừa cấu hình của Master'
            name='inherit'
          />
          {!inherit && (
            <>
              <FormSelect
                control={form.control}
                label='Chế độ quyết toán'
                name='settlementMode'
                options={MODE_OPTIONS}
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
              {mode === 'HOLD' && (
                <FormTextArea
                  className='col-span-12 flex flex-col'
                  control={form.control}
                  label='Lý do tạm dừng'
                  name='holdReason'
                  rows={2}
                />
              )}
              <FormSwitch
                className='col-span-12'
                control={form.control}
                label='Đang áp dụng'
                name='active'
              />
            </>
          )}
          <FormTextArea
            className='col-span-12 flex flex-col'
            control={form.control}
            label='Lý do thay đổi'
            name='reason'
            rows={2}
          />
          <div className='col-span-12 flex justify-end'>
            <ButtonComponent
              content='Lưu cấu hình'
              htmlType='submit'
              loading={isSaving}
            />
          </div>
        </form>
      </Can>
    </div>
  )
}
