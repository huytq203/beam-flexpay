import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

interface PortalMotionOptions {
  rootRef: RefObject<HTMLElement | null>
  /** Chạy lại khi danh sách tuyến đổi (quyền tải xong sau lần render đầu). */
  lineCount: number
}

/**
 * Một chuỗi duy nhất cho cột trái, khớp nhịp với cú kéo camera của mô hình 3D:
 * lời chào → dòng trạng thái → các dải tuyến → các ga. Toàn bộ kết thúc trong
 * khoảng 1.2 giây và không có vòng lặp nào chạy sau đó.
 *
 * Danh mục tuyến là điều hướng DUY NHẤT của màn này. Đã có lần nó biến mất
 * hẳn trên máy người dùng vì chuỗi mở màn giấu nó đi rồi không hiện lại, nên
 * bất biến ở đây là cấu trúc chứ không phải phòng thủ:
 *
 *   1. **Không animate `opacity` trên các dải tuyến và các ga.** Chúng chỉ
 *      trượt vào bằng `transform`. Chuỗi có chạy, đứng giữa chừng, hay không
 *      chạy thì danh mục vẫn đọc được — chỉ khác chỗ đứng vài pixel. Mọi hiệu
 *      ứng mờ dần trên đúng những phần tử này đều là một cách để mất menu.
 *      `opacity` của chúng thuộc về className của React, vốn điều khiển trạng
 *      thái câm khi người dùng chọn một tuyến khác; GSAP không chạm vào.
 *   2. Chỉ dựng chuỗi bên trong một khung hình thật. GSAP chạy trên
 *      requestAnimationFrame mà trình duyệt tiết chế rAF khi cửa sổ bị che hoặc
 *      chạy nền; rAF không chạy nghĩa là không có gì bị dịch đi ngay từ đầu.
 *   3. `fromTo` với đích tường minh: `from` ghi lại giá trị đang có làm đích,
 *      nên dựng chuỗi lần hai sẽ chốt lại đúng trạng thái dở dang của lần một.
 *   4. Chuỗi đã chạy mà đứng giữa chừng thì setTimeout — không phụ thuộc rAF —
 *      kéo thẳng tới trạng thái cuối.
 */
export function usePortalMotion({
  rootRef,
  lineCount
}: PortalMotionOptions): void {
  useEffect(() => {
    const root = rootRef.current
    if (!root || lineCount === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (document.visibilityState === 'hidden') return

    let safety = 0
    let context: gsap.Context | null = null

    const frame = requestAnimationFrame(() => {
      context = gsap.context(() => {
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' }
        })

        safety = window.setTimeout(() => {
          if (timeline.progress() < 1) timeline.progress(1)
        }, 1800)

        timeline
          .fromTo(
            '[data-portal-topbar]',
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, duration: 0.4 },
            0
          )
          .fromTo(
            '[data-portal-heading]',
            { clipPath: 'inset(0 0 100% 0)', y: 14 },
            { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.55 },
            0.1
          )
          .fromTo(
            '[data-portal-intro]',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.36 },
            0.28
          )
          .fromTo(
            '[data-portal-status] > *',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
            0.38
          )
          .fromTo(
            '[data-portal-line]',
            { x: -22 },
            {
              x: 0,
              duration: 0.46,
              stagger: 0.08,
              clearProps: 'transform'
            },
            0.44
          )
          .fromTo(
            '[data-portal-station]',
            { x: -12 },
            {
              x: 0,
              duration: 0.3,
              stagger: { amount: 0.34 },
              clearProps: 'transform'
            },
            0.6
          )
      }, root)
    })

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(safety)
      context?.revert()
    }
  }, [rootRef, lineCount])
}
