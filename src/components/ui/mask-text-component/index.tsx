import { EyeFilled, EyeOutlined } from '@components/icons'
import React, { useState } from 'react'

interface MaskTextProps {
    value?: string | null
    /** Số ký tự cuối hiển thị rõ, mặc định 4 */
    visibleCount?: number
    /** Ký tự thay thế, mặc định '***' */
    mask?: string
    className?: string
    active?: boolean
}

const MaskText: React.FC<MaskTextProps> = ({
    active = true,
    value,
    visibleCount = 4,
    mask = '*******',
    className,
}) => {
    const [visible, setVisible] = useState(false)
    if (!value) return <span className={className}>--</span>

    const masked =
        value.length > visibleCount
            ? `${mask}${value.slice(-visibleCount)}`
            : value

    if (!active) return <span className="font-medium">{masked}</span>
    return (
        <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
            <span className="font-medium">{visible ? value : masked}</span>
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="text-gray-400 hover:text-blue-500 transition-colors leading-none"
                title={visible ? 'Ẩn' : 'Hiển thị'}
            >
                {visible ? <EyeFilled style={{ fontSize: 14 }} /> : <EyeOutlined style={{ fontSize: 14 }} />}
            </button>
        </span>
    )
}

export default MaskText
