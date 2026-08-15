import { CardComponent, ExportCsvButton, Table } from '@components/index'
import React, { useCallback, useMemo, useState } from 'react'
import { getColumn } from './configs/AccountBank.column'
import usePagination from '@hooks/usePagination'
import {
  type BankLink,
  useGetBankLinksQuery
} from '@services/apiBankLink'
import BankLinkFormSearch from './components/BankLinkFormSearch'
import DialogUnlinkBank from './components/DialogUnlinkBank'
import type { BankLinkSearchFilters } from './utils/bank-link-search'
import { useExportCsv } from '@hooks/useExportCsv'
import { useExportBankLinksMutation } from '@services/apiExportCsv'

interface Props {
  userId: string
  /** Id của ví — endpoint export lấy theo ví, không phải theo user. */
  walletAccountId: string
  onUpdateBankLink?: (bankLink: BankLink) => void
  onUnlinkBankLink?: (bankLink: BankLink) => void
  onApproveBankLink?: (bankLink: BankLink) => void
}

const AccountBank = ({
  userId,
  walletAccountId,
  onUpdateBankLink,
  onUnlinkBankLink,
  onApproveBankLink
}: Props) => {
  const [filters, setFilters] = useState<BankLinkSearchFilters>({})
  const [selectedBankLink, setSelectedBankLink] = useState<BankLink>()
  const {
    page,
    pageSize,
    sort,
    sortDirection,
    setPage,
    setPageSize
  } = usePagination({ defaultSort: 'linkedAt' })
  const [triggerExport, { reset: resetExport }] = useExportBankLinksMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'lien-ket-ngan-hang'
  })

  const params = useMemo(() => ({
    ...filters,
    userId,
    page,
    size: pageSize,
    sortBy: sort,
    sortDirection
  }), [filters, page, pageSize, sort, sortDirection, userId])

  const {
    data,
    isFetching,
    refetch
  } = useGetBankLinksQuery(params, { skip: !userId })

  const dataSource = useMemo(() => {
    return data?.content?.map((item, index) => {
      return {
        no: (page - 1) * pageSize + index + 1,
        ...item,
      }
    })
  }, [data?.content, page, pageSize])

  const handleOpenUnlink = useCallback((bankLink: BankLink) => {
    setSelectedBankLink(bankLink)
    onUnlinkBankLink?.(bankLink)
  }, [onUnlinkBankLink])

  const handleCloseUnlink = useCallback(() => {
    setSelectedBankLink(undefined)
  }, [])

  const column = useMemo(() => getColumn({
    onUpdate: onUpdateBankLink,
    onUnlink: handleOpenUnlink,
    onApprove: onApproveBankLink
  }), [handleOpenUnlink, onApproveBankLink, onUpdateBankLink])
  const handleSearch = (searchFilters: BankLinkSearchFilters) => {
    setFilters(searchFilters)
    setPage(1)
  }

  return (
    <>
      <div className='space-y-3!'>
        <CardComponent
          content={<BankLinkFormSearch onSearch={handleSearch} />}
        />
        <CardComponent content={<>
          <div className="flex justify-between items-center mb-3">
            <span className='font-medium text-gray-600 text-lg'>Danh sách liên kết</span>
            <ExportCsvButton
              onExport={() => exportFile({ walletAccountId })}
              loading={isExporting}
              disabled={!walletAccountId}
              tooltip='File xuất toàn bộ liên kết của ví, không áp dụng bộ lọc đang chọn'
            />
          </div>
          <Table
            rowKey='id'
            loading={isFetching}
            onRefresh={userId ? refetch : undefined}
            pagination={{
              current: page,
              pageSize,
              showSizeChanger: true,
              total: data?.totalElements ?? 0,
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              }
            }}
            scroll={{ x: 'max-content' }}
            size='small' columns={column}
            bordered dataSource={dataSource} />
        </>} />
      </div>

      <DialogUnlinkBank
        open={!!selectedBankLink}
        bankLink={selectedBankLink}
        onCancel={handleCloseUnlink}
        onSuccess={handleCloseUnlink}
      />
    </>
  )
}

export default AccountBank
