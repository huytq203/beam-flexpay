import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Can, SCREENS } from '@/app/permissions'
import {
  useApproveEscrowConfigMutation,
  useChallengeEscrowConfigApproveMutation,
  useGetEscrowConfigPendingQuery,
  useGetEscrowOverviewQuery,
  useRejectEscrowConfigMutation
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  DialogModal,
  feedback,
  ReasonDialog,
  Table,
  TextArea
} from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { CredentialFormError } from '../../merchant-gateway/key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../merchant-gateway/key-connection/components/CredentialOtpDialog'
import { useCredentialOtp } from '../../merchant-gateway/key-connection/hooks/useCredentialOtp'
import { isOtpStepError } from '../../merchant-gateway/key-connection/utils/credential.utils'
import {
  readErrorName,
  withOtpConsumedNotice
} from '../../merchant-reconciliation/utils/reconciliation.utils'
import {
  ESCROW_CONFIG_SOURCE_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowConfig } from '../types/merchantEscrow.types'

const SCREEN = 'MERCHANT_ESCROW' as const

/** Đề xuất không kèm tên Master (spec §3.9): tra theo `masterId` qua tổng quan, dùng chung cache với trang chi tiết. */
function MasterCell({ masterId }: { masterId: string }) {
  const navigate = useNavigate()
  const { data } = useGetEscrowOverviewQuery(masterId)
  return (
    <ButtonComponent
      type='link'
      size='small'
      className='px-0!'
      content={data ? `${data.masterCode} - ${data.masterName}` : masterId}
      onClick={() =>
        navigate(
          SCREENS.MERCHANT_ESCROW_DETAIL.path.replace(':masterId', masterId)
        )
      }
    />
  )
}

/** Duyệt một đề xuất: ghi chú tùy chọn, OTP xin theo đúng id đề xuất. */
function ApproveDialog({
  proposal,
  onClose
}: {
  proposal: EscrowConfig
  onClose: () => void
}) {
  const [challenge] = useChallengeEscrowConfigApproveMutation()
  const [approve] = useApproveEscrowConfigMutation()
  const { otp, begin } = useCredentialOtp<EscrowConfig>()
  const [note, setNote] = useState('')

  const start = () =>
    void begin({
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challenge(proposal.id).unwrap(),
      submit: async (sensitiveOtp) => {
        try {
          return await approve({
            id: proposal.id,
            note: note.trim() || undefined,
            sensitiveOtp
          }).unwrap()
        } catch (failure) {
          // BE tiêu OTP trước khi kiểm trạng thái/phiên bản: lỗi nghiệp vụ thì phải xin mã mới.
          throw isOtpStepError(readErrorName(failure))
            ? failure
            : withOtpConsumedNotice(failure)
        }
      },
      onDone: () => {
        feedback.success('Đã duyệt và áp dụng cấu hình ký quỹ')
        onClose()
      }
    })

  return (
    <DialogModal
      open
      title='Duyệt đề xuất cấu hình'
      okText='Xin mã OTP và duyệt'
      okButtonProps={{ loading: otp.isPreparing }}
      onOk={start}
      onCancel={onClose}
    >
      <div className='flex flex-col gap-3'>
        <p className='text-sm'>
          Duyệt phiên bản {proposal.version}: mức yêu cầu{' '}
          {formatCurrency(proposal.requiredAmount)} được áp dụng ngay.
        </p>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='escrow-config-approve-note'
          >
            Ghi chú duyệt (không bắt buộc)
          </label>
          <TextArea
            id='escrow-config-approve-note'
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
        <CredentialFormError message={otp.formError} />
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}

/**
 * Hàng chờ duyệt thay đổi cấu hình ký quỹ (FR-MER-0625-07): đề xuất làm giảm mức bảo đảm do người
 * cấu hình gửi và đề xuất của job soát xét định kỳ. BE chỉ trả đề xuất thuộc phạm vi gán của người
 * xem. Duyệt cần OTP; từ chối chỉ cần lý do (gửi qua query `note`).
 */
export function EscrowConfigProposalsPanel() {
  const query = useGetEscrowConfigPendingQuery()
  const [reject, rejecting] = useRejectEscrowConfigMutation()
  const [approving, setApproving] = useState<EscrowConfig | null>(null)
  const [rejectingRow, setRejectingRow] = useState<EscrowConfig | null>(null)

  const confirmReject = async (note: string) => {
    if (!rejectingRow) return
    try {
      await reject({ id: rejectingRow.id, note }).unwrap()
      feedback.success('Đã từ chối đề xuất cấu hình')
      setRejectingRow(null)
    } catch (failure) {
      feedback.error(getApiErrorDetail(failure, 'Không từ chối được đề xuất'))
    }
  }

  const columns: NonNullable<TableComponentProps<EscrowConfig>['columns']> = [
    {
      title: '#',
      align: 'center',
      width: 64,
      render: (_value, _row, index) => index + 1
    },
    {
      title: 'Master',
      dataIndex: 'masterId',
      render: (masterId: string) => <MasterCell masterId={masterId} />
    },
    { title: 'Phiên bản', dataIndex: 'version', align: 'center' },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      render: (source: EscrowConfig['source']) =>
        ESCROW_CONFIG_SOURCE_LABEL[source]
    },
    {
      title: 'Cách xác định mức',
      dataIndex: 'requirementMode',
      render: (mode: EscrowConfig['requirementMode']) =>
        mode ? ESCROW_REQUIREMENT_MODE_LABEL[mode] : ''
    },
    {
      title: 'Mức yêu cầu đề xuất',
      dataIndex: 'requiredAmount',
      align: 'right',
      render: (value: number) => (
        <span className='tabular-nums'>{formatCurrency(value)}</span>
      )
    },
    {
      title: 'Giảm bảo đảm',
      dataIndex: 'reducesProtection',
      render: (value: boolean) => (value ? 'Có' : 'Không')
    },
    { title: 'Lý do', dataIndex: 'reason' },
    {
      title: 'Ngày đề xuất',
      dataIndex: 'createdAt',
      render: (value: string) => formatUTCToLocalDateTime(value)
    },
    {
      title: 'Thao tác',
      render: (_value, row) => (
        <Can
          screen={SCREEN}
          action='approve'
        >
          <div className='flex gap-2'>
            <ButtonComponent
              size='small'
              content='Duyệt'
              onClick={() => setApproving(row)}
            />
            <ButtonComponent
              size='small'
              type='default'
              danger
              content='Từ chối'
              onClick={() => setRejectingRow(row)}
            />
          </div>
        </Can>
      )
    }
  ]

  return (
    <div className='flex flex-col gap-3'>
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          Không tải được danh sách đề xuất chờ duyệt.
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<EscrowConfig>
        columns={columns}
        dataSource={[...(query.data ?? [])]}
        loading={query.isFetching}
        onRefresh={query.refetch}
        pagination={false}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      {approving && (
        <ApproveDialog
          proposal={approving}
          onClose={() => setApproving(null)}
        />
      )}
      <ReasonDialog
        open={rejectingRow !== null}
        title='Từ chối đề xuất cấu hình'
        label='Lý do từ chối'
        okText='Từ chối'
        danger
        confirmLoading={rejecting.isLoading}
        onConfirm={(note) => void confirmReject(note)}
        onCancel={() => setRejectingRow(null)}
      />
    </div>
  )
}
