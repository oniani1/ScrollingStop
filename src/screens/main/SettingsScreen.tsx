import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { GlassCard, Icon, ToggleSwitch } from '../../components/ui';
import { useSettingsStore, useTradeStore } from '../../stores';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const blockedApps = useSettingsStore((s) => s.blockedApps);
  const setDailyLimit = useSettingsStore((s) => s.setDailyLimit);
  const setProfitThreshold = useSettingsStore((s) => s.setProfitThreshold);
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);
  const profitThreshold = useSettingsStore((s) => s.profitThreshold);
  const bypassEnabled = useSettingsStore((s) => s.bypassEnabled);
  const bypassPhrase = useSettingsStore((s) => s.bypassPhrase);
  const setBypassEnabled = useSettingsStore((s) => s.setBypassEnabled);
  const removeApp = useSettingsStore((s) => s.removeApp);

  const binanceConnected = useTradeStore((s) => s.binanceConnected);
  const solanaConnected = useTradeStore((s) => s.solanaConnected);

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
        <Text style={styles.headerTitle}>Settings</Text>
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
        {/* BLOCKED APPS */}
        <Text style={styles.sectionLabel}>BLOCKED APPS</Text>
        <View style={styles.sectionGap}>
          {blockedApps.map((app) => (
            <GlassCard key={app.packageName} style={styles.appRow}>
              <View style={styles.appRowInner}>
                <View style={styles.appIconBox}>
                  <Icon name={app.icon} size={22} color={colors.onSurface} />
                </View>
                <Text style={styles.appName}>{app.displayName}</Text>
                <TouchableOpacity
                  onPress={() => removeApp(app.packageName)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.removeBtn}
                >
                  <Icon
                    name="remove-circle"
                    size={22}
                    color={colors.error}
                    style={{ opacity: 0.4 }}
                  />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
          <TouchableOpacity style={styles.addAppBtn} activeOpacity={0.7} onPress={() => {
            Alert.alert('Add App', 'Enter the package name (e.g., com.facebook.katana)', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add', onPress: () => {
                // For now, show a placeholder — full app picker would require native module
                Alert.alert('Coming soon', 'App picker will be available in a future update.');
              }},
            ]);
          }}>
            <Icon name="add" size={18} color={colors.primary} />
            <Text style={styles.addAppText}>Add App</Text>
          </TouchableOpacity>
        </View>

        {/* LIMITS */}
        <Text style={styles.sectionLabel}>LIMITS</Text>
        <View style={styles.groupedCard}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => {
            Alert.alert('Daily Limit', `Current: ${dailyLimitMinutes} min.\nTo change, go through onboarding setup.`);
          }}>
            <Text style={styles.settingLabel}>Daily Limit</Text>
            <View style={styles.settingValueRow}>
              <Text style={styles.settingValue}>{dailyLimitMinutes} min</Text>
              <Icon
                name="chevron-right"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => {
            Alert.alert('Profit Threshold', `Current: $${profitThreshold}.\nChange this in the onboarding setup.`);
          }}>
            <Text style={styles.settingLabel}>Profit Threshold</Text>
            <View style={styles.settingValueRow}>
              <Text style={styles.settingValue}>${profitThreshold}</Text>
              <Icon
                name="chevron-right"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* TRADING CONNECTIONS */}
        <Text style={styles.sectionLabel}>TRADING CONNECTIONS</Text>
        <View style={styles.sectionGap}>
          {/* Binance */}
          <View style={styles.connectionCard}>
            <View style={styles.connectionTop}>
              <View style={styles.connectionIconBox}>
                <Icon
                  name="account-balance-wallet"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Binance API</Text>
                <Text style={styles.connectionDesc}>
                  Real-time profit tracking
                </Text>
              </View>
            </View>
            <View style={styles.connectionBottom}>
              <View
                style={[
                  styles.connectionStatus,
                  binanceConnected
                    ? styles.connectedPill
                    : styles.disconnectedPill,
                ]}
              >
                <Text
                  style={[
                    styles.connectionStatusText,
                    binanceConnected
                      ? styles.connectedText
                      : styles.disconnectedText,
                  ]}
                >
                  {binanceConnected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              {!binanceConnected && (
                <TouchableOpacity
                  style={styles.connectBtn}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Onboarding', { screen: 'TradingSetup' } as any)}
                >
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Solana */}
          <View style={styles.connectionCard}>
            <View style={styles.connectionTop}>
              <View
                style={[
                  styles.connectionIconBox,
                  { backgroundColor: colors.surfaceContainerHighest },
                ]}
              >
                <Icon
                  name="account-balance-wallet"
                  size={22}
                  color={colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Solana Wallet</Text>
                <Text style={styles.connectionDesc}>
                  On-chain transaction limits
                </Text>
              </View>
            </View>
            <View style={styles.connectionBottom}>
              <View
                style={[
                  styles.connectionStatus,
                  solanaConnected
                    ? styles.connectedPill
                    : styles.disconnectedPill,
                ]}
              >
                <Text
                  style={[
                    styles.connectionStatusText,
                    solanaConnected
                      ? styles.connectedText
                      : styles.disconnectedText,
                  ]}
                >
                  {solanaConnected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              {!solanaConnected && (
                <TouchableOpacity
                  style={styles.connectBtn}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Onboarding', { screen: 'TradingSetup' } as any)}
                >
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* BYPASS */}
        <Text style={styles.sectionLabel}>BYPASS</Text>
        <View style={styles.groupedCard}>
          <View style={styles.bypassRow}>
            <View style={styles.bypassLabelArea}>
              <Text style={styles.settingLabel}>Shame Phrase</Text>
              <Text style={styles.bypassDesc}>
                Type this to temporarily bypass blocking
              </Text>
            </View>
            <View style={styles.shameBox}>
              <Text style={styles.shameText}>{bypassPhrase}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bypassToggleRow}>
            <View style={styles.bypassLabelArea}>
              <Text style={styles.settingLabel}>Allow bypass</Text>
              <Text style={styles.bypassDesc}>
                Enable or disable the shame phrase bypass
              </Text>
            </View>
            <ToggleSwitch
              value={bypassEnabled}
              onValueChange={setBypassEnabled}
            />
          </View>
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
  // Section
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.15 * 10,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionGap: {
    gap: 10,
  },
  // Blocked Apps
  appRow: {
    padding: 14,
  },
  appRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  removeBtn: {
    padding: 4,
  },
  addAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  addAppText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Grouped Card
  groupedCard: {
    backgroundColor: 'rgba(27,27,32,0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  settingLabel: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginHorizontal: 20,
  },
  // Connection Cards
  connectionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  connectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  connectionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(79,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  connectionDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    marginTop: 2,
  },
  connectionBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionStatus: {
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  connectedPill: {
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  disconnectedPill: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  connectionStatusText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  connectedText: {
    color: colors.success,
  },
  disconnectedText: {
    color: colors.onSurfaceVariant,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  connectBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Bypass
  bypassRow: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  bypassLabelArea: {
    marginBottom: 10,
  },
  bypassDesc: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    marginTop: 4,
  },
  shameBox: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  shameText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  bypassToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});
