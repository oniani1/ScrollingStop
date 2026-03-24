import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { Icon, PrimaryButton } from '../../components/ui';

type CelebrationRoute = RouteProp<RootStackParamList, 'Celebration'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Demo fallback data
const DEMO_TRADE = {
  pair: 'BTC/USDT',
  profit: 34.5,
  profitPercent: 12.4,
  source: 'binance' as const,
};

// Confetti pieces data
const CONFETTI_PIECES = [
  { top: '12%', left: '8%', color: colors.tertiary, w: 6, h: 6, rotate: '25deg', round: true },
  { top: '18%', left: '75%', color: colors.secondary, w: 8, h: 4, rotate: '-15deg', round: false },
  { top: '25%', left: '85%', color: colors.primaryContainer, w: 6, h: 6, rotate: '45deg', round: true },
  { top: '35%', left: '5%', color: colors.tertiaryContainer, w: 8, h: 4, rotate: '60deg', round: false },
  { top: '55%', left: '90%', color: colors.tertiary, w: 6, h: 6, rotate: '-30deg', round: true },
  { top: '65%', left: '12%', color: colors.secondary, w: 8, h: 4, rotate: '10deg', round: false },
  { top: '72%', left: '82%', color: colors.primaryContainer, w: 6, h: 6, rotate: '-55deg', round: true },
  { top: '78%', left: '20%', color: colors.tertiaryContainer, w: 8, h: 4, rotate: '35deg', round: false },
  { top: '45%', left: '3%', color: colors.tertiary, w: 6, h: 6, rotate: '70deg', round: true },
  { top: '8%', left: '50%', color: colors.secondary, w: 8, h: 4, rotate: '-40deg', round: false },
  { top: '88%', left: '65%', color: colors.primaryContainer, w: 6, h: 6, rotate: '15deg', round: true },
  { top: '40%', left: '92%', color: colors.tertiaryContainer, w: 6, h: 6, rotate: '-20deg', round: true },
];

export default function TradeUnlockCelebrationModal() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<CelebrationRoute>();

  const trade = route.params?.trade ?? DEMO_TRADE;
  const profitAmount = trade.profit ?? DEMO_TRADE.profit;
  const profitPercent = trade.profitPercent ?? DEMO_TRADE.profitPercent;
  const pair = trade.pair ?? DEMO_TRADE.pair;
  const source = trade.source ?? DEMO_TRADE.source;
  const direction = profitAmount >= 0 ? 'Long' : 'Short';
  const streakCount = 5;

  return (
    <View style={styles.container}>
      {/* Confetti layer */}
      <View style={styles.confettiLayer} pointerEvents="none">
        {CONFETTI_PIECES.map((piece, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: piece.top as any,
              left: piece.left as any,
              width: piece.w,
              height: piece.h,
              backgroundColor: piece.color,
              borderRadius: piece.round ? piece.w / 2 : 1,
              transform: [{ rotate: piece.rotate }],
            }}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trade Success</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Radial glow background */}
          <View style={styles.radialGlow}>
            <View style={styles.glowCircleOuter} />
            <View style={styles.glowCircleMiddle} />
            <View style={styles.glowCircleInner} />
          </View>

          {/* Success circle */}
          <View style={styles.successCircleWrapper}>
            <View style={styles.successCircle}>
              <Icon name="check-circle" size={64} color="#FFFFFF" />
            </View>
            {/* Floating profit badge */}
            <View style={styles.profitBadge}>
              <Icon name="trending-up" size={14} color={colors.success} />
              <Text style={styles.profitBadgeText}>
                +${profitAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Unlocked!</Text>
          <Text style={styles.subtitle}>
            You're back in. Don't waste it.
          </Text>

          {/* Trade details card */}
          <View style={styles.tradeCard}>
            {/* Decorative icon */}
            <View style={styles.decorativeIcon}>
              <Icon name="currency-bitcoin" size={80} color="rgba(255,255,255,0.1)" />
            </View>

            {/* Trade info row */}
            <View style={styles.tradeInfoRow}>
              <View style={styles.tradeInfoLeft}>
                <View style={styles.boltCircle}>
                  <Icon name="bolt" size={18} color={colors.tertiary} />
                </View>
                <Text style={styles.tradePair}>
                  {pair} {direction}
                </Text>
              </View>
              <Text style={styles.tradeProfitPercent}>
                +{profitPercent.toFixed(1)}% profit
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Exchange row */}
            <View style={styles.exchangeRow}>
              <Icon name="hub" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.exchangeText}>
                via {source.charAt(0).toUpperCase() + source.slice(1)}
              </Text>
            </View>
          </View>

          {/* Streak display */}
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>
              {streakCount}-DAY TRADE STREAK!
            </Text>
            <View style={styles.streakIcons}>
              {Array.from({ length: streakCount }).map((_, i) => (
                <Icon
                  key={i}
                  name="shield"
                  size={24}
                  color={colors.primary}
                  style={styles.streakIcon}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Bottom button */}
        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,24,0.4)',
  },
  closeButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  headerSpacer: {
    width: 40,
  },
  // Main content
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Radial glow
  radialGlow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircleOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(82,141,255,0.06)',
  },
  glowCircleMiddle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(82,141,255,0.1)',
  },
  glowCircleInner: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(82,141,255,0.15)',
  },
  // Success circle
  successCircleWrapper: {
    marginBottom: 28,
  },
  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(82,141,255,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
  profitBadge: {
    position: 'absolute',
    top: -4,
    right: -28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 4,
    shadowColor: 'rgba(74,222,128,0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  profitBadgeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  // Headline
  headline: {
    fontFamily: 'Inter',
    fontSize: 56,
    fontWeight: '900',
    color: colors.onSurface,
    letterSpacing: -0.04 * 56,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginBottom: 32,
  },
  // Trade card
  tradeCard: {
    width: '100%',
    backgroundColor: 'rgba(27,27,32,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 28,
  },
  decorativeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  tradeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tradeInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  boltCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,183,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradePair: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  tradeProfitPercent: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
  },
  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exchangeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.2 * 12,
  },
  // Streak
  streakContainer: {
    alignItems: 'center',
    gap: 12,
  },
  streakLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.2 * 10,
  },
  streakIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  streakIcon: {
    // individual icon style if needed
  },
  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
