import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import type { ContentAccountWallet, DataAccountWallet } from '@type/responseAccountWallet'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { UserPickerField } from '../components/UserPickerField'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'

const frozenAccount: ContentAccountWallet = {
  id: 'wallet-user-1',
  ownerId: 'c74933eb-257a-4424-a52e-ee526f615348',
  ownerType: 'USER',
  ownerUsername: '0912345678',
  ownerFullName: 'Nguyễn Văn An',
  ekycStatus: 'VERIFIED',
  glCode: 'USER_WALLET_VND',
  currency: 'VND',
  totalDebit: 100_000,
  totalCredit: 300_000,
  balance: 200_000,
  holdBalance: 0,
  availableBalance: 200_000,
  version: 1,
  status: 'FROZEN',
  enabled: true,
  checksum: 'checksum',
  lockedReason: '',
  lockedAt: '',
  lockedBy: '',
  createdAt: '2026-09-01T08:30:00',
  updatedAt: '2026-09-02T09:30:00',
  createdBy: 'admin.cms',
  updatedBy: 'admin.cms',
  linkedBanks: []
}

const accountPage: DataAccountWallet = {
  content: [frozenAccount],
  pageable: {
    pageNumber: 0,
    pageSize: 1,
    sort: { empty: true, unsorted: true, sorted: false },
    offset: 0,
    unpaged: false,
    paged: true
  },
  last: true,
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
  first: true,
  sort: { empty: true, unsorted: true, sorted: false },
  numberOfElements: 1,
  empty: false
}

const FormHarness = () => {
  const { control } = useForm<FeeConfigFormValues>({
    defaultValues: { subjectId: frozenAccount.ownerId }
  })

  return <UserPickerField control={control} readOnly />
}

describe('UserPickerField', () => {
  it('hiển thị nhãn tiếng Việt cho trạng thái ví trả về từ API', async () => {
    server.use(
      http.get('*/wallet/accounts', () =>
        HttpResponse.json({
          data: accountPage,
          message: 'success',
          success: true,
          status: '1000'
        })
      )
    )

    renderWithProviders(<FormHarness />)

    expect(await screen.findByText('Đóng băng')).toBeInTheDocument()
    expect(screen.queryByText('FROZEN')).not.toBeInTheDocument()
  })
})
