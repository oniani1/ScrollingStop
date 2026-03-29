import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/ui';
import { useAppStore } from '../../stores/useAppStore';
import { useStatsStore } from '../../stores/useStatsStore';
import dayjs from 'dayjs';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ShameReceipt'>;

const DASHES = '================================';
const LINE = '--------------------------------';

export default function ShameReceiptModal() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phrase, durationMinutes, streakBroken, currentStreak } = route.params;

  const totalProfit = useAppStore((s) => s.totalProfit);
  const dailyStats = useStatsStore((s) => s.dailyStats);

  const now = dayjs();
  const dateStr = now.format('MMM DD, YYYY  h:mm A');

  // Opportunity cost: avg daily profit * fraction of day wasted
  const totalDays = Math.max(dailyStats.length, 1);
  const avgDailyProfit = totalProfit / totalDays;
  const opportunityCost = avgDailyProfit * (durationMinutes / 1440);

  const streakStatus = streakBroken
    ? `BROKEN (was ${currentStreak}d)`
    : currentStreak > 0
      ? `INTACT (${currentStreak}d)`
      : 'NO STREAK';

  const receiptText = [
    DASHES,
    '     SCROLLSTOP RECEIPT',
    '      SHAME DEPARTMENT',
    DASHES,
    `DATE: ${dateStr}`,
    LINE,
    `ACCESS GRANTED: ${durationMinutes} min`,
    LINE,
    'SHAME PHRASE TYPED:',
    `"${phrase}"`,
    LINE,
    `STREAK STATUS: ${streakStatus}`,
    `OPPORTUNITY COST: ~$${opportunityCost.toFixed(2)}`,
    '     (avg daily profit x time)',
    DASHES,
    '       THANK YOU FOR YOUR',
    '           WEAKNESS',
    DASHES,
  ].join('\n');

  const handleShare = async () => {
    try {
      await Share.share({
        message: receiptText + '\n\nScrollStop - Stop scrolling. Start trading.',
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shame Receipt</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Receipt */}
        <View style={styles.receiptOuter}>
          <View style={styles.receiptCard}>
            {/* Zigzag top edge */}
            <View style={styles.zigzagTop} />

            <Text style={styles.receiptHeader}>{DASHES}</Text>
            <Text style={styles.receiptCenter}>SCROLLSTOP RECEIPT</Text>
            <Text style={styles.receiptCenter}>SHAME DEPARTMENT</Text>
            <Text style={styles.receiptHeader}>{DASHES}</Text>

            <Text style={styles.receiptLine}>DATE: {dateStr}</Text>
            <Text style={styles.receiptDivider}>{LINE}</Text>

            <Text style={styles.receiptLine}>ACCESS GRANTED: {durationMinutes} min</Text>
            <Text style={styles.receiptDivider}>{LINE}</Text>

            <Text style={styles.receiptLabel}>SHAME PHRASE TYPED:</Text>
            <Text style={styles.receiptPhrase}>"{phrase}"</Text>
            <Text style={styles.receiptDivider}>{LINE}</Text>

            <Text style={styles.receiptLine}>STREAK: {streakStatus}</Text>
            <Text style={styles.receiptLine}>
              OPPORTUNITY COST: ~${opportunityCost.toFixed(2)}
            </Text>
            <Text style={styles.receiptSmall}>
              (avg daily profit x time)
            </Text>

            <Text style={styles.receiptHeader}>{DASHES}</Text>
            <Text style={styles.receiptCenter}>THANK YOU FOR YOUR</Text>
            <Text style={styles.receiptCenter}>WEAKNESS</Text>
            <Text style={styles.receiptHeader}>{DASHES}</Text>

            {/* Zigzag bottom edge */}
            <View style={styles.zigzagBottom} />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Icon name="share" size={18} color="#000000" />
            <Text style={styles.shareBtnText}>Share Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.dismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,24,0.4)',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  // Receipt
  receiptOuter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 24,
    overflow: 'hidden',
  },
  zigzagTop: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  zigzagBottom: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  receiptHeader: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 16,
  },
  receiptCenter: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 18,
  },
  receiptLine: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333333',
    lineHeight: 20,
  },
  receiptDivider: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 4,
  },
  receiptLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    lineHeight: 16,
  },
  receiptPhrase: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    lineHeight: 20,
    marginBottom: 2,
  },
  receiptSmall: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#999999',
    lineHeight: 14,
    marginBottom: 8,
  },
  // Buttons
  buttonArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: 9999,
    paddingVertical: 16,
    gap: 8,
  },
  shareBtnText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dismissBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
});
