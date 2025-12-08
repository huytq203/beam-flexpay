import React from 'react';
import { Select } from 'antd';
import type { SelectProps as AntdSelectProps } from 'antd';
import './style.scss'
interface OptionItem {
    label: string;
    value: string;
}
interface SelectProps {
    handleChange?: AntdSelectProps['onChange']
    data?: OptionItem[]
}
const SelectInput: React.FC<SelectProps> = ({ handleChange, data }) => (
    <Select
        allowClear
        onChange={handleChange}
        options={data}
        placeholder="Chọn"
        style={{ width: '100%' }}
    />
);

export default SelectInput;