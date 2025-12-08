import React from 'react';
import { Select } from 'antd';
import type { SelectProps as AntdSelectProps } from 'antd';
import './style.scss'
interface OptionItem {
    label: string;
    value: string | number;

}
interface SelectProps {
    handleChange?: AntdSelectProps['onChange']
    data?: OptionItem[]
    defaultValue?: string | number
}
const SelectInput: React.FC<SelectProps> = ({ handleChange, data, defaultValue }) => (
    <Select
        defaultValue={defaultValue}
        allowClear
        onChange={handleChange}
        options={data}
        placeholder="Chọn"
        style={{ width: '100%' }}
    />
);

export default SelectInput;