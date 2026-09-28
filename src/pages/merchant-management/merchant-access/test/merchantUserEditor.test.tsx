import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderPage } from './merchantAccess.setup'

// Môi trường test của antd sinh cùng một id cho mọi Modal nên tên truy cập của
// dialog lồng nhau bị trùng; tìm theo tiêu đề hiển thị thay cho role + name.
const findDialogByTitle = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByText(title, {
    selector: '.ant-modal-title'
  })
  const dialog = heading.closest('[role="dialog"]')
  if (!(dialog instanceof HTMLElement)) throw new Error(`Không thấy ${title}`)
  return dialog
}

// Luồng đi qua 3 dialog lồng nhau và gõ nhiều ô nên vượt mốc 5s mặc định của jsdom.
const LONG_FLOW_TIMEOUT = 15_000

describe('Merchant User — chọn Merchant qua dialog', () => {
  it(
    'chọn nhiều Merchant và Sub-merchant qua dialog phân trang rồi tạo User đúng payload',
    async () => {
      const user = userEvent.setup()
      let createdBody: unknown
      const groupRequests: URL[] = []
      server.use(
        http.get('*/merchant-permission-groups', ({ request }) => {
          groupRequests.push(new URL(request.url))
          return undefined
        }),
        http.post('*/merchant-users', async ({ request }) => {
          createdBody = await request.json()
          return HttpResponse.json({ data: { id: 'user-new' } })
        })
      )
      renderPage('/secure-panel/merchant/user')

      await user.click(screen.getByRole('button', { name: 'Thêm mới User' }))
      const editor = await findDialogByTitle('Thêm mới User')
      await user.type(within(editor).getByLabelText(/Họ và tên/), 'Trần Minh')
      await user.type(within(editor).getByLabelText(/Email/), 'minh@hlc.vn')
      await user.type(
        within(editor).getByLabelText(/Số điện thoại/),
        '0912345678'
      )
      expect(
        within(editor).getByRole('button', { name: 'Chọn Sub-merchant' })
      ).toBeDisabled()

      await user.click(
        within(editor).getByRole('button', { name: 'Chọn Merchant' })
      )
      const merchantPicker = await findDialogByTitle('Chọn Merchant quản lý')
      await within(merchantPicker).findByText('Highlands Coffee')
      await user.click(within(merchantPicker).getAllByRole('checkbox')[1])
      expect(
        within(merchantPicker).getByText('Đã chọn 1 Merchant')
      ).toBeInTheDocument()
      await user.click(
        within(merchantPicker).getByRole('button', { name: 'Xác nhận' })
      )
      expect(
        await within(editor).findByText('MC000142 — Highlands Coffee')
      ).toBeInTheDocument()

      await user.click(
        within(editor).getByRole('button', { name: 'Chọn nhóm quyền' })
      )
      const groupPicker = await findDialogByTitle('Chọn nhóm quyền')
      await within(groupPicker).findByText('Quản trị Merchant')
      expect(groupRequests.at(-1)?.searchParams.get('merchantId')).toBe(
        'merchant-0142'
      )
      expect(groupRequests.at(-1)?.searchParams.get('systemOnly')).toBeNull()
      const [, ...groupBoxes] = within(groupPicker).getAllByRole('checkbox')
      for (const box of groupBoxes) await user.click(box)
      await user.click(
        within(groupPicker).getByRole('button', { name: 'Xác nhận' })
      )
      expect(
        await within(editor).findByText('ADMIN — Quản trị Merchant')
      ).toBeInTheDocument()

      await user.click(
        within(editor).getByRole('button', { name: 'Chọn Sub-merchant' })
      )
      const subPicker = await findDialogByTitle('Chọn Sub-merchant')
      await within(subPicker).findByText('HLC Miền Bắc')
      await user.click(within(subPicker).getAllByRole('checkbox')[1])
      await user.click(
        within(subPicker).getByRole('button', { name: 'Xác nhận' })
      )

      await user.click(
        within(editor).getByRole('button', { name: 'Thêm User' })
      )
      await waitFor(() =>
        expect(createdBody).toMatchObject({
          merchantIds: ['merchant-0142'],
          groupIds: ['role-admin', 'role-viewer'],
          subMerchantIds: ['sub-hlc-north']
        })
      )
    },
    LONG_FLOW_TIMEOUT
  )

  it(
    'gỡ Merchant thì bỏ Sub-merchant và nhóm riêng, giữ nhóm dùng chung',
    async () => {
      const user = userEvent.setup()
      renderPage('/secure-panel/merchant/user')

      await user.click(screen.getByRole('button', { name: 'Thêm mới User' }))
      const editor = await findDialogByTitle('Thêm mới User')
      await user.click(
        within(editor).getByRole('button', { name: 'Chọn Merchant' })
      )
      const picker = await findDialogByTitle('Chọn Merchant quản lý')
      await within(picker).findByText('Highlands Coffee')
      await user.click(within(picker).getAllByRole('checkbox')[1])
      await user.click(within(picker).getByRole('button', { name: 'Xác nhận' }))
      await user.click(
        within(editor).getByRole('button', { name: 'Chọn nhóm quyền' })
      )
      const groupPicker = await findDialogByTitle('Chọn nhóm quyền')
      await within(groupPicker).findByText('Quản trị Merchant')
      const [, ...groupBoxes] = within(groupPicker).getAllByRole('checkbox')
      for (const box of groupBoxes) await user.click(box)
      await user.click(
        within(groupPicker).getByRole('button', { name: 'Xác nhận' })
      )
      await within(editor).findByText('ADMIN — Quản trị Merchant')
      await user.click(
        await within(editor).findByRole('button', {
          name: 'Gỡ Merchant Highlands Coffee'
        })
      )

      expect(within(editor).getByText('Chưa chọn Merchant')).toBeInTheDocument()
      expect(
        within(editor).queryByText('ADMIN — Quản trị Merchant')
      ).not.toBeInTheDocument()
      expect(
        within(editor).getByText('VIEWER — Chỉ xem báo cáo')
      ).toBeInTheDocument()
      expect(
        within(editor).getByRole('button', { name: 'Chọn Sub-merchant' })
      ).toBeDisabled()
    },
    LONG_FLOW_TIMEOUT
  )

  it('chưa chọn Merchant thì chỉ tìm nhóm quyền dùng chung', async () => {
    const user = userEvent.setup()
    const groupRequests: URL[] = []
    server.use(
      http.get('*/merchant-permission-groups', ({ request }) => {
        groupRequests.push(new URL(request.url))
        return undefined
      })
    )
    renderPage('/secure-panel/merchant/user')

    await user.click(screen.getByRole('button', { name: 'Thêm mới User' }))
    const editor = await findDialogByTitle('Thêm mới User')
    await user.click(
      within(editor).getByRole('button', { name: 'Chọn nhóm quyền' })
    )
    const picker = await findDialogByTitle('Chọn nhóm quyền')
    expect(
      within(picker).getByText(
        'User quản lý nhiều Merchant chỉ dùng được nhóm quyền dùng chung.'
      )
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(groupRequests.at(-1)?.searchParams.get('systemOnly')).toBe('true')
    )
    expect(groupRequests.at(-1)?.searchParams.get('merchantId')).toBeNull()
  })
})
