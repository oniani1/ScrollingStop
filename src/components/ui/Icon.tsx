import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#e4e1e9',
  style,
}) => {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
};

export default Icon;
