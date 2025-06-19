import { useState } from 'react'
import { Button, Card, Input } from 'antd'
import './style.scss'

const VerifyCode = () => {
  const [verificationCode, setVerificationCode] = useState([
    '',
    '',
    '',
    '',
    '',
    ''
  ])

  const handleVerify = () => {
    const code = verificationCode.join('')
    console.log('Xác nhận mã:', code)
  }

  const handleResendCode = () => {
    console.log('Gửi lại mã')
    // Reset code
    setVerificationCode(['', '', '', '', '', ''])
  }

  const handleCancel = () => {
    console.log('Hủy')
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
    <div className='verify-code-container'>
      <Card className='verify-code-card'>
        <h1 className='verify-code-title'>Nhập mã xác thực</h1>
        <p className='verify-code-subtitle'>
          Nhập mã xác thực 6 ký tự đã gửi về email
        </p>

        <div className='verify-code-form'>
          <div className='form-group'>
            <label className='form-label'>Mã xác thực:</label>
            <div className='otp-inputs'>
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  className='otp-input'
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <Button
            className='verify-button'
            type='primary'
            block
            onClick={handleVerify}
            disabled={verificationCode.some((digit) => !digit)}
          >
            Xác nhận
          </Button>

          <div className='action-buttons'>
            <Button
              className='resend-button'
              type='primary'
              onClick={handleResendCode}
            >
              Gửi lại mã
            </Button>
            <Button
              className='cancel-button'
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default VerifyCode
