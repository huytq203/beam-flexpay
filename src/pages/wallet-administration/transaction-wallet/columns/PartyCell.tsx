import WalletLink from '@components/wallet-link/WalletLink'
import type { PartyInfo } from '@type/apiResponseJournal'
import { BankEnum, BankLabel } from '../constants/Transaction.constant'

export const PartyCell = ({ party }: { party?: PartyInfo }) => {
  if (party?.type === 'BANK') {
    return (
      <span className='font-medium text-gray-500'>
        {BankLabel[party.displayName as BankEnum]}{' '}
        {party.username ? `- ${party.username}` : ''}
      </span>
    )
  }
  return (
    <span className='font-medium text-gray-500'>
      <WalletLink
        ownerId={party?.id}
        username={party?.username}
      >
        {party?.username}
      </WalletLink>
    </span>
  )
}
