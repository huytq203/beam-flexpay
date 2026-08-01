/**
 * THESIS: 403 là trạm phục hồi công việc, không phải một mã lỗi phô diễn.
 * OWN-WORLD: nền giấy FlexPay, teal chỉ hành động, amber đánh dấu quyền bị chặn.
 * STORY: Capy báo quyền bị chặn, xác nhận dữ liệu an toàn và đưa ra lối thoát.
 * FIRST VIEWPORT: Capy ở chính giữa, tiếp theo là thông báo và hai hành động.
 * FORM: cấu trúc typographic gate, ứng viên 3, surface seed b4691b73.
 */

import { useEffect, useRef } from 'react'
import { ArrowRight, Copy, ShieldSlash } from '@phosphor-icons/react'
import gsap from 'gsap'
import ButtonComponent from '@components/ui/button-component'
import { useForbiddenRecovery } from './useForbiddenRecovery'

const CAPYBARA_IMAGE =
  '/images/assets/capybara/Cappybara%2017%20Poses-10.png'

export function ForbiddenError() {
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const recovery = useForbiddenRecovery()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    headingRef.current?.focus()
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-forbidden-content] > *',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      )
      gsap.fromTo('[data-capybara]', { y: 10, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay: 0.12,
        ease: 'power3.out'
      })
    }, root)

    return () => context.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className='relative flex min-h-full items-center overflow-hidden rounded-xl bg-background px-4 py-8 text-foreground sm:px-8'
      aria-labelledby='forbidden-title'
    >
      <div className='mx-auto w-full max-w-[620px] text-center'>
        <figure data-capybara className='mx-auto mb-2 w-[260px]'>
          <div className='relative h-[220px] overflow-hidden'>
            <img
              src={CAPYBARA_IMAGE}
              alt='Capybara nhân viên đang kiểm tra danh sách phân quyền'
              width={3334}
              height={3334}
              className='absolute left-1/2 top-1/2 size-[340px] max-w-none -translate-x-1/2 -translate-y-[46%] object-contain mix-blend-multiply'
            />
          </div>
        </figure>

        <div data-forbidden-content>
          <div className='mb-3 inline-flex items-center gap-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900'>
            <ShieldSlash aria-hidden size={16} weight='duotone' />
            403 · Chưa đủ quyền truy cập
          </div>

          <h1
            ref={headingRef}
            id='forbidden-title'
            tabIndex={-1}
            className='text-balance font-display text-2xl font-bold leading-tight tracking-[-0.02em] outline-none sm:text-[28px]'
          >
            Capy đã dừng yêu cầu để bảo vệ dữ liệu
          </h1>
          <p className='mx-auto mt-2 max-w-[520px] text-[13px] leading-6 text-muted-foreground'>
            Phiên đăng nhập vẫn còn hiệu lực, nhưng tài khoản chưa có nhóm quyền
            phù hợp. Không có thay đổi nào được thực hiện.
          </p>

          <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
            <ButtonComponent
              htmlType='button'
              content='Về màn làm việc an toàn'
              icon={<ArrowRight aria-hidden size={17} weight='bold' />}
              onClick={recovery.returnToSafePage}
              className='h-11! rounded-xl! px-5! text-[13px]! font-semibold! text-primary-foreground!'
            />
            <ButtonComponent
              htmlType='button'
              type='default'
              content={
                recovery.copyStatus === 'copied'
                  ? 'Đã sao chép yêu cầu'
                  : 'Sao chép yêu cầu hỗ trợ'
              }
              icon={<Copy aria-hidden size={17} />}
              onClick={() => void recovery.copySupportRequest()}
              className='h-11! rounded-xl! border-border! bg-background! px-5! text-[13px]! font-semibold! text-secondary-foreground! shadow-none! hover:bg-accent!'
            />
          </div>

          <div className='mx-auto mt-3 min-h-5 max-w-[520px] text-[11px] leading-5 text-muted-foreground'>
            <span aria-live='polite'>
              {recovery.copyStatus === 'error'
                ? 'Không thể sao chép. Vui lòng thử lại trên trình duyệt hỗ trợ.'
                : 'Gửi nội dung đã sao chép cho quản trị viên để được kiểm tra quyền.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForbiddenError
