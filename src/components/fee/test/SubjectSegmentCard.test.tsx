import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { SubjectSegmentCard } from '../SubjectSegmentCard'

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
})
