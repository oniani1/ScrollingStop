import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import Icon from './Icon';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyle}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon && (
              <Icon
                name={icon}
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
            )}
            <Text style={styles.title}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignSelf: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PrimaryButton;
