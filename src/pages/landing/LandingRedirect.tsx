import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useAppSelector } from '@hooks/hook'
import useLandingPath from '@hooks/useLandingPath'
import { CookieKey } from '@configs/fetchBaseQuery.types'
import { PATHS } from '@constants/pathConstant'

/**
 * Điểm vào `/secure-panel`: không render UI, chỉ đọc quyền đã decode từ JWT
 * rồi đẩy thẳng sang màn đầu tiên user được phép truy cập.
 */
function LandingRedirect() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const landingPath = useLandingPath()

  if (!accessToken && !Cookies.get(CookieKey.REFRESH_TOKEN)) {
    return (
      <Navigate
        to={PATHS.AUTH.LOGIN}
        replace
      />
    )
  }

  return (
    <Navigate
      to={landingPath ?? PATHS.FORBIDDEN}
      replace
    />
  )
}

export default LandingRedirect
