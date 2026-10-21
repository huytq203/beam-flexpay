import type { WithdrawalDetail } from '@services/apiJournal'
import React from 'react'

export const InfoRow = ({
  label,
  value,
  className
}: {
  label: string
  value: React.ReactNode
  className?: string
}) => (
  <div className='flex justify-between items-center gap-3 py-1'>
    <p className='text-gray-500'>{label}:</p>
    <div
      className={`min-w-0 break-words text-right font-medium ${className ?? ''}`}
    >
      {value ?? '--'}
    </div>
  </div>
)

interface BeneficiaryInfoProps {
  beneficiary: WithdrawalDetail['beneficiary']
  fallbackBank: string
}

export const BeneficiaryInfo = ({
  beneficiary,
  fallbackBank
}: BeneficiaryInfoProps) => {
  if (!beneficiary) {
    return (
      <p className='py-3 text-center text-gray-500'>
        Không có thông tin thụ hưởng.
      </p>
    )
  }

  return (
    <div>
      <InfoRow
        label='Ngân hàng'
        value={beneficiary.bankCode || fallbackBank}
      />
      <InfoRow
        label='Số tài khoản'
        value={beneficiary.accountNumber || '--'}
      />
      <InfoRow
        label='Tên chủ TK'
        value={beneficiary.accountName || '--'}
      />
      <InfoRow
        label='Chi nhánh'
        value={beneficiary.branch || '--'}
      />
    </div>
  )
}
