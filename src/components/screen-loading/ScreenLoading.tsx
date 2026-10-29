import { useBoolean } from 'ahooks'
import { Modal } from 'antd'
import { useEffect, useRef } from 'react'
import './style.css'

interface ScreenLoadingProps {
  /** Hiển thị ngay, dùng cho trạng thái chặn render như khôi phục phiên. */
  open?: boolean
}

function ScreenLoading({ open = false }: ScreenLoadingProps) {
  const [isOpen, { setTrue, setFalse }] = useBoolean(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  // Số request đang bật loader. Không đếm thì request xong trước đóng loader trong khi request
  // khác vẫn chạy, rồi request sau lại mở — màn nháy liên tục.
  const pendingRef = useRef(0)

  useEffect(() => {
    const clearHideTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const handleShow = () => {
      clearHideTimer()
      if (pendingRef.current === 0) startTimeRef.current = Date.now()
      pendingRef.current += 1
      setTrue()
    }

    const handleHide = () => {
      pendingRef.current = Math.max(0, pendingRef.current - 1)
      if (pendingRef.current > 0) return
      const elapsedTime = Date.now() - startTimeRef.current
      const minDisplayTime = 300
      if (elapsedTime < minDisplayTime) {
        timeoutRef.current = setTimeout(setFalse, minDisplayTime - elapsedTime)
      } else {
        setFalse()
      }
    }

    window.events.on('show-loading', handleShow)
    window.events.on('hide-loading', handleHide)
    return () => {
      window.events.off('show-loading', handleShow)
      window.events.off('hide-loading', handleHide)
      clearHideTimer()
    }
  }, [setFalse, setTrue])

  return (
    <Modal
      centered
      closable={false}
      destroyOnHidden
      footer={null}
      title={null}
      open={open || isOpen}
      className='modal-loading'
      getContainer={false}
      zIndex={9999}
      mousePosition={{ x: 0, y: 0 }}
    >
      <div className='screen-loading-content bg-transparent!'>
        <img
          src='/images/assets/image/loadingIcon.svg'
          alt='loading'
          className='screen-loading-spinner'
        />
        <img
          src='/images/assets/brand/logo-white-yellow.webp'
          alt='Flexpay'
          className='screen-loading-logo'
        />
      </div>
    </Modal>
  )
}

export default ScreenLoading
