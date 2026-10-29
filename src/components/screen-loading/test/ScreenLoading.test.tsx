import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { EventEmitter } from 'events'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ScreenLoading from '../ScreenLoading'

const emit = (name: 'show-loading' | 'hide-loading') =>
  act(() => {
    window.events.emit(name)
  })

// jsdom không chạy hết animation đóng của antd Modal nên DOM còn lại; dấu hiệu đã đóng là class leave.
const isClosing = () =>
  Boolean(
    document
      .querySelector('.modal-loading')
      ?.classList.contains('ant-zoom-leave')
  )

describe('ScreenLoading', () => {
  // Setup chung dùng emitter rỗng; ở đây cần emitter thật như src/main.tsx để loader nhận sự kiện.
  let testEvents: typeof window.events

  beforeEach(() => {
    testEvents = window.events
    window.events = new EventEmitter()
  })
  afterEach(() => {
    cleanup()
    window.events = testEvents
  })

  it('giữ loader mở tới khi request chồng nhau cuối cùng xong', async () => {
    render(<ScreenLoading />)

    emit('show-loading')
    emit('show-loading')
    emit('hide-loading')
    await new Promise((resolve) => setTimeout(resolve, 400))

    expect(screen.getByAltText('loading')).toBeInTheDocument()
    expect(isClosing()).toBe(false)

    emit('hide-loading')

    await waitFor(() => expect(isClosing()).toBe(true))
  })
})
