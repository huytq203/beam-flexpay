import { UnifiedContentJournal, PartyInfo } from '@type/apiResponseJournal'
import { CounterpartyType, CounterpartyTypeKey } from '../constants/Transaction.constant'
import React from 'react'

interface InfoUserProps {
  data?: UnifiedContentJournal
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
    <div>
      <div className='flex items-center justify-between mb-2'>
      <p className='text-gray-500 text-xs mb-2 font-medium uppercase tracking-wide'>{label}</p>
      <span className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_BADGE_CLASS[party.type] ?? 'text-gray-500 bg-gray-50 border border-gray-200'}`}>
        {typeLabel}
      </span>
      </div>
      <div className='flex items-center gap-2 mb-2'>
        <div className={`flex justify-center items-center w-9 h-9 rounded-full font-bold text-sm ${TYPE_AVATAR_CLASS[party.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {initial}
        </div>
        <div>
          <p className='font-medium'>{party.displayName || '--'}</p>
          <p className='text-gray-500 text-xs'>{party.username}</p>
        </div>
      </div>
      
    </div>
  )
}

const InfoUser = ({ data }: InfoUserProps) => {
  return (
    <>
      <div>
        <p className='text-violet-500 font-medium'>5. Thông tin bên giao dịch</p>
      </div>
      <hr className='my-3' />
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
