interface LogoProps {
  collapsed: boolean
}

export const Logo = ({ collapsed }: LogoProps) => (
  <img
    src={
      collapsed
        ? '/images/short_logo.svg'
        : '/images/assets/brand/logo-teal-yellow.webp'
    }
    alt='FlexPay'
    height={32}
    className='block h-8 w-auto'
    draggable={false}
  />
)
