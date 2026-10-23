import type { ScopeConfigView } from '../types/settlementScope.types'

export const masterView = (
  over: Partial<ScopeConfigView> = {}
): ScopeConfigView => ({
  level: 'MASTER',
  targetId: 'm-1',
  configuredAtThisLevel: true,
  active: true,
  settlementMode: { value: 'MANUAL_ONLY', source: 'MASTER' },
  autoFrequency: { value: 'DAILY', source: 'SYSTEM' },
  holdReason: { value: null, source: 'SYSTEM' },
  holdbackDays: { value: 2, source: 'MASTER' },
  ...over
})

export const systemView = (
  over: Partial<ScopeConfigView> = {}
): ScopeConfigView => ({
  level: 'SYSTEM',
  targetId: null,
  configuredAtThisLevel: true,
  active: true,
  settlementMode: { value: 'MANUAL_ONLY', source: 'SYSTEM' },
  autoFrequency: { value: 'DAILY', source: 'SYSTEM' },
  holdReason: { value: null, source: 'SYSTEM' },
  holdbackDays: { value: 3, source: 'SYSTEM' },
  ...over
})
