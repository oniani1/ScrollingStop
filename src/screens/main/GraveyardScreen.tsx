import React, { useMemo, useState } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { DailyStats } from '../../types/models';
import { colors } from '../../theme/colors';
import { Icon, GlassCard } from '../../components/ui';
import { useStatsStore } from '../../stores/useStatsStore';
import { useAppStore } from '../../stores/useAppStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import dayjs from 'dayjs';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CELL_GAP = 4;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getCellColor(day: DailyStats | undefined, dailyLimit: number): string {
  if (!day) return colors.surfaceContainerLowest;
  if (day.bypasses >= 2) return '#FF4444';
  if (day.bypasses >= 1) return '#FF6B6B';
  // Clean day — green intensity based on screen time ratio
  const ratio = dailyLimit > 0 ? day.screenTimeMinutes / dailyLimit : 0;
  if (ratio < 0.3) return '#4ADE80';
  if (ratio < 0.6) return '#38B865';
  if (ratio < 0.85) return '#2A7A48';
  return '#1E5C36';
}

function computeLongestStreak(stats: DailyStats[]): number {
  if (stats.length === 0) return 0;
  const sorted = [...stats].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let current = 0;
  let prevDate: string | null = null;

  for (const s of sorted) {
    if (s.bypasses === 0) {
      if (prevDate && dayjs(s.date).diff(dayjs(prevDate), 'day') === 1) {
        current++;
      } else {
        current = 1;
      }
      longest = Math.max(longest, current);
      prevDate = s.date;
    } else {
      current = 0;
      prevDate = s.date;
    }
  }
  return longest;
}

export default function GraveyardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const dailyStats = useStatsStore((s) => s.dailyStats);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const cellSize = (width - 48 - 6 * CELL_GAP - 20) / 7;

  const { weeks, statsMap, longestStreak, cleanDays } = useMemo(() => {
    const map = new Map<string, DailyStats>();
    dailyStats.forEach((s) => map.set(s.date, s));

    const longest = computeLongestStreak(dailyStats);
    const clean = dailyStats.filter((s) => s.bypasses === 0).length;

    // Build grid: from earliest date (or 12 weeks ago) to today
    const today = dayjs();
    const earliest = dailyStats.length > 0
      ? dayjs(
          [...dailyStats].sort((a, b) => a.date.localeCompare(b.date))[0].date,
        )
      : today.subtract(12, 'week');

    // Align to start of week (Sunday)
    const gridStart = earliest.startOf('week');
    const gridEnd = today.endOf('week');

    const weeksList: string[][] = [];
    let cursor = gridStart;

    while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
      const weekDays: string[] = [];
      for (let d = 0; d < 7; d++) {
        weekDays.push(cursor.format('YYYY-MM-DD'));
        cursor = cursor.add(1, 'day');
      }
      weeksList.push(weekDays);
    }

    return {
      weeks: weeksList,
      statsMap: map,
      longestStreak: longest,
      cleanDays: clean,
    };
  }, [dailyStats]);

  const selectedDay = selectedDate ? statsMap.get(selectedDate) : null;
  const today = dayjs().format('YYYY-MM-DD');

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
        <Text style={styles.headerTitle}>Doom Scroll Graveyard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{longestStreak}</Text>
            <Text style={styles.summaryLabel}>LONGEST{'\n'}STREAK</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{cleanDays}</Text>
            <Text style={styles.summaryLabel}>CLEAN{'\n'}DAYS</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {currentStreak}
            </Text>
            <Text style={styles.summaryLabel}>CURRENT{'\n'}STREAK</Text>
          </GlassCard>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.legendText}>Clean</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2A7A48' }]} />
            <Text style={styles.legendText}>Near limit</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Bypass</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
            <Text style={styles.legendText}>Heavy</Text>
          </View>
        </View>

        {/* Day Labels */}
        <View style={[styles.dayLabelsRow, { paddingLeft: 10 }]}>
          {DAY_LABELS.map((label, i) => (
            <Text
              key={i}
              style={[styles.dayLabel, { width: cellSize, marginRight: i < 6 ? CELL_GAP : 0 }]}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((dateStr, di) => {
                const stat = statsMap.get(dateStr);
                const isFuture = dateStr > today;
                const isSelected = dateStr === selectedDate;
                const bg = isFuture
                  ? 'transparent'
                  : getCellColor(stat, dailyLimitMinutes);

                return (
                  <TouchableOpacity
                    key={dateStr}
                    activeOpacity={0.7}
                    onPress={() => !isFuture && setSelectedDate(isSelected ? null : dateStr)}
                    style={[
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                        marginRight: di < 6 ? CELL_GAP : 0,
                        backgroundColor: bg,
                        borderColor: isSelected
                          ? colors.primary
                          : isFuture
                            ? colors.surfaceContainerLowest
                            : 'transparent',
                        borderWidth: isSelected ? 2 : isFuture ? 1 : 0,
                      },
                    ]}
                    disabled={isFuture}
                  >
                    {stat && stat.bypasses >= 2 && (
                      <Text style={styles.skullText}>💀</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected Day Detail */}
        {selectedDate && (
          <GlassCard style={styles.detailCard}>
            <Text style={styles.detailDate}>
              {dayjs(selectedDate).format('dddd, MMM D, YYYY')}
            </Text>
            {selectedDay ? (
              <View style={styles.detailGrid}>
                <View style={styles.detailRow}>
                  <Icon name="timer" size={16} color={colors.primary} />
                  <Text style={styles.detailLabel}>Screen Time</Text>
                  <Text style={styles.detailValue}>
                    {selectedDay.screenTimeMinutes}m
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="vpn-key" size={16} color={colors.success} />
                  <Text style={styles.detailLabel}>Trade Unlocks</Text>
                  <Text style={styles.detailValue}>
                    {selectedDay.tradeUnlocks}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon
                    name="warning"
                    size={16}
                    color={
                      selectedDay.bypasses > 0 ? colors.error : colors.onSurfaceVariant
                    }
                  />
                  <Text style={styles.detailLabel}>Bypasses</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      selectedDay.bypasses > 0 && { color: colors.error },
                    ]}
                  >
                    {selectedDay.bypasses}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="attach-money" size={16} color={colors.tertiary} />
                  <Text style={styles.detailLabel}>Profit</Text>
                  <Text style={styles.detailValue}>
                    ${selectedDay.totalProfit.toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.detailEmpty}>No data recorded</Text>
            )}
          </GlassCard>
        )}
      </ScrollView>
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
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  summaryValue: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.02 * 28,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 4,
  },
  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  // Day labels
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.5,
  },
  // Grid
  gridContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: CELL_GAP,
  },
  cell: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skullText: {
    fontSize: 14,
  },
  // Detail card
  detailCard: {
    marginTop: 4,
  },
  detailDate: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 14,
  },
  detailGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  detailValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  detailEmpty: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
});
