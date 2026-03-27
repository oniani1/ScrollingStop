import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/ui';
import { useAppStore, useStatsStore } from '../../stores';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const SHARE_BUTTONS = [
  {
    id: 'instagram',
    icon: 'photo-camera',
    colors: ['#f9ce34', '#ee2a7b'],
    iconColor: '#FFFFFF',
    bg: '#ee2a7b',
  },
  {
    id: 'twitter',
    icon: 'close',
    colors: ['#FFFFFF'],
    iconColor: '#000000',
    bg: '#FFFFFF',
  },
  {
    id: 'copy',
    icon: 'link',
    colors: [colors.surfaceContainerHigh],
    iconColor: '#FFFFFF',
    bg: colors.surfaceContainerHigh,
    border: true,
  },
  {
    id: 'more',
    icon: 'more-horiz',
    colors: [colors.surfaceContainerHigh],
    iconColor: '#FFFFFF',
    bg: colors.surfaceContainerHigh,
    border: true,
  },
];

export default function ShareStatsModal() {
  const navigation = useNavigation<Nav>();
  const currentStreak = useAppStore((s) => s.currentStreak);
  const totalProfit = useAppStore((s) => s.totalProfit);
  const totalUnlocks = useStatsStore((s) => s.totalUnlocks);
  const todayScreenTime = useAppStore((s) => s.todayScreenTime);

  const stats = {
    daysFree: currentStreak,
    earned: `$${totalProfit.toLocaleString()}`,
    unlocks: String(totalUnlocks),
    avgPerDay: `${todayScreenTime}m`,
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've been ${stats.daysFree} days scroll-free with ScrollStop! Earned ${stats.earned} in forced profits from ${stats.unlocks} trade unlocks. Stop scrolling, start trading.`,
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
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Stats</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Story card */}
          <View style={styles.storyCardShadow}>
            <View style={styles.storyCard}>
              {/* Background */}
              <View style={styles.cardBg} />

              {/* Radial glow spots */}
              <View style={styles.glowTopLeft} />
              <View style={styles.glowBottomRight} />

              {/* Card content */}
              <View style={styles.cardContent}>
                {/* Top: Logo */}
                <View style={styles.cardTop}>
                  <View style={styles.logoCard}>
                    <Icon name="rocket-launch" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.brandName}>ScrollStop</Text>
                  <Text style={styles.tagline}>STOP SCROLLING. START TRADING.</Text>
                </View>

                {/* Center hero */}
                <View style={styles.cardCenter}>
                  <Text style={styles.heroNumber}>{stats.daysFree} days</Text>
                  <Text style={styles.heroLabel}>scroll-free</Text>
                </View>

                {/* Bottom: Stats grid */}
                <View style={styles.cardBottom}>
                  {/* Gradient divider */}
                  <View style={styles.gradientDivider}>
                    <View style={styles.dividerLeft} />
                    <View style={styles.dividerCenter} />
                    <View style={styles.dividerRight} />
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.earned}</Text>
                      <Text style={styles.statLabel}>EARNED</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.unlocks}</Text>
                      <Text style={styles.statLabel}>UNLOCKS</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{stats.avgPerDay}</Text>
                      <Text style={styles.statLabel}>AVG/DAY</Text>
                    </View>
                  </View>

                  {/* Watermark */}
                  <Text style={styles.watermark}>scrollstop.app</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Share section */}
          <View style={styles.shareSection}>
            <Text style={styles.shareLabel}>SHARE TO...</Text>
            <View style={styles.shareButtons}>
              {SHARE_BUTTONS.map((btn) => (
                <TouchableOpacity
                  key={btn.id}
                  style={[
                    styles.shareButton,
                    { backgroundColor: btn.bg },
                    btn.border && styles.shareButtonBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={handleShare}
                >
                  <Icon name={btn.icon} size={24} color={btn.iconColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Download button */}
          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('Download', 'Image download will be available in a future update.');
            }}
          >
            <Icon name="download" size={20} color={colors.primary} />
            <Text style={styles.downloadText}>Download Image</Text>
          </TouchableOpacity>
        </ScrollView>
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,24,0.4)',
  },
  backButton: {
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  // Story card
  storyCardShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
    marginBottom: 32,
  },
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E3A8A',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(79,140,255,0.2)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(208,188,255,0.2)',
  },
  cardContent: {
    flex: 1,
    padding: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Card top
  cardTop: {
    alignItems: 'center',
    gap: 8,
  },
  logoCard: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brandName: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.2 * 12,
    textTransform: 'uppercase',
  },
  // Card center
  cardCenter: {
    alignItems: 'center',
  },
  heroNumber: {
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.04 * 64,
  },
  heroLabel: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(79,140,255,0.9)',
    marginTop: 4,
  },
  // Card bottom
  cardBottom: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  gradientDivider: {
    width: '100%',
    height: 1,
    flexDirection: 'row',
  },
  dividerLeft: {
    flex: 1,
    backgroundColor: 'rgba(79,140,255,0.0)',
  },
  dividerCenter: {
    flex: 2,
    backgroundColor: 'rgba(79,140,255,0.4)',
  },
  dividerRight: {
    flex: 1,
    backgroundColor: 'rgba(79,140,255,0.0)',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2 * 10,
    textTransform: 'uppercase',
  },
  watermark: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  // Share section
  shareSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  shareLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2 * 12,
    textTransform: 'uppercase',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonBorder: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  // Download button
  downloadButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(66,71,83,0.3)',
    borderRadius: 9999,
    paddingVertical: 16,
  },
  downloadText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
});
