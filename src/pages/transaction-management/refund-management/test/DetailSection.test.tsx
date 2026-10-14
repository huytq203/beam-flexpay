import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetailSection } from '../components/DetailSection'

describe('DetailSection', () => {
  it('renders an optional note below its title', () => {
    render(
      <DetailSection title='Tài khoản thụ hưởng' note='Số tài khoản được che.'>
        <div>Nội dung</div>
      </DetailSection>
    )

    expect(screen.getByText('Số tài khoản được che.')).toBeInTheDocument()
  })
})
