import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 0-based
  stepLabel?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  stepLabel,
}) => {
  return (
    <View style={styles.container}>
      {stepLabel && <Text style={styles.stepLabel}>{stepLabel}</Text>}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              i === currentStep ? styles.activeDot : styles.inactiveDot,
              i < totalSteps - 1 ? styles.dotSpacing : undefined,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  stepLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2 * 10,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  dotSpacing: {
    marginRight: 6,
  },
});

export default StepIndicator;
