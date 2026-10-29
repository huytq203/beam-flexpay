import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance
} from 'vitest'
import { feePolicyConfigApi } from '../apiFeePolicyConfig'

const POLICY_ID = 'policy-1'

const ok = <T>(data: T) => HttpResponse.json({ data, success: true })

const mockConfig = (componentStatus = 200) =>
  server.use(
    http.get(`*/fee/policies/${POLICY_ID}`, () =>
      ok({ id: POLICY_ID, name: 'Phí nạp', status: 'INIT' })
    ),
    http.get(`*/fee/policy-components/by-policy/${POLICY_ID}`, () =>
      componentStatus === 200
        ? ok([{ id: 'c1' }, { id: 'c2' }])
        : HttpResponse.json({ message: 'Lỗi' }, { status: componentStatus })
    ),
    http.get(`*/fee/policy-assignments/by-policy/${POLICY_ID}`, () =>
      ok([{ id: 'a1' }])
    ),
    http.get('*/fee/component-tiers/by-component/:id', ({ params }) =>
      ok([{ id: `tier-${String(params.id)}` }])
    )
  )

type EmitSpy = MockInstance<typeof window.events.emit>

const loaderEvents = (spy: EmitSpy) =>
  spy.mock.calls
    .map(([name]) => name)
    .filter((name) => name === 'show-loading' || name === 'hide-loading')

describe('getFeePolicyConfig', () => {
  let emitSpy: EmitSpy

  beforeEach(() => {
    emitSpy = vi.spyOn(window.events, 'emit')
  })
  afterEach(() => emitSpy.mockRestore())

  it('gom policy, thành phần, bản gán, bậc phí và chỉ bật loader một lần', async () => {
    mockConfig()
    const store = createAppStore()

    const result = await store.dispatch(
      feePolicyConfigApi.endpoints.getFeePolicyConfig.initiate(POLICY_ID)
    )

    expect(result.data).toMatchObject({
      policy: { id: POLICY_ID },
      components: [{ id: 'c1' }, { id: 'c2' }],
      assignments: [{ id: 'a1' }],
      tiersByComponent: {
        c1: [{ id: 'tier-c1' }],
        c2: [{ id: 'tier-c2' }]
      }
    })
    expect(loaderEvents(emitSpy)).toEqual(['show-loading', 'hide-loading'])
  })

  it('trả về một lỗi và vẫn tắt loader khi một request con hỏng', async () => {
    mockConfig(500)
    const store = createAppStore()

    const result = await store.dispatch(
      feePolicyConfigApi.endpoints.getFeePolicyConfig.initiate(POLICY_ID)
    )

    expect(result.error).toMatchObject({ status: 500 })
    expect(loaderEvents(emitSpy)).toEqual(['show-loading', 'hide-loading'])
  })
})
