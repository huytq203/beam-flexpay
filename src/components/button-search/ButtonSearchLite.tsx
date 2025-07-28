import { SearchOutlined } from '@ant-design/icons'
import { Button, ButtonProps } from 'antd'

interface ButtonSearchProps extends ButtonProps {}

const ButtonSearchLite = (props: ButtonSearchProps) => {
  return (
    <Button
      type='primary'
      icon={<SearchOutlined />}
      {...props}
    />
  )
}

export default ButtonSearchLite
