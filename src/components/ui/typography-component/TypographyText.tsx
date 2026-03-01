import React from 'react';
import { Typography } from 'antd';
import { TextProps } from 'antd/es/typography/Text';

export interface TypographyTextProps extends TextProps {
    className?: string;
    style?: React.CSSProperties;
}

const TypographyText: React.FC<TypographyTextProps> = (props) => {
    return <Typography.Text {...props} />;
};

export default TypographyText;
