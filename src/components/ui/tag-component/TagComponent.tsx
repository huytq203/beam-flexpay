import React from 'react';
import { Tag, TagProps } from 'antd';

export interface TagComponentProps extends TagProps {
    className?: string;
    style?: React.CSSProperties;
}

const TagComponent: React.FC<TagComponentProps> = (props) => {
    return <Tag {...props} />;
};

export default TagComponent;
