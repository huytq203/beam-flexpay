import React from 'react';
import { Select } from 'antd';
import type { SelectProps as AntdSelectProps } from 'antd';
import './style.scss'
interface OptionItem {
    label: string;
    value: string | number;

}
interface SelectProps extends AntdSelectProps {
    handleChange?: AntdSelectProps['onChange']
    data?: OptionItem[]
    defaultValue?: string | number
    value?: string | number
}
const SelectInput: React.FC<SelectProps> = ({ handleChange, data, defaultValue, value, ...props }) => (
    <Select
        {...props}
        defaultValue={defaultValue}
        value={value}
        allowClear
        onChange={handleChange}
        options={data}
        placeholder="Chọn"
        style={{ width: '100%' }}
    />
);

export default SelectInput;