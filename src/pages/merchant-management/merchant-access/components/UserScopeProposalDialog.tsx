import { useState } from 'react'

import { useScreenAccess } from '@/app/permissions'
import {
  useApproveMerchantUserScopeProposalMutation,
  useGetMerchantUserScopeProposalQuery,
  useRejectMerchantUserScopeProposalMutation
} from '@/app/services/merchantAccessApi'
import {
  ButtonComponent,
  ModalComponent,
  TextArea,
  feedback
} from '@components/index'

import type {
  AccessMerchant,
  AccessSubMerchant,
  MerchantUser
} from '../types/merchantAccess.types'
import { diffIds, withSubMerchantParents } from '../utils/scopeProposalDiff'
import { formatAccessDate } from '../utils/merchantAccess.utils'
import { ScopeProposalDiff } from './ScopeProposalDiff'

interface UserScopeProposalDialogProps {
  user: MerchantUser
  getMerchant: (id: string) => AccessMerchant | undefined
  getSubMerchant: (id: string) => AccessSubMerchant | undefined
  onClose: () => void
}

const NOTICE = 'rounded-lg border px-3 py-2 text-sm'

export function UserScopeProposalDialog({
  user,
  getMerchant,
  getSubMerchant,
  onClose
}: UserScopeProposalDialogProps) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const access = useScreenAccess('MERCHANT_USER')
  const query = useGetMerchantUserScopeProposalQuery(user.id)
  const [approve, approving] = useApproveMerchantUserScopeProposalMutation()
  const [reject, rejecting] = useRejectMerchantUserScopeProposalMutation()
  const proposal = query.data
  const isBusy = approving.isLoading || rejecting.isLoading
  const canApprove =
    access.can('approveScope') && !proposal?.ownProposal && !proposal?.outdated
  const canReject = access.can('rejectScope') && !proposal?.ownProposal

  const merchantName = (id: string): string => getMerchant(id)?.name ?? id
  const subName = (id: string): string => getSubMerchant(id)?.name ?? id

  const decide = async (kind: 'approve' | 'reject'): Promise<void> => {
    if (!proposal) return
    if (kind === 'reject' && !reason.trim()) {
      setReasonError(true)
      return
    }
    try {
      if (kind === 'approve') await approve(proposal.id).unwrap()
      else
        await reject({
          proposalId: proposal.id,
          reason: reason.trim()
        }).unwrap()
      feedback.success(
        kind === 'approve'
          ? 'Đã duyệt, phạm vi mới có hiệu lực ngay.'
          : 'Đã từ chối đề xuất.'
      )
      onClose()
    } catch {
      // Lỗi API đã được base query hiện thông báo.
    }
  }

  const nextSubs = proposal?.subMerchantIds ?? []
  const nextMerchants = withSubMerchantParents(
    proposal?.merchantIds ?? [],
    nextSubs,
    (id) => getSubMerchant(id)?.merchantId
  )

  return (
    <ModalComponent
      open
      title={`Đề xuất đổi phạm vi · ${user.name}`}
      onCancel={onClose}
      width={{ xs: '96%', md: 640 }}
      footer={
        proposal && (
          <div className='flex flex-wrap justify-end gap-2'>
            {canReject && (
              <ButtonComponent
                htmlType='button'
                type='default'
                danger
                content='Từ chối'
                loading={rejecting.isLoading}
                disabled={isBusy}
                onClick={() => void decide('reject')}
              />
            )}
            {canApprove && (
              <ButtonComponent
                htmlType='button'
                type='primary'
                content='Duyệt và áp dụng'
                loading={approving.isLoading}
                disabled={isBusy}
                onClick={() => void decide('approve')}
              />
            )}
          </div>
        )
      }
    >
      <div className='flex flex-col gap-4 pt-2'>
        {query.isLoading && (
          <p className='text-sm text-muted-foreground'>Đang tải đề xuất...</p>
        )}
        {query.isError && (
          <p
            role='alert'
            className={`${NOTICE} border-danger-strong text-danger-strong`}
          >
            Không có đề xuất nào đang chờ duyệt. Có thể đã được xử lý, hãy tải
            lại danh sách.
          </p>
        )}
        {proposal && (
          <>
            <dl className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-3'>
              <div>
                <dt className='text-xs text-muted-foreground'>Người đề xuất</dt>
                <dd className='m-0 font-medium'>
                  {proposal.ownProposal ? 'Bạn' : 'Quản trị viên khác'}
                </dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>Gửi lúc</dt>
                <dd className='m-0 font-medium'>
                  {formatAccessDate(proposal.createdAt ?? '')}
                </dd>
              </div>
              <div>
                <dt className='text-xs text-muted-foreground'>User</dt>
                <dd className='m-0 truncate font-medium'>{user.email}</dd>
              </div>
            </dl>
            <div>
              <p className='text-xs text-muted-foreground'>Lý do đề xuất</p>
              <p className='m-0 text-sm'>{proposal.requestReason}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-semibold text-muted-foreground'>
                Thay đổi
              </p>
              <ScopeProposalDiff
                label='Merchant'
                diff={diffIds(user.merchantIds, nextMerchants)}
                getName={merchantName}
              />
              <ScopeProposalDiff
                label='Sub-merchant'
                diff={diffIds(user.subMerchantIds, nextSubs)}
                getName={subName}
              />
            </div>
            {proposal.ownProposal && (
              <p
                role='alert'
                className={`${NOTICE} border-warning-strong text-warning-strong`}
              >
                Bạn là người đề xuất nên không thể duyệt hoặc từ chối. Nhờ một
                quản trị viên khác xử lý.
              </p>
            )}
            {proposal.outdated && (
              <p
                role='alert'
                className={`${NOTICE} border-danger-strong text-danger-strong`}
              >
                Phạm vi của User đã thay đổi từ khi đề xuất được gửi. Từ chối đề
                xuất này và nhờ người đề xuất gửi lại.
              </p>
            )}
            {canReject && (
              <div className='flex flex-col gap-1'>
                <label
                  className='text-sm font-medium'
                  htmlFor='scope-proposal-reject-reason'
                >
                  Lý do từ chối
                </label>
                <TextArea
                  id='scope-proposal-reject-reason'
                  rows={2}
                  maxLength={500}
                  value={reason}
                  aria-invalid={reasonError}
                  placeholder='Bắt buộc khi từ chối'
                  onChange={(event) => {
                    setReason(event.target.value)
                    setReasonError(false)
                  }}
                />
                {reasonError && (
                  <p
                    role='alert'
                    className='text-sm text-danger-strong'
                  >
                    Nhập lý do từ chối.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ModalComponent>
  )
}
