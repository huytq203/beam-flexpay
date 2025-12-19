import { useState } from 'react'
import { Button, Card, Input } from 'antd'
import './style.scss'
import { useUserGetResendOtpMutation, useUserGetUserOtpMutation, useVerifyLoginOtpMutation } from '@services/cmsService';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import InputComponent from '@components/ui/Input-component/input';
import { ButtonComponent } from '@components/common';

const VerifyCode2 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [verifyOtp, { isLoading }] = useVerifyLoginOtpMutation();
  const [getResendOtp, { isLoading: isLoadingGetResendOtp }] = useUserGetResendOtpMutation();
  const [searchParams] = useSearchParams();
  //const trackingId = searchParams.get('trackingId');
  const [trackingId, setTrackingId] = useState(searchParams.get('trackingId'));
  const email = searchParams.get('email');
  const [verificationCode, setVerificationCode] = useState([
    '',
    '',
    '',
    '',
    '',
    ''
  ])

  const handleVerify = async () => {
    const code = verificationCode.join('');

    try {
      // Lấy dữ liệu OTP từ localStorage hoặc state
      // const otpData = JSON.parse(localStorage.getItem('otpData') || '{}');

      // Gọi API xác thực OTP
      const result = await verifyOtp({
        verifyLoginOtp: {
          otpCode: code,
          action: 'ADMIN_LOGIN',
          trackingId: trackingId || '',
          email: email || ''
          // Các thông tin khác nếu cần
        }
      });

      if ('data' in result && result.data) {
        notification.success({ message: t('verifyCode.messages.success') });
        navigate('/role/admin-account'); // Chuyển đến trang chính sau khi xác thực thành công
      }
    } catch (error) {
      notification.error({ message: t('verifyCode.messages.error') });
    }
  };

  const handleResendCode = async () => {
    if (!email || !trackingId) {
      notification.error({ message: t('verifyCode.messages.missingInfo') })
      return
    }
    try {
      const result = await getResendOtp({
        adminGetOtp: {
          email,
          action: 'ADMIN_LOGIN'
        }
      })

      if ('data' in result && result.data) {
        notification.success({ message: t('verifyCode.messages.resendSuccess') });
        setVerificationCode(['', '', '', '', '', '']);

        // Lấy trackingId mới từ kết quả trả về
        const newTrackingId = result.data.trackingId;
        if (newTrackingId) {
          // Cập nhật trackingId
          console.log('New trackingId:', newTrackingId);
          setTrackingId(newTrackingId);
        }
      }
      // else {
      //   notification.error({ message: t('verifyCode.messages.resendFailed') })
      // }
    } catch (error) {
      notification.error({ message: t('verifyCode.messages.resendError') })
    }
  }

  const handleCancel = () => {
    navigate('/auth/login2');
  }

  const handleCodeChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value

    // Tự động focus vào ô tiếp theo khi nhập
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }

    setVerificationCode(newCode)
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Xử lý khi nhấn phím Backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  return (
    <div className="flex flex-col  gap-3 px-5 border rounded-md shadow-md py-10 md:border-none md:shadow-none md:py-0">
      <div className="flex justify-center items-center mb-2">
        <div className="rounded-full bg-white p-1 shadow-md  hover:shadow-xl transition-all duration-300">
          <img className='w-16 h-16 object-contain' src="/images/BEAM.png" alt="" />
        </div>
      </div>
      <div className="text-center mb-3">
        <h1 className=' font-extrabold text-2xl md:text-3xl italic text-gray-600 mb-3'>Nhập mã xác thực</h1>
        <p className=''>
          Nhập mã xác thực 6 ký tự đã gửi về email
        </p>

      </div>
      <div className="flex justify-center items-center gap-2 mb-3">
        {verificationCode.map((digit, index) => (
          <InputComponent
            key={`code-input-${index}`}
            id={`code-input-${index}`}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            autoFocus={index === 0}
            className='rounded-full w-10 h-10 p-0 text-center' />
        ))}
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <ButtonComponent className='rounded-full h-10' content='Xác thực' type='primary'
          block
          onClick={handleVerify}
          disabled={verificationCode.some((digit) => !digit)} />
        <ButtonComponent className='rounded-full h-10' type='default' content='Hủy' onClick={handleCancel} />
      </div>
      <div className="flex justify-center items-center">
        <p>Bạn chưa nhận được mã xác thực? <a className='text-blue-500 ' onClick={handleResendCode} >gửi lại mã</a></p>
      </div>
    </div>





    // <div className=''>
    //   <Card className='verify-code-card'>
    //     <h1 className='verify-code-title'>Nhập mã xác thực</h1>
    //     <p className='verify-code-subtitle'>
    //       Nhập mã xác thực 6 ký tự đã gửi về email
    //     </p>

    //     <div className='verify-code-form'>
    //       <div className='form-group'>
    //         <label className='form-label'>Mã xác thực:</label>
    //         <div className='otp-inputs'>
    //           {verificationCode.map((digit, index) => (
    //             <Input
    //               key={`code-input-${index}`}
    //               id={`code-input-${index}`}
    //               className='otp-input'
    //               value={digit}
    //               onChange={(e) => handleCodeChange(index, e.target.value)}
    //               onKeyDown={(e) => handleKeyDown(index, e)}
    //               maxLength={1}
    //               autoFocus={index === 0}
    //             />
    //           ))}
    //         </div>
    //       </div>

    //       <Button
    //         className='verify-button'
    //         type='primary'
    //         block
    //         onClick={handleVerify}
    //         disabled={verificationCode.some((digit) => !digit)}
    //       >
    //         Xác nhận
    //       </Button>

    //       <div className='action-buttons'>
    //         <Button
    //           className='resend-button'
    //           type='primary'
    //           onClick={handleResendCode}
    //           loading={isLoadingGetResendOtp}
    //           disabled={isLoadingGetResendOtp}
    //         >
    //           Gửi lại mã
    //         </Button>
    //         <Button
    //           className='cancel-button'
    //           onClick={handleCancel}
    //         >
    //           Hủy
    //         </Button>
    //       </div>
    //     </div>
    //   </Card>
    // </div>
  )
}

export default VerifyCode2
