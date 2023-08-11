import { Result } from 'antd'
import { useTranslation } from 'react-i18next'

function ForbiddenError() {
  const { t } = useTranslation()
  return (
    <div
      className='h-100'
      style={{ background: '#fffffff' }}
    >
      <Result
        status='403'
        title='403'
        subTitle={t`errors.forbidden.forbidden`}
      />
    </div>
  )
}
export default ForbiddenError
