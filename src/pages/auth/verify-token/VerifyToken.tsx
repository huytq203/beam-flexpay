import { LoadingOutlined } from '@ant-design/icons'
import { Card, Spin } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const antIcon = (
  <LoadingOutlined
    style={{ fontSize: 32 }}
    spin
  />
)

function VerifyToken() {
  const { t } = useTranslation()

  useEffect(() => {
    window.events.emit('auth-set-title', t('forgot.verify').toString())
    window.events.emit('auth-set-description', '')
  }, [])

  return (
    <Card>
      <div style={{ textAlign: 'center' }}>
        <Spin
          className='mb-20'
          indicator={antIcon}
        />
        <p className='mb-20 fw-600'>{t`forgot.sub-verify`.toString()}</p>
      </div>
    </Card>
  )
}
export default VerifyToken
