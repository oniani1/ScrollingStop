import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/ui';
import { ACHIEVEMENTS_LIST } from '../../utils/constants';

// Demo: first 4 unlocked
const UNLOCKED_IDS = new Set([
  'first_trade',
  'streak_7',
  'profit_1000',
  'zero_bypass_week',
]);

const UNLOCKED_DATES: Record<string, string> = {
  first_trade: 'MAR 2',
  streak_7: 'MAR 9',
  profit_1000: 'MAR 12',
  zero_bypass_week: 'MAR 15',
};

const unlockedCount = UNLOCKED_IDS.size;
const totalCount = ACHIEVEMENTS_LIST.length;
const progressPercent = Math.round((unlockedCount / totalCount) * 100);

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const cardGap = 10;
  const horizontalPad = 24;
  const cardWidth = (width - horizontalPad * 2 - cardGap) / 2;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Header */}
        <View style={styles.progressSection}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressCount}>
                {unlockedCount} of {totalCount} unlocked
              </Text>
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* 2-column grid */}
        <View style={styles.grid}>
          {ACHIEVEMENTS_LIST.map((achievement) => {
            const isUnlocked = UNLOCKED_IDS.has(achievement.id);
            const hasTarget = 'target' in achievement && achievement.target;
            const dateLabel = UNLOCKED_DATES[achievement.id];

            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { width: cardWidth },
                  isUnlocked
                    ? styles.unlockedCard
                    : styles.lockedCard,
                ]}
              >
                {/* Top row: icon + badge/lock */}
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.iconBox,
                      isUnlocked ? styles.iconBoxUnlocked : styles.iconBoxLocked,
                    ]}
                  >
                    <Icon
                      name={mapIconName(achievement.icon)}
                      size={22}
                      color={
                        isUnlocked
                          ? colors.primary
                          : colors.onSurfaceVariant
                      }
                    />
                  </View>
                  {isUnlocked && dateLabel ? (
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeText}>{dateLabel}</Text>
                    </View>
                  ) : hasTarget ? (
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>
                        0/{achievement.target}
                      </Text>
                    </View>
                  ) : !isUnlocked ? (
                    <Icon
                      name="lock"
                      size={16}
                      color={colors.onSurfaceVariant}
                      style={{ opacity: 0.5 }}
                    />
                  ) : null}
                </View>

                {/* Title + subtitle */}
                <Text
                  style={[
                    styles.cardTitle,
                    !isUnlocked && styles.lockedText,
                  ]}
                  numberOfLines={2}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.cardSubtitle,
                    !isUnlocked && styles.lockedText,
                  ]}
                  numberOfLines={1}
                >
                  {achievement.subtitle}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Maps custom icon names from constants to MaterialIcons names.
 */
function mapIconName(icon: string): string {
  const mapping: Record<string, string> = {
    rocket: 'rocket-launch',
    local_fire_department: 'local-fire-department',
    crown: 'workspace-premium',
    payments: 'payments',
    shield: 'shield',
    timer: 'timer',
    diamond: 'diamond',
    gem_spark: 'auto-awesome',
  };
  return mapping[icon] ?? icon;
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
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  progressLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  progressCount: {
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.02 * 30,
  },
  progressPercent: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // Cards
  achievementCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    minHeight: 160,
  },
  unlockedCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: 'rgba(79,140,255,0.2)',
    // Simulated inner glow via shadow
    shadowColor: 'rgba(79,140,255,0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
  },
  lockedCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(66,71,83,0.1)',
    opacity: 0.6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnlocked: {
    backgroundColor: 'rgba(79,140,255,0.1)',
  },
  iconBoxLocked: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  dateBadge: {
    backgroundColor: 'rgba(79,140,255,0.15)',
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  dateBadgeText: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  progressBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  progressBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  },
  lockedText: {
    opacity: 0.8,
  },
});
