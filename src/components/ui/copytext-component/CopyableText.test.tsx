import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import CopyableText from './CopyableText'

describe('CopyableText', () => {
  it('exposes the copy action as a named keyboard button', () => {
    renderWithProviders(<CopyableText label='Client ID' value='hlc-production' />)

    expect(
      screen.getByRole('button', { name: 'Sao chép Client ID: hlc-production' })
    ).toBeInTheDocument()
  })
})
