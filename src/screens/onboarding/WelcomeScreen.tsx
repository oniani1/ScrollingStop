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
import { GlassCard, PrimaryButton, Icon } from '../../components/ui';
import { useAppStore } from '../../stores';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const FEATURES = [
  {
    icon: 'shield',
    iconBg: colors.primary,
    iconColor: '#FFFFFF',
    title: 'Block distracting apps automatically',
    subtitle: 'DEEP FOCUS MODE',
  },
  {
    icon: 'trending-up',
    iconBg: 'rgba(87,27,193,0.2)',
    iconColor: '#d0bcff',
    title: 'Unlock by making profitable trades',
    subtitle: 'FINANCIAL DISCIPLINE',
  },
  {
    icon: 'emoji-events',
    iconBg: 'rgba(216,120,2,0.2)',
    iconColor: '#ffb77b',
    title: 'Build streaks and earn achievements',
    subtitle: 'GAMIFIED GROWTH',
  },
] as const;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Radial glow */}
      <View style={styles.glowOuter}>
        <View style={styles.glowInner} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shield icon in glass card */}
        <View style={styles.heroIconWrapper}>
          <GlassCard style={styles.shieldCard}>
            <Icon name="shield" size={48} color={colors.primary} />
          </GlassCard>
        </View>

        {/* Hero text */}
        <Text style={styles.heroTitle}>
          {'Stop scrolling.\nStart trading.'}
        </Text>
        <Text style={styles.heroSubtitle}>
          ScrollStop blocks social media when you've had enough. The only way
          out? Make a real crypto trade.
        </Text>

        {/* Feature cards */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <GlassCard key={f.subtitle} style={styles.featureCard}>
              <View style={styles.featureRow}>
                <View style={[styles.featureIconCircle, { backgroundColor: f.iconBg }]}>
                  <Icon name={f.icon} size={24} color={f.iconColor} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaArea}>
          <PrimaryButton
            title="Get Started"
            onPress={() => navigation.navigate('Permissions')}
            fullWidth
          />
          <TouchableOpacity
            onPress={completeOnboarding}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Already set up? Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowOuter: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 400,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowInner: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primary,
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroIconWrapper: {
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  shieldCard: {
    width: 96,
    height: 96,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: colors.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  featureList: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  featureCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  ctaArea: {
    width: '100%',
    alignItems: 'center',
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
});
