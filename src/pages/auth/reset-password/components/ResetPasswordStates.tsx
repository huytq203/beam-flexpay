import { Link } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloudServerOutlined,
  DisconnectOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import ButtonComponent from '@components/ui/button-component'
import { PATHS } from '@constants/pathConstant'
import { AuthColumn, StateDisc } from './AuthColumn'
import {
  BACK_LINK_CLASS,
  HEADING_CLASS,
  PRIMARY_BUTTON_CLASS,
  SUBTEXT_CLASS
} from '../constant/constants'

function BackToLogin() {
  return (
    <Link
      to={PATHS.AUTH.LOGIN}
      className={BACK_LINK_CLASS}
    >
      <ArrowLeftOutlined
        aria-hidden
        className='text-[11px]'
      />
      Về trang đăng nhập
    </Link>
  )
}

/** Trạng thái loading: đang hỏi BE xem liên kết còn hiệu lực không. */
export function VerifyingState() {
  return (
    <AuthColumn>
      <StateDisc>
        <LoadingOutlined spin />
      </StateDisc>
      <div
        className='reset-heading text-center'
        role='status'
        aria-live='polite'
      >
        <h1 className={HEADING_CLASS}>Đang kiểm tra liên kết</h1>
        <p className={SUBTEXT_CLASS}>
          Chỉ mất một lát. Vui lòng không đóng cửa sổ này.
        </p>
      </div>
    </AuthColumn>
  )
}

export interface UnreachableStateProps {
  onRetry: () => void
}

/** Trạng thái error hạ tầng: chưa kết luận được gì về liên kết. */
export function UnreachableState({ onRetry }: UnreachableStateProps) {
  return (
    <AuthColumn>
      <StateDisc>
        <CloudServerOutlined />
      </StateDisc>
      <div className='reset-heading mb-6 text-center'>
        <h1 className={HEADING_CLASS}>Chưa kết nối được máy chủ</h1>
        <p className={SUBTEXT_CLASS}>
          Chúng tôi chưa kiểm tra được liên kết của bạn, nên chưa thể nói nó còn
          hạn hay không. Kiểm tra kết nối mạng rồi thử lại.
        </p>
      </div>
      <div className='reset-stack flex flex-col gap-3'>
        <ButtonComponent
          className={PRIMARY_BUTTON_CLASS}
          content='Thử lại'
          onClick={onRetry}
        />
        <BackToLogin />
      </div>
    </AuthColumn>
  )
}

export interface InvalidLinkStateProps {
  message: string
  onRequestNewLink: () => void
}

/** Trạng thái empty: không có liên kết dùng được để đặt lại mật khẩu. */
export function InvalidLinkState({
  message,
  onRequestNewLink
}: InvalidLinkStateProps) {
  return (
    <AuthColumn>
      <StateDisc>
        <DisconnectOutlined />
      </StateDisc>
      <div className='reset-heading mb-6 text-center'>
        <h1 className={HEADING_CLASS}>Liên kết không còn hiệu lực</h1>
        <p className={SUBTEXT_CLASS}>
          {message} Hãy yêu cầu một liên kết mới để tiếp tục.
        </p>
      </div>
      <div className='reset-stack flex flex-col gap-3'>
        <ButtonComponent
          className={PRIMARY_BUTTON_CLASS}
          content='Yêu cầu liên kết mới'
          onClick={onRequestNewLink}
        />
        <BackToLogin />
      </div>
    </AuthColumn>
  )
}

export interface SuccessStateProps {
  secondsLeft: number
  onGoToLogin: () => void
}

export function SuccessState({ secondsLeft, onGoToLogin }: SuccessStateProps) {
  return (
    <AuthColumn>
      <StateDisc>
        <CheckOutlined />
      </StateDisc>
      <div className='reset-heading mb-6 text-center'>
        <h1 className={HEADING_CLASS}>Đã đặt lại mật khẩu</h1>
        <p className={SUBTEXT_CLASS}>
          Lần đăng nhập tới, hãy dùng mật khẩu mới bạn vừa tạo.
        </p>
      </div>
      <div className='reset-stack flex flex-col gap-3'>
        <ButtonComponent
          className={PRIMARY_BUTTON_CLASS}
          content='Đăng nhập ngay'
          onClick={onGoToLogin}
        />
        <p
          className='text-center text-[12px] text-gray-500'
          aria-live='polite'
        >
          Tự chuyển về trang đăng nhập sau {secondsLeft} giây
        </p>
      </div>
    </AuthColumn>
  )
}
