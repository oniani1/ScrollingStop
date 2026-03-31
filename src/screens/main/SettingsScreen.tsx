import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  NativeModules,
  ActivityIndicator,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { GlassCard, Icon, ToggleSwitch } from '../../components/ui';
import { useSettingsStore, useTradeStore, useWarModeStore } from '../../stores';
import { appBlocker } from '../../services/blockingManager';
import { testBinanceConnection } from '../../services/binanceApi';
import { testSolanaConnection } from '../../services/solanaApi';

interface InstalledApp {
  packageName: string;
  displayName: string;
  iconPath: string;
}

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
  const addApp = useSettingsStore((s) => s.addApp);
  const hapticHeartbeatEnabled = useSettingsStore((s) => s.hapticHeartbeatEnabled);
  const setHapticHeartbeat = useSettingsStore((s) => s.setHapticHeartbeat);

  const binanceConnected = useTradeStore((s) => s.binanceConnected);
  const solanaConnected = useTradeStore((s) => s.solanaConnected);
  const connectBinance = useTradeStore((s) => s.connectBinance);
  const connectSolana = useTradeStore((s) => s.connectSolana);
  const warPartnerName = useWarModeStore((s) => s.partnerName);
  const warPaired = !!useWarModeStore((s) => s.pairId) && !!useWarModeStore((s) => s.partnerId);

  // App picker state
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [appSearch, setAppSearch] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);

  // Limit/threshold slider state
  const [showLimitEdit, setShowLimitEdit] = useState(false);
  const [limitSlider, setLimitSlider] = useState(dailyLimitMinutes);
  const [showThresholdEdit, setShowThresholdEdit] = useState(false);
  const [thresholdSlider, setThresholdSlider] = useState(profitThreshold);

  // Inline trading connection state
  const [binanceExpanded, setBinanceExpanded] = useState(false);
  const [solanaExpanded, setSolanaExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [binanceLoading, setBinanceLoading] = useState(false);
  const [solanaLoading, setSolanaLoading] = useState(false);

  const loadInstalledApps = useCallback(async () => {
    setLoadingApps(true);
    try {
      const apps: InstalledApp[] = await NativeModules.InstalledAppsModule.getInstalledApps();
      const sorted = apps.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setInstalledApps(sorted);
    } catch {
      Alert.alert('Error', 'Could not load installed apps.');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  const openAppPicker = () => {
    setShowAppPicker(true);
    setAppSearch('');
    loadInstalledApps();
  };

  const blockedSet = new Set(blockedApps.map((a) => a.packageName));

  const filteredApps = appSearch
    ? installedApps.filter(
        (a) =>
          a.displayName.toLowerCase().includes(appSearch.toLowerCase()) ||
          a.packageName.toLowerCase().includes(appSearch.toLowerCase()),
      )
    : installedApps;

  const handlePickApp = (app: InstalledApp) => {
    if (blockedSet.has(app.packageName)) {
      removeApp(app.packageName);
    } else {
      addApp({
        packageName: app.packageName,
        displayName: app.displayName,
        icon: app.iconPath ? `file://${app.iconPath}` : 'block',
        enabled: true,
      });
    }
  };

  const handleBinanceConnect = async () => {
    const key = apiKey.trim();
    const secret = apiSecret.trim();
    if (!key || !secret) return;
    setBinanceLoading(true);
    try {
      await testBinanceConnection(key, secret);
      connectBinance(key, secret);
      setBinanceExpanded(false);
      setApiKey('');
      setApiSecret('');
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Invalid API key or secret.');
    } finally {
      setBinanceLoading(false);
    }
  };

  const handleSolanaConnect = async () => {
    const addr = walletAddress.trim();
    if (!addr) return;
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
      Alert.alert('Invalid Address', 'Please enter a valid Solana wallet address.');
      return;
    }
    setSolanaLoading(true);
    try {
      await testSolanaConnection(addr);
      connectSolana(addr);
      setSolanaExpanded(false);
      setWalletAddress('');
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Could not verify wallet.');
    } finally {
      setSolanaLoading(false);
    }
  };

  // Sync blocked apps to native module whenever they change
  useEffect(() => {
    const packages = blockedApps.filter((a) => a.enabled).map((a) => a.packageName);
    appBlocker.updateBlockedApps(packages).catch(() => {});
  }, [blockedApps]);

  // Sync daily limit to native whenever it changes
  useEffect(() => {
    appBlocker.setDailyLimit(dailyLimitMinutes).catch(() => {});
  }, [dailyLimitMinutes]);

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
                  {app.icon.startsWith('file://') ? (
                    <Image source={{ uri: app.icon }} style={styles.appIconImg} />
                  ) : (
                    <Icon name={app.icon} size={22} color={colors.onSurface} />
                  )}
                </View>
                <Text style={styles.appName}>{app.displayName}</Text>
                <TouchableOpacity
                  onPress={() => removeApp(app.packageName)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.removeBtn}
                >
                  <Icon name="remove-circle" size={22} color={colors.error} style={{ opacity: 0.4 }} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
          <TouchableOpacity style={styles.addAppBtn} activeOpacity={0.7} onPress={openAppPicker}>
            <Icon name="add" size={18} color={colors.primary} />
            <Text style={styles.addAppText}>Add App</Text>
          </TouchableOpacity>
        </View>

        {/* LIMITS */}
        <Text style={styles.sectionLabel}>LIMITS</Text>
        <View style={styles.groupedCard}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => { setLimitSlider(dailyLimitMinutes); setShowLimitEdit(true); }}
          >
            <Text style={styles.settingLabel}>Daily Limit</Text>
            <View style={styles.settingValueRow}>
              <Text style={styles.settingValue}>{dailyLimitMinutes} min</Text>
              <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => { setThresholdSlider(profitThreshold); setShowThresholdEdit(true); }}
          >
            <Text style={styles.settingLabel}>Profit Threshold</Text>
            <View style={styles.settingValueRow}>
              <Text style={styles.settingValue}>${profitThreshold}</Text>
              <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </View>
          </TouchableOpacity>
        </View>

        {/* TRADING CONNECTIONS - inline */}
        <Text style={styles.sectionLabel}>TRADING CONNECTIONS</Text>
        <View style={styles.sectionGap}>
          {/* Binance */}
          <View style={styles.connectionCard}>
            <View style={styles.connectionTop}>
              <View style={styles.connectionIconBox}>
                <Icon name="account-balance-wallet" size={22} color={colors.primary} />
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Binance API</Text>
                <Text style={styles.connectionDesc}>Real-time profit tracking</Text>
              </View>
            </View>
            <View style={styles.connectionBottom}>
              <View style={[styles.connectionStatus, binanceConnected ? styles.connectedPill : styles.disconnectedPill]}>
                <Text style={[styles.connectionStatusText, binanceConnected ? styles.connectedText : styles.disconnectedText]}>
                  {binanceConnected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              {!binanceConnected && !binanceExpanded && (
                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.7} onPress={() => setBinanceExpanded(true)}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
            {binanceExpanded && !binanceConnected && (
              <View style={styles.inlineForm}>
                <TextInput
                  style={styles.inlineInput}
                  placeholder="API Key"
                  placeholderTextColor={colors.outlineVariant}
                  value={apiKey}
                  onChangeText={setApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.inlineInput}
                  placeholder="API Secret"
                  placeholderTextColor={colors.outlineVariant}
                  value={apiSecret}
                  onChangeText={setApiSecret}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.inlineFormBtns}>
                  <TouchableOpacity onPress={() => { setBinanceExpanded(false); setApiKey(''); setApiSecret(''); }}>
                    <Text style={styles.inlineCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineSaveBtn, (!apiKey.trim() || !apiSecret.trim() || binanceLoading) && { opacity: 0.4 }]}
                    onPress={handleBinanceConnect}
                    disabled={!apiKey.trim() || !apiSecret.trim() || binanceLoading}
                  >
                    {binanceLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.inlineSaveText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Solana */}
          <View style={styles.connectionCard}>
            <View style={styles.connectionTop}>
              <View style={[styles.connectionIconBox, { backgroundColor: colors.surfaceContainerHighest }]}>
                <Icon name="account-balance-wallet" size={22} color={colors.onSurfaceVariant} />
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Solana Wallet</Text>
                <Text style={styles.connectionDesc}>On-chain transaction limits</Text>
              </View>
            </View>
            <View style={styles.connectionBottom}>
              <View style={[styles.connectionStatus, solanaConnected ? styles.connectedPill : styles.disconnectedPill]}>
                <Text style={[styles.connectionStatusText, solanaConnected ? styles.connectedText : styles.disconnectedText]}>
                  {solanaConnected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
              {!solanaConnected && !solanaExpanded && (
                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.7} onPress={() => setSolanaExpanded(true)}>
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
            {solanaExpanded && !solanaConnected && (
              <View style={styles.inlineForm}>
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Wallet address"
                  placeholderTextColor={colors.outlineVariant}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.inlineFormBtns}>
                  <TouchableOpacity onPress={() => { setSolanaExpanded(false); setWalletAddress(''); }}>
                    <Text style={styles.inlineCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineSaveBtn, (!walletAddress.trim() || solanaLoading) && { opacity: 0.4 }]}
                    onPress={handleSolanaConnect}
                    disabled={!walletAddress.trim() || solanaLoading}
                  >
                    {solanaLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.inlineSaveText}>Save</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* WAR MODE */}
        <Text style={styles.sectionLabel}>WAR MODE</Text>
        <TouchableOpacity style={styles.connectionCard} activeOpacity={0.7} onPress={() => navigation.navigate('WarMode')}>
          <View style={styles.connectionTop}>
            <View style={[styles.connectionIconBox, { backgroundColor: 'rgba(79,140,255,0.12)' }]}>
              <Icon name="shield" size={22} color={colors.primary} />
            </View>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionName}>Accountability Partner</Text>
              <Text style={styles.connectionDesc}>
                {warPaired ? `Paired with ${warPartnerName || 'partner'}` : 'Pair with a friend for mutual accountability'}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </View>
          {warPaired && (
            <View style={[styles.connectionStatus, styles.connectedPill, { alignSelf: 'flex-start' }]}>
              <Text style={[styles.connectionStatusText, styles.connectedText]}>Active</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* BYPASS */}
        <Text style={styles.sectionLabel}>BYPASS</Text>
        <View style={styles.groupedCard}>
          <View style={styles.bypassRow}>
            <View style={styles.bypassLabelArea}>
              <Text style={styles.settingLabel}>Shame Phrase</Text>
              <Text style={styles.bypassDesc}>Type this to temporarily bypass blocking</Text>
            </View>
            <View style={styles.shameBox}>
              <Text style={styles.shameText}>{bypassPhrase}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bypassToggleRow}>
            <View style={styles.bypassLabelArea}>
              <Text style={styles.settingLabel}>Allow bypass</Text>
              <Text style={styles.bypassDesc}>Enable or disable the shame phrase bypass</Text>
            </View>
            <ToggleSwitch value={bypassEnabled} onValueChange={setBypassEnabled} />
          </View>
        </View>

        {/* HAPTICS */}
        <Text style={styles.sectionLabel}>HAPTICS</Text>
        <View style={styles.groupedCard}>
          <View style={styles.bypassToggleRow}>
            <View style={styles.bypassLabelArea}>
              <Text style={styles.settingLabel}>Haptic Heartbeat</Text>
              <Text style={styles.bypassDesc}>Phone vibrates as you approach your daily limit</Text>
            </View>
            <ToggleSwitch
              value={hapticHeartbeatEnabled}
              onValueChange={(v) => {
                setHapticHeartbeat(v);
                appBlocker.setHapticEnabled(v).catch(() => {});
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* App Picker Modal */}
      <Modal visible={showAppPicker} animationType="slide">
        <View style={[styles.pickerRoot, { paddingTop: insets.top }]}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Apps to Block</Text>
            <TouchableOpacity onPress={() => setShowAppPicker(false)}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerSearchBox}>
            <Icon name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search apps..."
              placeholderTextColor={colors.outlineVariant}
              value={appSearch}
              onChangeText={setAppSearch}
              autoCorrect={false}
            />
          </View>
          {loadingApps ? (
            <View style={styles.pickerLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.pickerLoadingText}>Loading apps...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.packageName}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => {
                const isBlocked = blockedSet.has(item.packageName);
                return (
                  <TouchableOpacity
                    style={[styles.pickerRow, isBlocked && styles.pickerRowActive]}
                    activeOpacity={0.7}
                    onPress={() => handlePickApp(item)}
                  >
                    {item.iconPath ? (
                      <Image source={{ uri: `file://${item.iconPath}` }} style={styles.pickerIcon} />
                    ) : (
                      <View style={styles.pickerIconPlaceholder}>
                        <Text style={styles.pickerIconLetter}>{item.displayName[0]}</Text>
                      </View>
                    )}
                    <Text style={styles.pickerAppName} numberOfLines={1}>{item.displayName}</Text>
                    <View style={[styles.pickerCheck, isBlocked && styles.pickerCheckActive]}>
                      {isBlocked && <Icon name="check" size={16} color="#FFF" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* Daily Limit Slider Modal */}
      <Modal visible={showLimitEdit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Daily Screen Time Limit</Text>
            <View style={styles.sliderValueRow}>
              <Text style={styles.sliderValueBig}>{limitSlider}</Text>
              <Text style={styles.sliderValueUnit}> min</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={180}
              step={5}
              value={limitSlider}
              onValueChange={(v) => setLimitSlider(Math.round(v))}
              minimumTrackTintColor={colors.primaryContainer}
              maximumTrackTintColor={colors.surfaceContainerHighest}
              thumbTintColor={colors.primaryContainer}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>5 MIN</Text>
              <Text style={styles.sliderLabel}>180 MIN</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLimitEdit(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => { setDailyLimit(limitSlider); setShowLimitEdit(false); }}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profit Threshold Slider Modal */}
      <Modal visible={showThresholdEdit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profit Threshold</Text>
            <View style={styles.sliderValueRow}>
              <Text style={styles.sliderValueBig}>${thresholdSlider}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={1000}
              step={10}
              value={thresholdSlider}
              onValueChange={(v) => setThresholdSlider(Math.round(v))}
              minimumTrackTintColor={colors.primaryContainer}
              maximumTrackTintColor={colors.surfaceContainerHighest}
              thumbTintColor={colors.primaryContainer}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>$10</Text>
              <Text style={styles.sliderLabel}>$1,000</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowThresholdEdit(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => { setProfitThreshold(thresholdSlider); setShowThresholdEdit(false); }}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  sectionLabel: { fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 28, marginBottom: 12 },
  sectionGap: { gap: 10 },
  appRow: { padding: 14 },
  appRowInner: { flexDirection: 'row', alignItems: 'center' },
  appIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  appIconImg: { width: 32, height: 32, borderRadius: 6 },
  appName: { flex: 1, fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.onSurface },
  removeBtn: { padding: 4 },
  addAppBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  addAppText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: colors.primary },
  groupedCard: { backgroundColor: 'rgba(27,27,32,0.4)', borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18 },
  settingLabel: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.onSurface },
  settingValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.glassBorder, marginHorizontal: 20 },
  connectionCard: { backgroundColor: colors.surfaceContainerLow, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.glassBorder },
  connectionTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  connectionIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(79,140,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  connectionInfo: { flex: 1 },
  connectionName: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.onSurface },
  connectionDesc: { fontFamily: 'Inter', fontSize: 13, fontWeight: '400', color: colors.onSurfaceVariant, opacity: 0.7, marginTop: 2 },
  connectionBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  connectionStatus: { borderRadius: 9999, paddingVertical: 5, paddingHorizontal: 12 },
  connectedPill: { backgroundColor: 'rgba(74,222,128,0.12)' },
  disconnectedPill: { backgroundColor: colors.surfaceContainerHighest },
  connectionStatusText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '600' },
  connectedText: { color: colors.success },
  disconnectedText: { color: colors.onSurfaceVariant },
  connectBtn: { backgroundColor: colors.primary, borderRadius: 9999, paddingVertical: 8, paddingHorizontal: 18 },
  connectBtnText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  // Inline form for trading connections
  inlineForm: { marginTop: 16, gap: 10 },
  inlineInput: { backgroundColor: colors.surfaceContainer, borderRadius: 12, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter', color: colors.onSurface },
  inlineFormBtns: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  inlineCancelText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: colors.onSurfaceVariant },
  inlineSaveBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  inlineSaveText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: '#FFF' },
  // Bypass
  bypassRow: { paddingHorizontal: 20, paddingVertical: 18 },
  bypassLabelArea: { marginBottom: 10 },
  bypassDesc: { fontFamily: 'Inter', fontSize: 12, fontWeight: '400', color: colors.onSurfaceVariant, opacity: 0.7, marginTop: 4 },
  shameBox: { backgroundColor: colors.surfaceContainerHighest, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  shameText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '500', color: '#8B5CF6' },
  bypassToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18 },
  // App Picker
  pickerRoot: { flex: 1, backgroundColor: colors.background },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  pickerTitle: { fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: colors.onSurface },
  pickerDone: { fontFamily: 'Inter', fontSize: 16, fontWeight: '700', color: colors.primary },
  pickerSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainer, borderRadius: 12, marginHorizontal: 24, marginBottom: 12, paddingHorizontal: 14, gap: 10 },
  pickerSearchInput: { flex: 1, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter', color: colors.onSurface },
  pickerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  pickerLoadingText: { fontFamily: 'Inter', fontSize: 14, color: colors.onSurfaceVariant },
  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.glassBorder, gap: 14 },
  pickerRowActive: { backgroundColor: 'rgba(79,140,255,0.06)' },
  pickerIcon: { width: 44, height: 44, borderRadius: 10 },
  pickerIconPlaceholder: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  pickerIconLetter: { fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: colors.onSurfaceVariant },
  pickerAppName: { flex: 1, fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: colors.onSurface },
  pickerCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  pickerCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  // Slider Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surfaceContainerLow, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: colors.glassBorder },
  modalTitle: { fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 16, textAlign: 'center' },
  sliderValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 20 },
  sliderValueBig: { fontSize: 40, fontWeight: '900', fontFamily: 'Inter', color: colors.primaryContainer },
  sliderValueUnit: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: colors.primaryContainer },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4, marginBottom: 20 },
  sliderLabel: { fontSize: 10, fontWeight: '700', fontFamily: 'Inter', letterSpacing: 2, color: colors.onSurfaceVariant, opacity: 0.4 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  modalCancelText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: colors.onSurfaceVariant },
  modalSaveBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  modalSaveText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
