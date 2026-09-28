import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UploadControl } from '../FormUploadCombined'
import { UploadFileThumbnail } from '../UploadFilePreview'

describe('UploadControl', () => {
  it('mở PDF đã lưu bằng trình xem tài liệu và link mới', async () => {
    const resolveFileUrl = vi
      .fn()
      .mockResolvedValue('https://files.test/contract.pdf')
    const user = userEvent.setup()
    render(
      <UploadControl
        value={[
          {
            uid: 'file-1',
            name: 'contract.pdf',
            type: 'application/pdf',
            status: 'done'
          }
        ]}
        resolveFileUrl={resolveFileUrl}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Xem contract.pdf' }))
    expect(await screen.findByTitle('Xem PDF contract.pdf')).toHaveAttribute(
      'src',
      'https://files.test/contract.pdf'
    )
    expect(resolveFileUrl).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'file-1' })
    )
  })

  it('cho phép xóa một ảnh trong danh sách mà giữ các ảnh khác', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <UploadControl
        value={[
          { uid: 'a', name: 'a.jpg', type: 'image/jpeg', status: 'done' },
          { uid: 'b', name: 'b.jpg', type: 'image/jpeg', status: 'done' }
        ]}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Xóa a.jpg' }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({ uid: 'b' })
      ])
    )
  })

  it('không xin lại link thumbnail khi dữ liệu tệp được render thành object mới', async () => {
    const resolveFileUrl = vi
      .fn()
      .mockResolvedValue('https://files.test/image.jpg')
    const file = () => ({
      uid: 'file-1',
      name: 'image.jpg',
      type: 'image/jpeg',
      status: 'done' as const
    })
    const { rerender } = render(
      <UploadFileThumbnail
        file={file()}
        resolveFileUrl={resolveFileUrl}
      />
    )

    await waitFor(() => expect(resolveFileUrl).toHaveBeenCalledTimes(1))
    rerender(
      <UploadFileThumbnail
        file={file()}
        resolveFileUrl={resolveFileUrl}
      />
    )
    expect(resolveFileUrl).toHaveBeenCalledTimes(1)
  })
})
