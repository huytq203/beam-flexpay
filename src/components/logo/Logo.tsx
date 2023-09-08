import { Image } from 'antd'
import ILogo from '@assets/image/logo.png'

export default function Logo() {
  return (
    <Image
      src={ILogo}
      preview={false}
      height={64}
    />
  )
}
