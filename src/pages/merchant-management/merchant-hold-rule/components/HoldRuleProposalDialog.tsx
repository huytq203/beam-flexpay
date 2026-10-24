import dayjs from 'dayjs'
import { DateInput, DialogModal, TextArea } from '@components/index'
import { LEVEL_LABEL, MAX_REASON_LENGTH } from '../constants/holdRule.constants'
import { useHoldRuleProposal } from '../hooks/useHoldRuleProposal'
import type { HoldRulePolicy, HoldRuleTarget } from '../types/holdRule.types'
import { resolveValue, visibleKeys } from '../utils/holdRuleFields.utils'
import { HoldRuleFieldRow } from './HoldRuleFieldRow'

interface HoldRuleProposalDialogProps {
  target: HoldRuleTarget
  targetName?: string
  policy?: HoldRulePolicy
  onClose: () => void
}

export function HoldRuleProposalDialog({
  target,
  targetName,
  policy,
  onClose
}: HoldRuleProposalDialogProps) {
  const form = useHoldRuleProposal(target, policy, onClose)
  const { draft } = form

  return (
    <DialogModal
      open
      title={`Đề xuất quy tắc tạm giữ: ${targetName ?? LEVEL_LABEL[target.level]}`}
      okText='Gửi đề xuất'
      okButtonProps={{ loading: form.isLoading }}
      onCancel={onClose}
      onOk={() => void form.submit()}
      width={820}
    >
      <div className='flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1'>
        <p className='text-xs text-muted-foreground'>
          Chỉ các tham số tích chọn &quot;Đặt riêng&quot; mới được gửi; tham số
          còn lại kế thừa cấp trên (Hệ thống, rồi Master, rồi Sub). Đề xuất chỉ
          có hiệu lực sau khi được duyệt, và mỗi đối tượng chỉ có một đề xuất
          chờ duyệt.
        </p>
        {form.errors.config && (
          <p
            className='text-sm text-danger-strong'
            role='alert'
          >
            {form.errors.config}
          </p>
        )}
        <div>
          {visibleKeys(draft, policy).map((key) => (
            <HoldRuleFieldRow
              key={key}
              error={form.errors[key]}
              fieldKey={key}
              level={target.level}
              onChange={(value) => form.setValue(key, value)}
              onToggle={(own) => form.setOwn(key, own)}
              own={draft.own.includes(key)}
              policy={policy}
              value={resolveValue(key, draft, policy)}
            />
          ))}
        </div>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='hold-rule-active-from'
          >
            Ngày bắt đầu hiệu lực (giờ Việt Nam)
          </label>
          <DateInput
            allowClear
            className='w-full md:w-64'
            disabledDate={(current) => current.isBefore(dayjs(), 'day')}
            format='DD/MM/YYYY'
            id='hold-rule-active-from'
            onChange={(date) => form.setActiveFrom(date?.format('YYYY-MM-DD'))}
            placeholder='Để trống = ngay khi duyệt'
            value={form.activeFrom ? dayjs(form.activeFrom) : null}
          />
          {form.activeFromError && (
            <p
              className='mt-1 text-xs text-danger-strong'
              role='alert'
            >
              {form.activeFromError}
            </p>
          )}
        </div>
        <div>
          <TextArea
            aria-label='Lý do thay đổi'
            maxLength={MAX_REASON_LENGTH}
            onChange={(event) => form.setReason(event.target.value)}
            placeholder='Lý do thay đổi (tối thiểu 10 ký tự)'
            rows={3}
            status={form.reasonError ? 'error' : undefined}
            value={form.reason}
          />
          {form.reasonError && (
            <p
              className='mt-1 text-xs text-danger-strong'
              role='alert'
            >
              {form.reasonError}
            </p>
          )}
        </div>
      </div>
    </DialogModal>
  )
}
