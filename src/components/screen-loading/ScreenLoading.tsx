import { useBoolean } from 'ahooks'
import { Modal, Spin } from 'antd'
import { useEffect, useRef } from 'react'

function ScreenLoading() {
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
  }, [])

  return (
    <Modal
      centered
      closable={false}
      destroyOnClose
      footer={null}
      title={null}
      open={isOpen}
      className='modal-loading'
      getContainer={false}
      zIndex={9999}
    >
      <Spin    zIndex={9999} size='large' spinning={isOpen} />
    </Modal>
  )
}

export default ScreenLoading
