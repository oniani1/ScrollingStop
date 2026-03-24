import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { ProgressRing, Icon } from '../../components/ui';
import { useAppStore, useStatsStore, useSettingsStore } from '../../stores';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const todayScreenTime = useAppStore((s) => s.todayScreenTime);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const totalProfit = useAppStore((s) => s.totalProfit);
  const isUnlockedToday = useAppStore((s) => s.isUnlockedToday);
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);
  const totalUnlocks = useStatsStore((s) => s.totalUnlocks);
  const totalBypasses = useStatsStore((s) => s.totalBypasses);

  const progress = dailyLimitMinutes > 0 ? todayScreenTime / dailyLimitMinutes : 0;

  // Pulsing dot animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusColor = isUnlockedToday ? colors.primary : colors.success;
  const statusLabel = isUnlockedToday ? 'UNLOCKED' : 'ACTIVE';

  const handleCheckTrades = () => {
    console.log('Check for trades pressed');
  };

  // Demo data for display
  const displayProfit = totalProfit > 0 ? totalProfit : 2350;
  const displayStreak = currentStreak > 0 ? currentStreak : 12;
  const displayScreenTime = todayScreenTime > 0 ? todayScreenTime : 47;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="bubble-chart" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>ScrollStop</Text>
        </View>
        <TouchableOpacity style={styles.notifCircle} activeOpacity={0.7}>
          <Icon name="notifications" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Ring Section */}
        <View style={styles.ringSection}>
          <ProgressRing
            progress={Math.min(progress, 1)}
            size={256}
            strokeWidth={3}
            label={String(displayScreenTime)}
            sublabel="m"
          />

          {/* Limit badge */}
          <View style={styles.limitBadge}>
            <Text style={styles.limitBadgeText}>
              LIMIT: {dailyLimitMinutes}m
            </Text>
          </View>

          {/* Status indicator */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusColor + '1A',
                borderColor: statusColor + '33',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                  opacity: pulseAnim,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Bento Grid */}
        <View style={isWide ? styles.bentoGridWide : styles.bentoGrid}>
          {/* Forced Profits Card */}
          <View
            style={[
              styles.bentoCard,
              styles.profitCard,
              isWide && styles.profitCardWide,
            ]}
          >
            <View style={styles.profitHeader}>
              <Icon
                name="account-balance-wallet"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.cardLabel}>FORCED PROFITS</Text>
            </View>
            <Text style={styles.profitNumber}>
              ${displayProfit.toLocaleString()}
            </Text>
            <Text style={styles.profitDesc}>
              Total value saved by blocking impulsive scrolling
            </Text>
            <View style={styles.profitFooter}>
              <Text style={styles.growthLabel}>LIFETIME GROWTH</Text>
              <View style={styles.gradientLine} />
            </View>
            {/* Decorative icon */}
            <View style={styles.decorativeIcon}>
              <Icon
                name="trending-up"
                size={80}
                color={colors.onSurface}
                style={{ opacity: 0.1 }}
              />
            </View>
          </View>

          {/* Current Streak Card */}
          <View style={[styles.bentoCard, styles.streakCard]}>
            <View style={styles.streakIconCircle}>
              <Icon
                name="local-fire-department"
                size={24}
                color={colors.tertiaryContainer}
              />
            </View>
            <Text style={styles.cardLabel}>CURRENT STREAK</Text>
            <Text style={styles.streakNumber}>{displayStreak}</Text>
            <Text style={styles.streakSub}>Days Strong</Text>
          </View>

          {/* Daily Stats Card */}
          <View
            style={[
              styles.bentoCard,
              styles.statsCard,
              isWide && styles.statsCardWide,
            ]}
          >
            <View style={styles.statsHeader}>
              <Text style={styles.cardLabel}>DAILY STATS</Text>
              <Text style={styles.statsDate}>Today, {dateString}</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statRow}>
                <View style={styles.statRowLeft}>
                  <Icon
                    name="vpn-key"
                    size={18}
                    color={colors.primary}
                    style={styles.statIcon}
                  />
                  <View>
                    <Text style={styles.statTitle}>Trade Unlocks</Text>
                    <Text style={styles.statSubtitle}>
                      Trades verified today
                    </Text>
                  </View>
                </View>
                <Text style={styles.statCount}>{totalUnlocks}</Text>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statRowLeft}>
                  <Icon
                    name="lock-reset"
                    size={18}
                    color={colors.tertiary}
                    style={styles.statIcon}
                  />
                  <View>
                    <Text style={styles.statTitle}>Bypasses</Text>
                    <Text style={styles.statSubtitle}>
                      Shame phrase used today
                    </Text>
                  </View>
                </View>
                <Text style={styles.statCount}>{totalBypasses}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 70 }]}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={handleCheckTrades}
        >
          <Icon name="analytics" size={20} color="#FFFFFF" style={styles.fabIcon} />
          <Text style={styles.fabText}>Check for trades</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  notifCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  // Progress Ring
  ringSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 64,
  },
  limitBadge: {
    marginTop: 16,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(66,71,83,0.1)',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  limitBadgeText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statusPill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  // Bento Grid
  bentoGrid: {
    gap: 12,
  },
  bentoGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  // Profit Card
  profitCard: {
    position: 'relative',
  },
  profitCardWide: {
    flex: 2,
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  profitNumber: {
    fontFamily: 'Inter',
    fontSize: 40,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.02 * 40,
    marginBottom: 8,
  },
  profitDesc: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  profitFooter: {
    gap: 8,
  },
  growthLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  gradientLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  decorativeIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  // Streak Card
  streakCard: {
    alignItems: 'center',
  },
  streakIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(216,120,2,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  streakNumber: {
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.02 * 48,
    marginTop: 8,
  },
  streakSub: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: colors.tertiary,
    marginTop: 4,
  },
  // Stats Card
  statsCard: {},
  statsCardWide: {
    flexBasis: '100%',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsDate: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  statsGrid: {
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 16,
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statIcon: {
    width: 18,
  },
  statTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  statSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
  },
  statCount: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  fabIcon: {
    marginRight: 2,
  },
  fabText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
