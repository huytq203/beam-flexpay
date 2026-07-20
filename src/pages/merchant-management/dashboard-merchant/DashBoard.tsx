import { CardComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  StorefrontIcon,
} from '@phosphor-icons/react'
import useDashBoard from './hooks/useDashBoard'

const STAT_ITEMS = (
  totalMerchants: number,
  totalOrders: number,
  totalOrderSuccess: number,
  totalOrderPending: number
) => [
  {
    label: 'Tổng Merchant',
    value: totalMerchants.toLocaleString(),
    icon: StorefrontIcon,
    iconBg: 'bg-blue-500',
    border: 'border-l-4 border-blue-400',
    sub: 'Merchant đã đăng ký',
  },
  {
    label: 'Tổng đơn hàng',
    value: totalOrders.toLocaleString(),
    icon: CurrencyCircleDollarIcon,
    iconBg: 'bg-green-500',
    border: 'border-l-4 border-green-400',
    sub: 'Tất cả đơn hàng',
  },
  {
    label: 'Đơn hoàn thành',
    value: totalOrderSuccess.toLocaleString(),
    icon: CheckCircleIcon,
    iconBg: 'bg-purple-500',
    border: 'border-l-4 border-purple-400',
    sub: 'Trạng thái SUCCESS',
  },
  {
    label: 'Đơn đang xử lý',
    value: totalOrderPending.toLocaleString(),
    icon: ClockIcon,
    iconBg: 'bg-orange-400',
    border: 'border-l-4 border-orange-400',
    sub: 'Trạng thái ACTIVE',
  },
  // {
  //   label: 'Tổng doanh thu',
  //   value: formatCurrencyShort(totalAmount, { symbol: '₫', position: 'after' }),
  //   icon: CurrencyCircleDollarIcon,
  //   iconBg: 'bg-teal-500',
  //   border: 'border-l-4 border-teal-400',
  //   sub: 'Tổng giá trị đơn hàng',
  // },
]

const DashBoard = () => {
  const {
    dataMerchant,
    dataMerchantOrder,
    totalOrderSuccess,
    totalOrderPending,
    recentOrders,
    columns,
    loadingOrder,
  } = useDashBoard()

  const stats = STAT_ITEMS(
    dataMerchant?.totalElements ?? 0,
    dataMerchantOrder?.data?.totalElements ?? 0,
    totalOrderSuccess,
    totalOrderPending
  )

  return (
    <div className='space-y-4'>
      {/* Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((item) => (
          <CardComponent
            key={item.label}
            className={`${item.border} shadow-sm hover:shadow-md transition-shadow`}
            content={
              <div className='flex items-center justify-between'>
                <div className='space-y-1 min-w-0'>
                  <p className='text-[16px] font-medium  truncate'>{item.label}</p>
                  <p className='text-[14px] font-bold text-gray-800 truncate'>
                    {item.value}
                  </p>
                  <p className='text-[12px] text-gray-400 truncate'>{item.sub}</p>
                </div>
                <div className={`${item.iconBg} p-3 rounded-xl flex-shrink-0 ml-3`}>
                  <item.icon size={22} className='text-white' weight='fill' />
                </div>
              </div>
            }
          />
        ))}
      </div>

      {/* Recent Orders Table */}
      <CardComponent
        content={
          <div>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-[18px] font-semibold text-gray-800'>
                  Đơn hàng gần đây
                </h2>
                <p className='text-[12px] text-gray-400 mt-0.5'>
                  10 đơn hàng mới nhất
                </p>
              </div>
              <span className='text-[12px] text-gray-400 bg-gray-100 px-2 py-1 rounded'>
                {dataMerchantOrder?.data?.totalElements ?? 0} tổng đơn
              </span>
            </div>

            {loadingOrder ? (
              <SkeletonTable rows={5} columns={7} />
            ) : (
              <Table
                rowKey='id'
                bordered
                size='small'
                scroll={{ x: 'max-content' }}
                columns={columns}
                dataSource={recentOrders}
                pagination={false}
              />
            )}
          </div>
        }
      />
    </div>
  )
}

export default DashBoard
