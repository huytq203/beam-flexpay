import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import SegmentedComponent from '@components/ui/segmented-component'
import { SelectComponent } from '@components/ui/select-component/SelectComponent'
import Switch from '@components/ui/switch-component'
import { useCapySettings } from './hooks/useCapySettings'
import {
  ACTIVITY_LEVELS,
  SLEEP_AFTER_OPTIONS,
  SPEED_LEVELS,
  type ActivityLevel,
  type SleepAfter,
  type SpeedLevel
} from './engine/tuning'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex flex-col gap-1.5 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      {children}
    </div>
  )
}

/** Bảng cài đặt Capy: bật/tắt, chỉ đứng yên, tốc độ, độ hiếu động và thời gian chờ ngủ. Lưu theo từng người. */
export function CapySettingsPanel() {
  const { t } = useTranslation()
  const { enabled, idleOnly, speed, activity, sleepAfter, update } =
    useCapySettings()
  const level = <T extends string>(group: string, value: T) => ({
    value,
    label: t(`capy.settings.${group}.${value}`)
  })

  return (
    <div className='flex w-72 flex-col gap-3'>
      <label className='flex items-center justify-between gap-3 text-sm'>
        <span>{t('capy.toggle.switch')}</span>
        <Switch
          checked={enabled}
          onChange={(value) => update({ enabled: value })}
          aria-label={t('capy.toggle.switch')}
        />
      </label>
      <label className='flex items-center justify-between gap-3 text-sm'>
        <span>{t('capy.toggle.idleOnly')}</span>
        <Switch
          checked={idleOnly}
          disabled={!enabled}
          onChange={(value) => update({ idleOnly: value })}
          aria-label={t('capy.toggle.idleOnly')}
        />
      </label>
      <hr className='border-border' />
      <Row label={t('capy.settings.speed.label')}>
        <SegmentedComponent<SpeedLevel>
          block
          size='small'
          disabled={!enabled || idleOnly}
          value={speed}
          ariaLabel={t('capy.settings.speed.label')}
          options={SPEED_LEVELS.map((value) => level('speed', value))}
          onChange={(value) => update({ speed: value })}
        />
      </Row>
      <Row label={t('capy.settings.activity.label')}>
        <SegmentedComponent<ActivityLevel>
          block
          size='small'
          disabled={!enabled || idleOnly}
          value={activity}
          ariaLabel={t('capy.settings.activity.label')}
          options={ACTIVITY_LEVELS.map((value) => level('activity', value))}
          onChange={(value) => update({ activity: value })}
        />
      </Row>
      <Row label={t('capy.settings.sleep.label')}>
        <SelectComponent<SleepAfter>
          size='small'
          disabled={!enabled}
          value={sleepAfter}
          aria-label={t('capy.settings.sleep.label')}
          getPopupContainer={(node) => node.parentElement ?? document.body}
          options={SLEEP_AFTER_OPTIONS.map((minutes) => ({
            value: minutes,
            label:
              minutes === 0
                ? t('capy.settings.sleep.never')
                : t('capy.settings.sleep.minutes', { count: minutes })
          }))}
          onChange={(value) => update({ sleepAfter: value })}
        />
      </Row>
    </div>
  )
}
