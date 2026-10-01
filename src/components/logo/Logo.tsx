import { Image } from 'antd'
interface LogoProps {
  collapsed: boolean
}
export const Logo = (props: LogoProps) => {
  const logo = props.collapsed
    ? '/images/short_logo.svg'
    : '/images/assets/brand/logo-teal-yellow.webp'
  return (
    <Image
      src={logo}
      alt='FlexPay'
      preview={false}
      height={props.collapsed ? 36 : 36}
    />
  )
}
