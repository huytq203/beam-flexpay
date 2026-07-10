import { Image } from 'antd'
interface LogoProps {
  collapsed: boolean
}
export const Logo = (props: LogoProps) => {
  const logo = props.collapsed ? "/images/short_logo.svg" : "/images/logo.png"
  return (
    <Image
      src={logo}
      preview={false}
      height={props.collapsed ? 41 : 43}
    />
 
  )
}
