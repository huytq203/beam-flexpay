import NavProfile from '@components/layout/components/NavProfile'

/**
 * Thanh nổi duy nhất của màn khởi động. Không phải app header: không breadcrumb,
 * không tiêu đề trang, không nút mở sidebar — màn này chính là điều hướng.
 */
export function PortalTopBar() {
  return (
    <div
      data-portal-topbar
      className='pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4 sm:px-8 lg:px-10'
    >
      <img
        src='/images/logo.png'
        alt='FlexPay'
        className='pointer-events-auto h-8 w-auto'
      />
      <div className='pointer-events-auto'>
        <NavProfile />
      </div>
    </div>
  )
}
