import { Image } from 'antd'

export default function Logo() {
  return (
    <Image
      src='/logo.png'
      preview={false}
      height={64}
    />
  )
}
