import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/ui';
import { useAppStore } from '../../stores/useAppStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useTradeStore } from '../../stores/useTradeStore';
import { useTradeCheck } from '../../hooks/useTradeCheck';
import { usageStats } from '../../services/blockingManager';
import { fetchTickerPrices, type TickerPrice } from '../../services/cryptoPriceService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DISPLAY_NAMES: Record<string, string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
};

export default function BlockedScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const todayScreenTime = useAppStore((s) => s.todayScreenTime);
  const setScreenTime = useAppStore((s) => s.setScreenTime);
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);
  const bypassEnabled = useSettingsStore((s) => s.bypassEnabled);
  const binanceConnected = useTradeStore((s) => s.binanceConnected);
  const solanaConnected = useTradeStore((s) => s.solanaConnected);

  const { checking, checkTrades } = useTradeCheck();
  const hasTradeConnection = binanceConnected || solanaConnected;

  const [prices, setPrices] = useState<TickerPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Blinking cursor
  const cursorAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [cursorAnim]);

  // Scanline animation
  const scanAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [scanAnim]);

  // Poll prices
  useEffect(() => {
    let active = true;
    const fetch = async () => {
      const data = await fetchTickerPrices();
      if (active && data.length > 0) {
        setPrices(data);
        setLoadingPrices(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 10_000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  // Poll screen time
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const minutes = await usageStats.getUsageToday();
        if (minutes > 0) setScreenTime(minutes);
      } catch {}
    };
    fetchUsage();
    const interval = setInterval(fetchUsage, 30_000);
    return () => clearInterval(interval);
  }, [setScreenTime]);

  const formatPrice = (p: string) => {
    const num = parseFloat(p);
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toFixed(2);
    return num.toFixed(4);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Scanline effect */}
      <Animated.View
        style={[
          styles.scanline,
          {
            transform: [{
              translateY: scanAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-2, 800],
              }),
            }],
          },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Terminal Header */}
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalTitle}>
            TRADING TERMINAL
            <Animated.Text style={{ opacity: cursorAnim }}>|</Animated.Text>
          </Text>
          <View style={styles.blockedBadge}>
            <View style={styles.blockedDot} />
            <Text style={styles.blockedText}>BLOCKED</Text>
          </View>
        </View>

        {/* Usage Display */}
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>USAGE:</Text>
          <Text style={styles.usageValue}>
            {todayScreenTime}/{dailyLimitMinutes} MIN
          </Text>
          <Text style={styles.usageExceeded}> [EXCEEDED]</Text>
        </View>

        <View style={styles.divider} />

        {/* Price Ticker */}
        <Text style={styles.sectionLabel}>// LIVE MARKET DATA</Text>

        {loadingPrices ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#4ADE80" size="small" />
            <Text style={styles.loadingText}>CONNECTING...</Text>
          </View>
        ) : (
          <View style={styles.priceList}>
            {prices.map((ticker) => {
              const change = parseFloat(ticker.priceChangePercent);
              const isUp = change >= 0;
              return (
                <View key={ticker.symbol} style={styles.priceRow}>
                  <View style={styles.priceLeft}>
                    <Text style={styles.priceSymbol}>
                      {DISPLAY_NAMES[ticker.symbol] || ticker.symbol}
                    </Text>
                    <Text style={styles.priceUsd}>
                      ${formatPrice(ticker.price)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.changeBadge,
                      { backgroundColor: isUp ? 'rgba(74,222,128,0.12)' : 'rgba(255,68,68,0.12)' },
                    ]}
                  >
                    <Icon
                      name={isUp ? 'arrow-drop-up' : 'arrow-drop-down'}
                      size={20}
                      color={isUp ? '#4ADE80' : '#FF4444'}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: isUp ? '#4ADE80' : '#FF4444' },
                      ]}
                    >
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.divider} />

        {/* Action Message */}
        <Text style={styles.actionMessage}>
          {'>'} Make a profitable trade to unlock your apps.
        </Text>

        {/* Verify Trade Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, checking && { opacity: 0.6 }]}
          activeOpacity={0.8}
          onPress={() => hasTradeConnection ? checkTrades() : undefined}
          disabled={checking || !hasTradeConnection}
        >
          {checking ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <>
              <Icon name="bolt" size={20} color="#000000" />
              <Text style={styles.verifyBtnText}>
                {hasTradeConnection ? 'VERIFY TRADE' : 'NO WALLET CONNECTED'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Emergency Bypass */}
        {bypassEnabled && (
          <TouchableOpacity
            style={styles.bypassBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Bypass')}
          >
            <Icon name="warning" size={16} color={colors.error} />
            <Text style={styles.bypassBtnText}>Emergency Bypass</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050508',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(74,222,128,0.06)',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // Terminal header
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  terminalTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: '#4ADE80',
    letterSpacing: 2,
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  blockedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
  },
  blockedText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#FF4444',
    letterSpacing: 1.5,
  },
  // Usage
  usageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  usageLabel: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: 'rgba(228,225,233,0.5)',
    marginRight: 6,
  },
  usageValue: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4444',
  },
  usageExceeded: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(74,222,128,0.12)',
    marginVertical: 20,
  },
  // Section labels
  sectionLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: 'rgba(74,222,128,0.5)',
    letterSpacing: 1,
    marginBottom: 16,
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#4ADE80',
    opacity: 0.7,
  },
  // Price list
  priceList: {
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.08)',
    borderRadius: 10,
    padding: 16,
  },
  priceLeft: {
    gap: 4,
  },
  priceSymbol: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(228,225,233,0.6)',
    letterSpacing: 1.5,
  },
  priceUsd: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  // Action message
  actionMessage: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: 'rgba(228,225,233,0.4)',
    marginBottom: 24,
    lineHeight: 20,
  },
  // Verify button
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    paddingVertical: 18,
    gap: 10,
    marginBottom: 14,
  },
  verifyBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1.5,
  },
  // Bypass button
  bypassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  bypassBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
