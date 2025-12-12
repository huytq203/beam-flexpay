import { useBoolean } from 'ahooks'
import { Modal, Spin } from 'antd'
import { useEffect } from 'react'
function ScreenLoading() {
  const [isOpen, { setTrue, setFalse }] = useBoolean(false)

  useEffect(() => {
    window.events.on('show-loading', () => {
      setTrue()
    })
    window.events.on('hide-loading', () => {
      setFalse()
    })
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
    >
      <Spin
        size='large'
        spinning={isOpen}
      />
    </Modal>
  )
}

export default ScreenLoading
