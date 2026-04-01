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
      height={props.collapsed ? 41 : 64}
    />
    // <div className="flex items-center justify-center mt-1 w-full h-[75px] overflow-hidden">
    //   <img
    //     src={props.collapsed ? SLogo : ILogo}
    //     alt="Logo"
    //     className={`object-contain ${props.collapsed ? 'w-[30px] h-[30px]' : 'w-full h-full scale-[2]'}`}
    //   />
    // </div>
  )
}
