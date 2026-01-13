import { CopyIcon } from "@components/icons/common"
import { useState } from "react"
import TooltipComponent from "../tooltip-component"

interface CopyableTextProps {
  value: string
  label?: string
}

 const CopyableText: React.FC<CopyableTextProps> = ({ value, label }) => {
  const [titleHover, setTitleHover] = useState('Copy')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setTitleHover('Copied!')
    } catch {
      setTitleHover('Wrong')
    }
  }

  const handleMouseEnter = () => {
    setTitleHover('Copy')
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-gray-500 flex gap-1 items-center">
        {label && <span>{label}</span>}
        
      </div>

      <div className="font-medium flex items-center gap-1">
        <span className="truncate" title={value}>{value}</span>
        <TooltipComponent title={titleHover}>
          <CopyIcon
            className="cursor-pointer hover:text-blue-500 text-gray-500 flex-shrink-0"
            onClick={copyToClipboard}
            onMouseEnter={handleMouseEnter}
          />
        </TooltipComponent>
      </div>
    </div>
  )
}
export default CopyableText