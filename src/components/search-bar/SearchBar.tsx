import { Space } from 'antd'

type Props = {
  headerMenu: string | JSX.Element | JSX.Element[]
}

export default function SearchBar({ headerMenu }: Props) {
  return (
    <Space
      direction='vertical'
      className='w-100 p-16'
    >
      {headerMenu}
    </Space>
  )
}
