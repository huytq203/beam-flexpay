import { Result } from 'antd'
import { Link, useLocation } from 'react-router-dom'

function NotFound() {
  const { pathname } = useLocation()

  if (!pathname.startsWith('/secure-panel')) {
    return null
  }

  return (
    <Result
      status='404'
      title='404'
      subTitle='The requested URL was not found on this server.'
      extra={<Link to={'/'}>Back Home</Link>}
    />
  )
}

export default NotFound
