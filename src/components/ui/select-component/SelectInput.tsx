import React from 'react';
import { Select } from 'antd';
import './style.css'
import { SelectProps, DefaultOptionType } from 'antd/es/select';

interface props extends SelectProps {
    // antd gọi onChange với `option` có thể vắng mặt, nên khai báo optional
    // cho khớp; handler nhận đủ 2 tham số vẫn gán được vào chữ ký này.
    handleChange?: (value: string | number, option?: DefaultOptionType | DefaultOptionType[]) => void
    data?: DefaultOptionType[]
    defaultValue?: string | number
    value?: string | number
}
const SelectInput: React.FC<props> = ({ handleChange, data, defaultValue, value, ...props }) => {
    const normalizedValue = value === '' || value === undefined ? undefined : value;
    
    return (
        <Select
            style={{ width: '100%' }}
            placeholder="Chọn"
            defaultValue={defaultValue}
            value={normalizedValue}
            onChange={handleChange}
            options={data}
            {...props}
        />
    );
};

export default SelectInput;