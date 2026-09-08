import { ColumnsType } from 'antd/es/table'
import { LedgerEntry } from '../types/SystemLedger.type'
import dayjs from 'dayjs'
import { NavigateFunction } from 'react-router-dom'
import {
  MaskText,
  TooltipComponent,
  TypographyText
} from '@components/index'
import { formatCurrency } from '@utils/formatNumber'
import {
  DirectionConstants,
  DirectionShortLabel,
  type DirectionKey
} from '../constants/SystemLedger.constant'

const getSystemLedgerColumn = ({
  navigate: _navigate
}: {
  navigate: NavigateFunction
}): ColumnsType<LedgerEntry> => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 50
  },
  {
    title: 'Mã giao dịch',
    align: 'left',
    width: 200,
    dataIndex: 'transaction',
    render(value, record) {
      const code = record.transaction?.transactionCode
      return code ? (
        <div  className="flex flex-col gap-1 ">
          <TypographyText
            strong
            className=' font-medium cursor-pointer'
          >
            {code}
          </TypographyText>
          <TooltipComponent title={value?.id}> 
            <span className='inline-flex items-center gap-1 max-w-[180px]'>
              <span className='truncate max-w-[150px] text-gray-500 text-[12px]'>
                {value?.id}
              </span>
              <TypographyText copyable={{ text: value?.id }} />
            </span>
          </TooltipComponent>
        </div>
      ) : (
        <span>--</span>
      )
    }
  },
  // {
  //   title: 'Mã tài khoản (Ví)',
  //   align: 'left',
  //   dataIndex: 'account',
  //   width: 200,
  //   render(value) {
  //     return (
  //       <TooltipComponent title={value?.id}>
  //         {/* <CopyableText
  //                       value={record.id}
  //                       className=" flex max-w-[200px] font-medium cursor-pointer truncate"
  //                   /> */}
  //         <TypographyText
  //           copyable
  //           strong
  //           ellipsis={{ tooltip: false }}
  //           className='font-medium cursor-pointer max-w-[200px] inline-block'
  //         >
  //           {value?.id}
  //         </TypographyText>
  //       </TooltipComponent>
  //     )
  //   }
  // },
  {
    title: 'Tài khoản (Ví)',
    align: 'left',
    width: 160,
    render(_, record) {
      const username = record.account?.ownerUsername
      const isSystem = record.account?.ownerType === 'SYSTEM'
      const isAlreadyMasked = username?.includes('*')

      if (isSystem) {
        return (
          <span className='font-semibold text-gray-800 text-center'>
            Hệ thống
          </span>
        )
      }

      if (!username)
        return <span className='font-semibold text-gray-800'>--</span>

      return (
        <div className='flex items-center'>
          {isAlreadyMasked ? (
            <span className='font-semibold text-gray-800'>{username}</span>
          ) : (
            <MaskText value={username} />
          )}
        </div>
      )
    }
  },
  {
    title: 'Loại tài khoản',
    align: 'left',
    width: 200,
    render(_, record) {
      const ownerType = record.account?.ownerType
      const glCode = record.account?.glCode
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-gray-800 text-[12px]'>
            {ownerType ?? '--'}
          </span>
          <span className='text-gray-400 text-[12px]'>{glCode ?? ''}</span>
        </div>
      )
    }
  },
  {
    // Nhãn kế toán, khớp với cột "Chiều" trong file CSV — màn hình và file phải
    // nói cùng một thứ tiếng.
    title: 'Ghi nợ / Có',
    dataIndex: 'direction',
    align: 'center',
    width: 110,
    render(value: string) {
      const isCredit = value === DirectionConstants.CREDIT
      return (
        <span
          className={` font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}
        >
          {DirectionShortLabel[value as DirectionKey] ?? value}
        </span>
      )
    }
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    align: 'right',
    width: 130,
    render(value, record) {
      const isCredit = record.direction === DirectionConstants.CREDIT
      return (
        <span
          className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(value)}
        </span>
      )
    }
  },
  {
    title: 'Số dư sau GD',
    dataIndex: 'balanceAfter',
    align: 'right',
    width: 130,
    render(value) {
      return (
        <span className='text-gray-700 font-medium'>
          {formatCurrency(value)}
        </span>
      )
    }
  },
  // Không có cột Trạng thái: dòng sổ cái chỉ sinh ra khi bút toán đã hạch toán
  // thành công, nên cột này luôn mang đúng một giá trị. Nó từng rơi về trạng
  // thái TÀI KHOẢN khi giao dịch không có trạng thái — hai thứ khác hẳn nhau.
  {
    title: 'Thời gian ghi sổ',
    align: 'center',
    width: 170,
    render(_, record) {
      return (
        <span className='text-gray-600 text-[12px]'>
          {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      )
    }
  }
]

export default getSystemLedgerColumn
