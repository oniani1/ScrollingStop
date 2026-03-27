import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import {
  GlassCard,
  PrimaryButton,
  StepIndicator,
  ToggleSwitch,
  Icon,
} from '../../components/ui';
import { useOnboardingStore } from '../../stores';
import { usePermissions } from '../../hooks/usePermissions';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

interface PermissionItem {
  key: 'usageAccessGranted' | 'overlayPermissionGranted' | 'batteryOptExcluded';
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}

const PERMISSIONS: PermissionItem[] = [
  {
    key: 'usageAccessGranted',
    icon: 'visibility',
    iconColor: '#FFFFFF',
    iconBg: colors.primary,
    title: 'Usage Access',
    subtitle: 'See which apps you use and for how long',
  },
  {
    key: 'overlayPermissionGranted',
    icon: 'layers',
    iconColor: '#d0bcff',
    iconBg: 'rgba(87,27,193,0.25)',
    title: 'Draw Over Apps',
    subtitle: 'Show the block screen when time\'s up',
  },
  {
    key: 'batteryOptExcluded',
    icon: 'battery-charging-full',
    iconColor: colors.onSurfaceVariant,
    iconBg: colors.surfaceContainerHighest,
    title: 'Battery Optimization',
    subtitle: 'Keep monitoring running in the background',
  },
];

export default function PermissionsScreen() {
  const navigation = useNavigation<Nav>();
  const {
    usageAccessGranted,
    overlayPermissionGranted,
    batteryOptExcluded,
  } = useOnboardingStore();

  const { requestUsageAccess, requestOverlay, requestBattery, checkAll } = usePermissions();

  const permissionStates: Record<string, boolean> = {
    usageAccessGranted,
    overlayPermissionGranted,
    batteryOptExcluded,
  };

  const requesters: Record<string, () => Promise<void>> = {
    usageAccessGranted: requestUsageAccess,
    overlayPermissionGranted: requestOverlay,
    batteryOptExcluded: requestBattery,
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.stepHeaderLabel}>STEP 1 OF 4</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <StepIndicator totalSteps={4} currentStep={0} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          ScrollStop needs a few permissions to work properly
        </Text>

        {/* Permission cards */}
        <View style={styles.cardList}>
          {PERMISSIONS.map((perm) => {
            const granted = permissionStates[perm.key];
            return (
              <GlassCard
                key={perm.key}
                style={styles.permCard}
                borderLeftColor={granted ? colors.primary : undefined}
              >
                <View style={styles.permRow}>
                  <View style={[styles.permIcon, { backgroundColor: perm.iconBg }]}>
                    <Icon name={perm.icon} size={24} color={perm.iconColor} />
                  </View>
                  <View style={styles.permText}>
                    <Text style={styles.permTitle}>{perm.title}</Text>
                    <Text style={styles.permSub}>{perm.subtitle}</Text>
                  </View>
                  {granted ? (
                    <Icon name="check-circle" size={28} color={colors.success} />
                  ) : (
                    <ToggleSwitch
                      value={false}
                      onValueChange={async () => {
                        await requesters[perm.key]();
                        // Re-check permissions after returning from settings
                        setTimeout(checkAll, 1000);
                      }}
                    />
                  )}
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom fixed button with gradient fade */}
      <View style={styles.bottomArea}>
        <View style={styles.gradientFade} />
        <View style={styles.bottomInner}>
          <PrimaryButton
            title="Continue"
            icon="arrow-forward"
            onPress={() => navigation.navigate('SetLimits')}
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
  stepHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  headerSpacer: {
    width: 40,
  },
  stepRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: colors.onSurface,
    letterSpacing: -2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    lineHeight: 26,
    marginBottom: 32,
  },
  cardList: {
    gap: 12,
  },
  permCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permText: {
    flex: 1,
    marginRight: 12,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    marginBottom: 4,
  },
  permSub: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    lineHeight: 18,
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
