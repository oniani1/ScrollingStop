import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import {
  GlassCard,
  PrimaryButton,
  StepIndicator,
  Icon,
} from '../../components/ui';
import { useSettingsStore } from '../../stores';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export default function SetLimitsScreen() {
  const navigation = useNavigation<Nav>();
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);
  const profitThreshold = useSettingsStore((s) => s.profitThreshold);
  const setDailyLimit = useSettingsStore((s) => s.setDailyLimit);
  const setProfitThreshold = useSettingsStore((s) => s.setProfitThreshold);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ScrollStop</Text>
        <Icon name="lock" size={24} color={colors.onSurfaceVariant} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <StepIndicator totalSteps={4} currentStep={1} />
      </View>
      <Text style={styles.stepLabel}>Step 2 of 4</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Set Your Limits</Text>
        <Text style={styles.subtitle}>How much scrolling is too much?</Text>

        {/* Daily Screen Time Limit */}
        <GlassCard style={styles.limitCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>DAILY SCREEN TIME LIMIT</Text>
            <Icon name="timer" size={20} color={colors.onSurfaceVariant} />
          </View>
          <Text style={styles.cardSub}>Control your digital consumption</Text>

          <View style={styles.valueRow}>
            <Text style={styles.valueBig}>{dailyLimitMinutes}</Text>
            <Text style={styles.valueUnit}> min</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={180}
            step={5}
            value={dailyLimitMinutes}
            onValueChange={(val) => setDailyLimit(Math.round(val))}
            minimumTrackTintColor={colors.primaryContainer}
            maximumTrackTintColor={colors.surfaceContainerHighest}
            thumbTintColor={colors.primaryContainer}
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>5 MIN</Text>
            <Text style={styles.sliderLabel}>180 MIN</Text>
          </View>
        </GlassCard>

        {/* Profit Threshold */}
        <GlassCard style={styles.limitCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>PROFIT THRESHOLD</Text>
            <Icon name="trending-up" size={20} color="#d0bcff" />
          </View>
          <Text style={styles.cardSub}>Minimum trade profit to unlock</Text>

          <View style={styles.valueRow}>
            <Text style={styles.valueBigWhite}>${profitThreshold}</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={1000}
            step={10}
            value={profitThreshold}
            onValueChange={(val) => setProfitThreshold(Math.round(val))}
            minimumTrackTintColor={colors.primaryContainer}
            maximumTrackTintColor={colors.surfaceContainerHighest}
            thumbTintColor={colors.primaryContainer}
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>$10</Text>
            <Text style={styles.sliderLabel}>$1,000</Text>
          </View>
        </GlassCard>

        {/* Info row */}
        <View style={styles.infoRow}>
          <Icon name="info-outline" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.infoText}>
            You can change these anytime in Settings
          </Text>
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomArea}>
        <View style={styles.gradientFade} />
        <View style={styles.bottomInner}>
          <PrimaryButton
            title="Continue"
            icon="arrow-forward"
            onPress={() => navigation.navigate('TradingSetup')}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  stepRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: colors.onSurface,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    marginBottom: 32,
  },
  limitCard: {
    padding: 32,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.onSurfaceVariant,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    marginBottom: 24,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  valueBig: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'Inter',
    color: colors.primaryContainer,
  },
  valueUnit: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.primaryContainer,
  },
  valueBigWhite: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'Inter',
    color: colors.onSurface,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    opacity: 0.4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientFade: {
    height: 40,
    backgroundColor: colors.background,
    opacity: 0.85,
  },
  bottomInner: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 4,
  },
});
