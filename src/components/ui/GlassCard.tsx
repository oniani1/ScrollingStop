import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  borderLeftColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  borderLeftColor,
}) => {
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    borderLeftColor ? { borderLeftWidth: 4, borderLeftColor } : undefined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(19,19,24,0.4)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    padding: 20,
  },
});

export default GlassCard;
