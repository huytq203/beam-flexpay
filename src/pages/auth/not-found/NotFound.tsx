import { Result } from 'antd'
import { Link } from 'react-router-dom'

function NotFound() {
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
