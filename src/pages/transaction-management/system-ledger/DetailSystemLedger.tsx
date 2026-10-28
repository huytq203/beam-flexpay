import { CardComponent } from '@components/index'
import React from 'react'
import useDetailSystemLedger from './hooks/useDetailSystemLedger'
import dayjs from 'dayjs'
import { GLCodeLabels, OwnerTypeLabels, StatusLabel, getLedgerTransactionTypeLabel } from './constants/SystemLedger.constant'
import { formatCurrency } from '@/app/utils'

const DetailSystemLedger = () => {
  const { ledgerEntry, isLoading } = useDetailSystemLedger()

  if (isLoading) {
    return <div className="flex justify-center items-center p-10">Loading...</div>
  }

  if (!ledgerEntry) {
    return <div className="flex justify-center items-center p-10">Entry not found</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex flex-col gap-1">
          <p className='text-xl font-bold'>
            Chi tiết Ledger Entry: <span className='text-blue-700'>{ledgerEntry.transaction?.transactionCode ?? '--'}</span>
          </p>
          <p className="text-sm text-gray-500">{dayjs(ledgerEntry.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Transaction Details */}
        <CardComponent
          className='col-span-1'
          content={
            <>
              <div>
                <p className='font-medium text-blue-700'>1. Transaction Details</p>
              </div>
              <hr className='my-3' />
              <div className='flex flex-col gap-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Transaction ID:</span>
                  <span className='font-mono text-xs'>{ledgerEntry.transaction?.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Transaction Code:</span>
                  <span className='font-bold'>{ledgerEntry.transaction?.transactionCode}</span>
                </div>
               <div className='flex justify-between'>
                  <span className='text-gray-500'>Owner ID:</span>
                  <span className='font-mono text-xs'>{ledgerEntry.transaction?.ownerId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Type:</span>
                  <span className='font-medium'>{getLedgerTransactionTypeLabel(ledgerEntry.transactionType)}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Gross Amount:</span>
                  <span className='font-bold text-green-600'>{formatCurrency(ledgerEntry.transaction?.grossAmount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Net Amount:</span>
                  <span className='font-medium'>{formatCurrency(ledgerEntry.transaction?.netAmount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Fee Amount:</span>
                  <span className='font-medium text-red-600'>{formatCurrency(ledgerEntry.transaction?.feeAmount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Currency:</span>
                  <span className='font-medium'>{ledgerEntry.transaction?.currency}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Status:</span>
                  <span className='font-bold text-green-600'>{StatusLabel[ledgerEntry.transaction?.status] || ledgerEntry.transaction?.status}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Description:</span>
                  <span className='font-medium'>{ledgerEntry.transaction?.description || '--'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Transaction Time:</span>
                  <span className='font-medium text-xs'>{dayjs(ledgerEntry.transaction?.transactionTime).format('DD/MM/YYYY HH:mm:ss')}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Processed At:</span>
                  <span className='font-medium text-xs'>{dayjs(ledgerEntry.transaction?.processedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                </div>
              </div>
            </>
          }
        />

        {/* Account Details */}
        <CardComponent
          className='col-span-1'
          content={
            <>
              <div>
                <p className='font-medium text-blue-700'>2. Account Details</p>
              </div>
              <hr className='my-3' />
              <div className='flex flex-col gap-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Account ID:</span>
                  <span className='font-mono text-xs'>{ledgerEntry.account?.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>GL Code:</span>
                  <span className='font-bold text-blue-600'>{ledgerEntry.account?.glCode}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>GL Name:</span>
                  <span className='font-medium text-xs'>{GLCodeLabels[ledgerEntry.account?.glCode] || 'N/A'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Owner Type:</span>
                  <span className='font-medium'>{OwnerTypeLabels[ledgerEntry.account?.ownerType] || ledgerEntry.account?.ownerType}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Current Balance:</span>
                  <span className='font-bold text-green-600'>{formatCurrency(ledgerEntry.account?.balance)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Available Balance:</span>
                  <span className='font-medium text-green-600'>{formatCurrency(ledgerEntry.account?.availableBalance)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Hold Balance:</span>
                  <span className='font-medium text-orange-600'>{formatCurrency(ledgerEntry.account?.holdBalance)}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Total Debit:</span>
                  <span className='font-medium text-red-600'>{formatCurrency(ledgerEntry.account?.totalDebit)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Total Credit:</span>
                  <span className='font-medium text-green-600'>{formatCurrency(ledgerEntry.account?.totalCredit)}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Status:</span>
                  <span className='font-bold text-green-600'>{StatusLabel[ledgerEntry.account?.status] || ledgerEntry.account?.status}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Version:</span>
                  <span className='font-medium'>{ledgerEntry.account?.version}</span>
                </div>
              </div>
            </>
          }
        />

        {/* Entry Details */}
        <CardComponent
          className='col-span-1'
          content={
            <>
              <div>
                <p className='font-medium text-blue-700'>3. Entry Details</p>
              </div>
              <hr className='my-3' />
              <div className='flex flex-col gap-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Entry ID:</span>
                  <span className='font-mono text-xs'>{ledgerEntry.id}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Direction:</span>
                  <span className={`font-bold text-lg ${ledgerEntry.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {ledgerEntry.direction}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Entry Amount:</span>
                  <span className='font-bold text-lg'>{formatCurrency(ledgerEntry.amount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Balance After:</span>
                  <span className='font-bold text-blue-600 text-lg'>{formatCurrency(ledgerEntry.balanceAfter)}</span>
                </div>
                <hr />
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Entry Description:</span>
                  <span className='font-medium'>{ledgerEntry.description || '--'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Created At:</span>
                  <span className='font-medium text-xs'>{dayjs(ledgerEntry.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                </div>
                <hr />
                <div className='flex flex-col gap-1'>
                  <span className='text-gray-500 text-xs'>Checksum:</span>
                  <span className='font-mono text-[10px] bg-gray-100 p-1 rounded-sm break-all'>{ledgerEntry.checksum}</span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-gray-500 text-xs'>Previous Checksum:</span>
                  <span className='font-mono text-[10px] bg-gray-100 p-1 rounded-sm break-all'>{ledgerEntry.previousChecksum}</span>
                </div>
              </div>
            </>
          }
        />
      </div>
    </>
  )
}

export default DetailSystemLedger
