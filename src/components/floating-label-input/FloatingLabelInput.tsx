import { useState } from 'react'
import './style.scss'
import { Input } from 'antd'

interface FloatingLabelInputProps {
  label: string
  [key: string]: any // Add other props as needed
}

const FloatingLabelInput = ({ label, ...rest }: FloatingLabelInputProps) => {
  const [focused, setFocused] = useState(false)
  const [borderFocused, setBorderFocused] = useState(false)

  const handleFocus = () => {
    setFocused(true)
    setBorderFocused(true)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setFocused(false)
    }
    setBorderFocused(false)
  }

  return (
    <div className={`floating-label-input focused`}>
      <Input
        disabled
        size='small'
        style={{ width: 'auto', backgroundColor: 'white', color: 'black' }}
        {...rest}
      />
      <label>{label}</label>
    </div>
  )
}

export default FloatingLabelInput
