import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  CODE,
  FAILED_DEPOSIT,
  NOTE,
  POSTED_FULL,
  choose,
  fill,
  mockRefresh,
  mockUpdate,
  openForm,
  renderAction,
  submit,
  type User
} from './stuck.setup'

interface UploadCall {
  body: unknown
  headers: unknown
}

/**
 * jsdom và undici không chung một lớp FormData nên MSW không đọc lại được multipart;
 * thay vào đó bắt đúng đối số FE đưa cho base query.
 */
const captured = vi.hoisted(() => ({ calls: [] as UploadCall[] }))

vi.mock('@configs/fetchBaseQueryCustom', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@configs/fetchBaseQueryCustom')>()
  const wrapped: typeof actual.fetchBaseQueryUserWallet = (
    args,
    api,
    extra
  ) => {
    if (
      typeof args === 'object' &&
      args.method === 'POST' &&
      args.url.endsWith('/receipt')
    ) {
      captured.calls.push({ body: args.body, headers: args.headers })
    }
    return actual.fetchBaseQueryUserWallet(args, api, extra)
  }
  return { ...actual, fetchBaseQueryUserWallet: wrapped }
})

beforeEach(() => {
  captured.calls.length = 0
})

const mockUpload = (): UploadCall[] => {
  server.use(
    http.post(`*/transactions/${CODE}/receipt`, () =>
      HttpResponse.json({
        data: {
          receiptKey: 'txn-receipts/FW26/abc.png',
          contentType: 'image/png',
          sizeBytes: 2048
        }
      })
    )
  )
  return captured.calls
}

const makeFile = (name: string, type: string, size = 2048): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const pick = (file: File): void => {
  fireEvent.change(screen.getByLabelText('Ảnh biên lai'), {
    target: { files: [file] }
  })
}

const openSuccess = async (): Promise<User> => {
  mockRefresh([POSTED_FULL, FAILED_DEPOSIT])
  const user = renderAction()
  await openForm(user)
  await choose(user, 'Thành công')
  return user
}

describe('Upload biên lai khi chốt Thành công', () => {
  it('gửi multipart một phần file, hiện tên + dung lượng và gửi receiptKey khi cập nhật', async () => {
    const uploads = mockUpload()
    const bodies = mockUpdate()
    const user = await openSuccess()
    pick(makeFile('bien-lai.png', 'image/png'))

    expect(await screen.findByText(/bien-lai\.png · 2\.0 KB/)).toBeVisible()
    expect(uploads).toHaveLength(1)
    const { body, headers } = uploads[0]
    expect(body).toBeInstanceOf(FormData)
    const file = (body as FormData).get('file')
    expect(file).toBeInstanceOf(File)
    expect((file as File).name).toBe('bien-lai.png')
    // Không tự đặt Content-Type để trình duyệt thêm boundary.
    expect(headers).toBeUndefined()

    fill('Lý do cập nhật', NOTE)
    await submit(user)
    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      newStatus: 'POSTED',
      note: NOTE,
      receiptKey: 'txn-receipts/FW26/abc.png'
    })
  })

  it('Gỡ để chọn lại và không gửi receiptKey', async () => {
    mockUpload()
    const bodies = mockUpdate()
    const user = await openSuccess()
    pick(makeFile('bien-lai.png', 'image/png'))
    await user.click(await screen.findByRole('button', { name: 'Gỡ biên lai' }))

    expect(screen.getByRole('button', { name: 'Chọn biên lai' })).toBeVisible()
    fill('Lý do cập nhật', NOTE)
    await submit(user)
    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).not.toHaveProperty('receiptKey')
  })

  it('đổi sang Thất bại thì bỏ receiptKey khỏi payload', async () => {
    mockUpload()
    const bodies = mockUpdate('FAILED')
    const user = await openSuccess()
    pick(makeFile('bien-lai.png', 'image/png'))
    await screen.findByText(/bien-lai\.png/)
    await choose(user, 'Thất bại')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ newStatus: 'FAILED', note: NOTE })
  })

  it.each([
    ['sai loại (gif)', makeFile('a.gif', 'image/gif'), /chỉ nhận ảnh jpeg/],
    ['sai loại (txt)', makeFile('a.txt', 'text/plain'), /chỉ nhận ảnh jpeg/],
    [
      'quá 2MB',
      makeFile('a.png', 'image/png', 2 * 1024 * 1024 + 1),
      /tối đa 2MB/
    ]
  ])('chặn %s tại client, không gọi API', async (_name, file, message) => {
    const uploads = mockUpload()
    await openSuccess()
    pick(file)

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(uploads).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Chọn biên lai' })).toBeVisible()
  })

  it.each([
    ['jpeg', makeFile('a.jpeg', 'image/jpeg')],
    ['jpg', makeFile('a.jpg', 'image/jpeg')],
    ['webp', makeFile('a.webp', 'image/webp')],
    ['pdf', makeFile('a.pdf', 'application/pdf')],
    ['đúng 2MB', makeFile('a.png', 'image/png', 2 * 1024 * 1024)]
  ])('cho qua %s', async (_name, file) => {
    const uploads = mockUpload()
    await openSuccess()
    pick(file)

    await waitFor(() => expect(uploads).toHaveLength(1))
  })

  it('400 của BE (chưa cấu hình lưu biên lai) hiện nguyên văn trong form', async () => {
    server.use(
      http.post(`*/transactions/${CODE}/receipt`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'BUSINESS_ERROR',
            detail:
              'Chức năng lưu ảnh biên lai chưa được cấu hình trên môi trường này'
          },
          { status: 400 }
        )
      )
    )
    await openSuccess()
    pick(makeFile('a.png', 'image/png'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Chức năng lưu ảnh biên lai chưa được cấu hình trên môi trường này'
    )
    expect(screen.getByRole('button', { name: 'Chọn biên lai' })).toBeVisible()
  })

  it('đang upload thì khoá chọn lại và khoá nút cập nhật', async () => {
    let release: () => void = () => undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.post(`*/transactions/${CODE}/receipt`, async () => {
        await gate
        return HttpResponse.json({
          data: { receiptKey: 'k', contentType: 'image/png', sizeBytes: 1 }
        })
      })
    )
    await openSuccess()
    pick(makeFile('a.png', 'image/png'))

    await waitFor(() =>
      expect(screen.getByLabelText('Ảnh biên lai')).toBeDisabled()
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Xác nhận cập nhật' })
      ).toBeDisabled()
    )

    release()
    expect(await screen.findByText(/a\.png/)).toBeVisible()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Xác nhận cập nhật' })
      ).toBeEnabled()
    )
  })
})
