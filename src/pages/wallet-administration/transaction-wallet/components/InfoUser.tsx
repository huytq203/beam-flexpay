import { CopyableText } from '@components/index'
import type {
  PartyInfo,
  TransactionCustomer,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { BankEnum, BankLabel, CounterpartyType, CounterpartyTypeKey } from '../constants/Transaction.constant'
import React from 'react'

interface InfoUserProps {
  data?: UnifiedContentJournal
  customer?: TransactionCustomer | null
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  USER: 'text-violet-700 bg-violet-50 border border-violet-300',
  MERCHANT: 'text-purple-700 bg-purple-50 border border-purple-300',
  BANK: 'text-yellow-700 bg-yellow-50 border border-yellow-300',
  SYSTEM: 'text-gray-600 bg-gray-100 border border-gray-300',
}

const TYPE_AVATAR_CLASS: Record<string, string> = {
  USER: 'bg-violet-100 text-violet-700',
  MERCHANT: 'bg-purple-100 text-purple-700',
  BANK: 'bg-yellow-100 text-yellow-700',
  SYSTEM: 'bg-gray-100 text-gray-600',
}

const PartySection = ({ party, label }: { party?: PartyInfo; label: string }) => {
  if (!party) return (
    <div>
      <p className='text-gray-400 text-xs mb-2'>{label}</p>
      <p className='text-gray-400'>--</p>
    </div>
  )
  const typeLabel = CounterpartyType[party.type as CounterpartyTypeKey]?.label ?? party.type
  const initial = (party.displayName || party.username || '?')[0].toUpperCase()
  return (
    <div className='min-w-0'>
      <div className='flex items-center justify-between mb-2'>
        <p className='text-gray-500 text-xs font-medium uppercase tracking-wide'>{label}</p>
        <span className={`text-xs px-2 py-0.5 rounded-sm font-medium ${TYPE_BADGE_CLASS[party.type] ?? 'text-gray-500 bg-gray-50 border border-gray-200'}`}>
          {typeLabel}
        </span>
      </div>
      <div className='flex items-center gap-2 mb-2'>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${TYPE_AVATAR_CLASS[party.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {initial}
        </div>
        <div className='min-w-0'>
          <p className='break-words font-medium'>{BankLabel[party.displayName as BankEnum] || party.displayName || '--'}</p>
          <p className='break-words text-xs text-gray-500'>{party.username || '--'}</p>
        </div>
      </div>
    </div>
  )
}

const InfoUser = ({ data, customer }: InfoUserProps) => {
  return (
    <>
      <div>
        <p className='text-violet-700 font-medium'>Khách hàng & các bên giao dịch</p>
      </div>
      <hr className='my-3' />

      {customer && (
        <div className='mb-4 rounded-md border border-violet-200 bg-violet-50 p-3'>
          <div className='flex flex-wrap items-start justify-between gap-2'>
            <div className='min-w-0'>
              <p className='break-words font-semibold text-violet-950'>
                {customer.fullName || customer.username || '--'}
              </p>
              <p className='break-words text-sm text-violet-800'>{customer.username || '--'}</p>
            </div>
            <span className='rounded-sm border border-violet-300 bg-white px-2 py-0.5 text-xs font-medium text-violet-800'>
              {customer.ekycStatus || 'Chưa có trạng thái eKYC'}
            </span>
          </div>
          <div className='mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
            <CopyableText label='User ID:' value={customer.userId ?? '--'} />
            <CopyableText label='Wallet account ID:' value={customer.walletAccountId ?? '--'} />
            <div>
              <p className='text-gray-500'>GL Code:</p>
              <p className='break-words font-medium'>{customer.walletGlCode ?? '--'}</p>
            </div>
            <div>
              <p className='text-gray-500'>Trạng thái ví:</p>
              <p className='font-medium'>
                {customer.walletStatus ?? '--'}
                {customer.walletEnabled != null
                  ? ` · ${customer.walletEnabled ? 'Đang bật' : 'Đã tắt'}`
                  : ''}
              </p>
            </div>
            <div>
              <p className='text-gray-500'>Hạng khách hàng:</p>
              <p className='font-medium'>{customer.tier ?? '--'}</p>
            </div>
          </div>
        </div>
      ) }

      <div className='flex flex-col gap-4'>
        <PartySection party={data?.from} label='Người chuyển (FROM)' />
        <div className='flex items-center gap-2'>
          <hr className='flex-1' />
          <span className='text-gray-400 text-sm'>↓</span>
          <hr className='flex-1' />
        </div>
        <PartySection party={data?.to} label='Người nhận (TO)' />
      </div>
    </>
  )
}

export default InfoUser
