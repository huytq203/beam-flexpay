import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useGetHoldRuleEffectiveQuery } from '@/app/services/merchantHoldRuleApi'
import { ButtonComponent, TagComponent } from '@components/index'
import {
  CAP_BEHAVIOUR_HINT,
  FIELD_LABEL,
  LEVEL_LABEL
} from '../constants/holdRule.constants'
import type {
  HoldRuleKey,
  HoldRuleLevel,
  HoldRuleTarget
} from '../types/holdRule.types'
import { EMPTY_DRAFT } from '../utils/holdRuleDraft.utils'
import {
  getHoldRuleErrorMessage,
  isHoldRuleUnavailable
} from '../utils/holdRuleError.utils'
import { visibleKeys } from '../utils/holdRuleFields.utils'
import { formatHoldRuleValue } from '../utils/holdRuleFormat.utils'
import { HoldRuleProposalDialog } from './HoldRuleProposalDialog'
import { HoldRuleRemoveDialog } from './HoldRuleRemoveDialog'

interface HoldRuleEffectivePanelProps {
  target: HoldRuleTarget
  targetName?: string
}

const sourceText = (source?: HoldRuleLevel) =>
  source ? LEVEL_LABEL[source] : 'Mặc định (chưa ai đặt)'

/** Ô "Quy tắc đang áp dụng" (đã gộp kế thừa) kèm nhãn nguồn từng giá trị. */
export function HoldRuleEffectivePanel({
  target,
  targetName
}: HoldRuleEffectivePanelProps) {
  const query = useGetHoldRuleEffectiveQuery({
    masterId: target.level === 'MASTER' ? target.targetId : undefined,
    subMerchantId: target.level === 'SUB' ? target.targetId : undefined
  })
  const [proposing, setProposing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const policy = query.data
  const unavailable = isHoldRuleUnavailable(query.error)
  const rows: HoldRuleKey[] = policy
    ? visibleKeys(EMPTY_DRAFT, policy).filter(
        (key) => policy.enabled || key === 'enabled'
      )
    : []

  return (
    <section
      aria-label='Quy tắc đang áp dụng'
      className='flex flex-col gap-3'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-sm font-semibold'>Quy tắc đang áp dụng</h2>
        <div className='flex gap-2'>
          {target.level !== 'SYSTEM' && (
            <Can
              screen='MERCHANT_HOLD_RULE'
              action='delete'
            >
              <ButtonComponent
                content='Gỡ quy tắc riêng'
                danger
                htmlType='button'
                onClick={() => setRemoving(true)}
                type='default'
              />
            </Can>
          )}
          <Can
            screen='MERCHANT_HOLD_RULE'
            action='update'
          >
            <ButtonComponent
              content='Đề xuất thay đổi'
              disabled={query.isLoading || (query.isError && !unavailable)}
              htmlType='button'
              onClick={() => setProposing(true)}
            />
          </Can>
        </div>
      </div>
      {query.isLoading && (
        <p aria-busy='true'>Đang tải quy tắc đang áp dụng...</p>
      )}
      {query.isError && (
        <div role='alert'>
          <p>
            {getHoldRuleErrorMessage(
              query.error,
              'Không tải được quy tắc đang áp dụng.'
            )}
          </p>
          {unavailable && target.level === 'SYSTEM' && (
            <p className='text-sm text-muted-foreground'>
              Hãy đề xuất quy tắc mặc định hệ thống rồi duyệt để có quy tắc áp
              dụng.
            </p>
          )}
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      {policy && (
        <dl className='m-0 grid grid-cols-1 gap-x-6 md:grid-cols-2'>
          {rows.map((key) => (
            <div
              key={key}
              className='flex items-center justify-between gap-3 border-b border-border py-2'
            >
              <dt className='text-sm text-muted-foreground'>
                {FIELD_LABEL[key]}
              </dt>
              <dd
                className='m-0 flex items-center gap-2 text-right text-sm'
                title={key === 'capBehaviour' ? CAP_BEHAVIOUR_HINT : undefined}
              >
                <span>{formatHoldRuleValue(key, policy[key])}</span>
                <TagComponent>{sourceText(policy.sources?.[key])}</TagComponent>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {proposing && (
        <HoldRuleProposalDialog
          onClose={() => setProposing(false)}
          policy={policy}
          target={target}
          targetName={targetName}
        />
      )}
      {removing && (
        <HoldRuleRemoveDialog
          onClose={() => setRemoving(false)}
          target={target}
        />
      )}
    </section>
  )
}
