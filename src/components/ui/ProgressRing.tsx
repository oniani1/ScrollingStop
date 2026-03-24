import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel: string;
  badgeText?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 256,
  strokeWidth = 3,
  label,
  sublabel,
  badgeText,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        {/* Track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primaryContainer}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sublabel}>{sublabel}</Text>
        {badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.02 * 48,
  },
  sublabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
});

export default ProgressRing;
