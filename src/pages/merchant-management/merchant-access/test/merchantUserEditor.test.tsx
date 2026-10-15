import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'
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

describe('Merchant User — tạo User', () => {
  it(
    'tạo User chỉ chọn Merchant, không gán nhóm quyền hay Sub-merchant ở bước tạo',
    async () => {
      const user = userEvent.setup()
      let createdBody: unknown
      server.use(
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
        within(editor).queryByRole('button', { name: 'Chọn nhóm quyền' })
      ).toBeNull()
      expect(
        within(editor).queryByRole('button', { name: 'Chọn Sub-merchant' })
      ).toBeNull()

      await user.click(
        within(editor).getByRole('button', { name: 'Chọn Merchant' })
      )
      const merchantPicker = await findDialogByTitle('Chọn Merchant quản lý')
      await within(merchantPicker).findByText('Highlands Coffee')
      await user.click(within(merchantPicker).getAllByRole('checkbox')[1])
      await user.click(
        within(merchantPicker).getByRole('button', { name: 'Xác nhận' })
      )
      await within(editor).findByText('MC000142 — Highlands Coffee')
      await user.click(
        within(editor).getByRole('button', { name: 'Thêm User' })
      )
      await waitFor(() =>
        expect(createdBody).toMatchObject({
          merchantIds: ['merchant-0142'],
          groupIds: [],
          subMerchantIds: []
        })
      )
    },
    LONG_FLOW_TIMEOUT
  )

  it(
    'hiện cảnh báo nêu tên Merchant bị loại khỏi phạm vi khi tạo User',
    async () => {
      const user = userEvent.setup()
      const warning = vi.spyOn(feedback, 'warning').mockImplementation(() => {})
      server.use(
        http.post('*/merchant-users', () =>
          HttpResponse.json({
            data: {
              id: 'user-new',
              droppedMerchantCodes: ['MC0007'],
              droppedMerchantNames: ['Công ty ABC']
            }
          })
        )
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
      await user.click(
        within(editor).getByRole('button', { name: 'Chọn Merchant' })
      )
      const picker = await findDialogByTitle('Chọn Merchant quản lý')
      await within(picker).findByText('Highlands Coffee')
      await user.click(within(picker).getAllByRole('checkbox')[1])
      await user.click(within(picker).getByRole('button', { name: 'Xác nhận' }))
      await within(editor).findByText('MC000142 — Highlands Coffee')
      await user.click(
        within(editor).getByRole('button', { name: 'Thêm User' })
      )
      await waitFor(() =>
        expect(warning).toHaveBeenCalledWith(
          expect.stringContaining('Công ty ABC')
        )
      )
      warning.mockRestore()
    },
    LONG_FLOW_TIMEOUT
  )
})
