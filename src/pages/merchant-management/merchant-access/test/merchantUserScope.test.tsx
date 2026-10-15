import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderPage } from './merchantAccess.setup'

const MANAGER_PERMISSIONS = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_UPDATE,
  PERMISSION.MERCHANT_USER_SCOPE_PROPOSAL_CREATE,
  PERMISSION.MERCHANT_PERMISSION_GROUP_VIEW
]

const getTrigger = (dialog: HTMLElement, id: string): HTMLElement => {
  const trigger = dialog.querySelector(`#${id}`)
  if (!(trigger instanceof HTMLElement)) throw new Error(`Không thấy #${id}`)
  return trigger
}

const findDialogByTitle = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByText(title, {
    selector: '.ant-modal-title'
  })
  const dialog = heading.closest('[role="dialog"]')
  if (!(dialog instanceof HTMLElement)) throw new Error(`Không thấy ${title}`)
  return dialog
}

let proposalBodies: unknown[] = []
let groupBodies: unknown[] = []

beforeEach(() => {
  proposalBodies = []
  groupBodies = []
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [
            { id: 'merchant-0142', code: 'MC000142', name: 'Highlands Coffee' },
            { id: 'merchant-0200', code: 'MC000200', name: 'Phúc Long' }
          ],
          totalElements: 2,
          number: 0,
          size: 10
        }
      })
    ),
    http.put('*/merchant-users/:id', () =>
      HttpResponse.json({ data: { id: 'user-1' } })
    ),
    http.put('*/merchant-users/:id/groups', async ({ request }) => {
      groupBodies.push(await request.json())
      return HttpResponse.json({ data: { id: 'user-1' } })
    }),
    http.post('*/merchant-users/:id/scope-proposals', async ({ request }) => {
      proposalBodies.push(await request.json())
      return HttpResponse.json(
        { data: { id: 'proposal-1', status: 'PENDING_APPROVAL' } },
        { status: 201 }
      )
    })
  )
})

describe('Phạm vi User đi qua đề xuất chờ duyệt', () => {
  it('đổi Merchant khi sửa User bắt buộc lý do và gửi đề xuất thay vì áp dụng ngay', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', MANAGER_PERMISSIONS)

    await user.click(
      await screen.findByRole('button', { name: 'Sửa User Nguyễn Văn Hải' })
    )
    const editor = await findDialogByTitle('Sửa thông tin User')
    expect(within(editor).queryByLabelText(/Lý do thay đổi phạm vi/)).toBeNull()

    await user.click(getTrigger(editor, 'merchantIds'))
    const picker = await findDialogByTitle('Chọn Merchant quản lý')
    await within(picker).findByText('Phúc Long')
    await user.click(within(picker).getAllByRole('checkbox')[2])
    await user.click(within(picker).getByRole('button', { name: 'Xác nhận' }))

    await user.click(
      within(editor).getByRole('button', { name: 'Lưu thay đổi' })
    )
    expect(
      await within(editor).findByText('Vui lòng nhập lý do thay đổi phạm vi')
    ).toBeInTheDocument()
    expect(proposalBodies).toHaveLength(0)

    await user.type(
      within(editor).getByLabelText(/Lý do thay đổi phạm vi/),
      'Mở rộng quản lý chuỗi'
    )
    await user.click(
      within(editor).getByRole('button', { name: 'Lưu thay đổi' })
    )

    await waitFor(() =>
      expect(proposalBodies).toEqual([
        {
          merchantIds: ['merchant-0142', 'merchant-0200'],
          // Hai Merchant thì không còn gán Sub-merchant: gửi trọn phạm vi trong một đề xuất.
          subMerchantIds: [],
          reason: 'Mở rộng quản lý chuỗi'
        }
      ])
    )
    expect(
      await screen.findByText(
        'Đã lưu thông tin User. Thay đổi phạm vi đã được gửi duyệt.'
      )
    ).toBeInTheDocument()
  }, 15_000)

  it('thu hẹp phạm vi trả 200 APPROVED thì báo áp dụng ngay, không nói đã gửi duyệt', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    server.use(
      http.post('*/merchant-users/:id/scope-proposals', () =>
        HttpResponse.json({ data: { id: null, status: 'APPROVED' } })
      )
    )
    renderPage('/secure-panel/merchant/user', MANAGER_PERMISSIONS)

    await user.click(
      await screen.findByRole('button', { name: 'Sửa User Nguyễn Văn Hải' })
    )
    const editor = await findDialogByTitle('Sửa thông tin User')
    await user.click(getTrigger(editor, 'merchantIds'))
    const picker = await findDialogByTitle('Chọn Merchant quản lý')
    await within(picker).findByText('Phúc Long')
    await user.click(within(picker).getAllByRole('checkbox')[2])
    await user.click(within(picker).getByRole('button', { name: 'Xác nhận' }))
    await user.type(
      within(editor).getByLabelText(/Lý do thay đổi phạm vi/),
      'Mở rộng quản lý chuỗi'
    )
    await user.click(
      within(editor).getByRole('button', { name: 'Lưu thay đổi' })
    )
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        expect.stringContaining('cập nhật ngay')
      )
    )
    expect(success).not.toHaveBeenCalledWith(
      expect.stringContaining('gửi duyệt')
    )
    success.mockRestore()
  })

  it('không có quyền đề xuất thì ẩn hẳn phạm vi Merchant khi sửa User', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', [
      PERMISSION.MERCHANT_USER_VIEW,
      PERMISSION.MERCHANT_USER_UPDATE
    ])

    await user.click(
      await screen.findByRole('button', { name: 'Sửa User Nguyễn Văn Hải' })
    )
    const editor = await findDialogByTitle('Sửa thông tin User')

    expect(editor.querySelector('#merchantIds')).toBeNull()
    expect(editor.querySelector('#edit-user-subs')).toBeNull()
  })

  it('gỡ Sub-merchant trong form sửa gửi đề xuất gồm cả Merchant và Sub-merchant', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', MANAGER_PERMISSIONS)

    await user.click(
      await screen.findByRole('button', { name: 'Sửa User Nguyễn Văn Hải' })
    )
    const editor = await findDialogByTitle('Sửa thông tin User')
    await user.click(
      await within(editor).findByRole('button', {
        name: 'Gỡ Sub-merchant HLC Miền Bắc'
      })
    )
    await user.type(
      within(editor).getByLabelText(/Lý do thay đổi phạm vi/),
      'Thu hồi quyền chi nhánh'
    )
    await user.click(
      within(editor).getByRole('button', { name: 'Lưu thay đổi' })
    )

    await waitFor(() =>
      expect(proposalBodies).toEqual([
        {
          merchantIds: ['merchant-0142'],
          subMerchantIds: [],
          reason: 'Thu hồi quyền chi nhánh'
        }
      ])
    )
  }, 15_000)

  it('modal Phân quyền chỉ gán nhóm quyền, không sinh đề xuất phạm vi', async () => {
    const user = userEvent.setup()
    renderPage('/secure-panel/merchant/user', MANAGER_PERMISSIONS)

    await user.click(
      await screen.findByRole('button', {
        name: 'Phân quyền User Nguyễn Văn Hải'
      })
    )
    const dialog = await findDialogByTitle('Phân quyền · Nguyễn Văn Hải')
    expect(within(dialog).queryByText('Sub-merchant được truy cập')).toBeNull()
    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu phân quyền' })
    )

    expect(
      await screen.findByText('Đã cập nhật nhóm quyền User')
    ).toBeInTheDocument()
    expect(groupBodies).toEqual([{ ids: ['role-admin'] }])
    expect(proposalBodies).toHaveLength(0)
  })
})
