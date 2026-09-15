import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { useGetApplicableFeeRulesQuery } from '@services/apiApplicableFeeRule'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { SubjectSegmentCard } from '../SubjectSegmentCard'

const emptyRulePage = {
  content: [],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true }
  },
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
  sort: { empty: true, sorted: false, unsorted: true }
}

const ApplicableRulesSubscription = () => {
  useGetApplicableFeeRulesQuery({
    subjectType: 'USER',
    subjectId: 'user-123',
    page: 1,
    size: 10
  })
  return null
}

describe('SubjectSegmentCard', () => {
  it('dùng subjectType MERCHANT và id merchant khi đọc phân khúc', async () => {
    let subjectRequestPath = ''
    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get(
        '*/fee/customer-segments/subjects/MERCHANT/merchant-123',
        ({ request }) => {
          subjectRequestPath = new URL(request.url).pathname
          return HttpResponse.json({ data: null })
        }
      )
    )

    renderWithProviders(
      <SubjectSegmentCard
        subjectType='MERCHANT'
        subjectId='merchant-123'
      />
    )

    await waitFor(() =>
      expect(subjectRequestPath).toMatch(
        /\/fee\/customer-segments\/subjects\/MERCHANT\/merchant-123$/
      )
    )
  })

  it('tải lại quy tắc phí đang áp dụng sau khi đổi phân khúc', async () => {
    let applicableRuleRequests = 0

    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({
          data: [
            { code: 'VIP', name: 'Khách VIP', status: 'ACTIVE' },
            { code: 'STANDARD', name: 'Khách thường', status: 'ACTIVE' }
          ]
        })
      ),
      http.get(
        '*/fee/customer-segments/subjects/USER/user-123',
        () =>
          HttpResponse.json({
            data: {
              subjectType: 'USER',
              subjectId: 'user-123',
              segmentCode: 'VIP'
            }
          })
      ),
      http.put(
        '*/fee/customer-segments/subjects/USER/user-123',
        () =>
          HttpResponse.json({
            data: {
              subjectType: 'USER',
              subjectId: 'user-123',
              segmentCode: 'STANDARD'
            }
          })
      ),
      http.get('*/fee/applicable-rules', () => {
        applicableRuleRequests += 1
        return HttpResponse.json({ data: emptyRulePage })
      })
    )

    renderWithProviders(
      <>
        <SubjectSegmentCard subjectId='user-123' />
        <ApplicableRulesSubscription />
      </>
    )

    await waitFor(() => expect(applicableRuleRequests).toBe(1))

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Khách thường (STANDARD)'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Lưu phân khúc' })
    )

    await waitFor(() => expect(applicableRuleRequests).toBeGreaterThan(1))
  })
})
