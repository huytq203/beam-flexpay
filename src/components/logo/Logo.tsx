import { Image } from 'antd'
import ILogo from '@assets/image/logo.png'
import SLogo from '@assets/image/short_logo.svg'
interface LogoProps{
  collapsed: boolean
}
export const Logo = (props: LogoProps) => {
  return (
    <Image
      src={props.collapsed?SLogo:ILogo}
      preview={false}
      height={props.collapsed?41:64}
    />
  )
}
