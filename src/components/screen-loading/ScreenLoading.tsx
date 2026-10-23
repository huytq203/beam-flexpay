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

  useEffect(() => {
    window.events.on('show-loading', () => {
      startTimeRef.current = Date.now()
      setTrue()
    })

    window.events.on('hide-loading', () => {
      const elapsedTime = Date.now() - startTimeRef.current
      const minDisplayTime = 300
      if (elapsedTime < minDisplayTime) {
        timeoutRef.current = setTimeout(() => {
          setFalse()
        }, minDisplayTime - elapsedTime)
      } else {
        setFalse()
      }
    })
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
