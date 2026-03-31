import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import {
  GlassCard,
  PrimaryButton,
  StepIndicator,
  Icon,
} from '../../components/ui';
import { useAppStore, useTradeStore, useSettingsStore } from '../../stores';
import { testBinanceConnection } from '../../services/binanceApi';
import { testSolanaConnection } from '../../services/solanaApi';
import { appBlocker } from '../../services/blockingManager';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export default function TradingSetupScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const {
    binanceConnected,
    solanaConnected,
    connectBinance,
    connectSolana,
  } = useTradeStore();

  const [binanceExpanded, setBinanceExpanded] = useState(false);
  const [solanaExpanded, setSolanaExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [binanceLoading, setBinanceLoading] = useState(false);
  const [solanaLoading, setSolanaLoading] = useState(false);

  const handleFinish = () => {
    const settings = useSettingsStore.getState();
    const packages = settings.blockedApps.filter((a) => a.enabled).map((a) => a.packageName);
    appBlocker.updateBlockedApps(packages).catch(() => {});
    appBlocker.setDailyLimit(settings.dailyLimitMinutes).catch(() => {});
    appBlocker.setUnlockedToday(true).catch(() => {});
    completeOnboarding();
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
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Could not verify wallet.');
    } finally {
      setSolanaLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <StepIndicator totalSteps={4} currentStep={2} />
        </View>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>

        <Text style={styles.title}>Connect Your{'\n'}Trading</Text>
        <Text style={styles.subtitle}>
          Link your exchange to verify trades and unlock screen time. Both are optional — you can always connect later in Settings.
        </Text>

        {/* Binance card */}
        <GlassCard style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            activeOpacity={0.7}
            onPress={() => !binanceConnected && setBinanceExpanded(!binanceExpanded)}
            disabled={binanceConnected}
          >
            <View style={styles.cardIconBox}>
              <Icon name="account-balance-wallet" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Binance</Text>
              <Text style={styles.cardSub}>Spot & Futures P&L tracking</Text>
            </View>
            {binanceConnected ? (
              <Icon name="check-circle" size={24} color={colors.success} />
            ) : (
              <Icon name={binanceExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>

          {binanceExpanded && !binanceConnected && (
            <View style={styles.formArea}>
              <TextInput
                style={styles.input}
                placeholder="API Key"
                placeholderTextColor={colors.outlineVariant}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="API Secret"
                placeholderTextColor={colors.outlineVariant}
                value={apiSecret}
                onChangeText={setApiSecret}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.formHint}>
                <Icon name="info-outline" size={13} color={colors.onSurfaceVariant} />
                <Text style={styles.formHintText}>Use read-only API keys for safety</Text>
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, (!apiKey.trim() || !apiSecret.trim() || binanceLoading) && styles.saveBtnDisabled]}
                onPress={handleBinanceConnect}
                disabled={!apiKey.trim() || !apiSecret.trim() || binanceLoading}
                activeOpacity={0.7}
              >
                {binanceLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Connect Binance</Text>}
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Solana card */}
        <GlassCard style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            activeOpacity={0.7}
            onPress={() => !solanaConnected && setSolanaExpanded(!solanaExpanded)}
            disabled={solanaConnected}
          >
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(208,188,255,0.15)' }]}>
              <Icon name="account-balance-wallet" size={22} color="#d0bcff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Solana Wallet</Text>
              <Text style={styles.cardSub}>On-chain swap P&L</Text>
            </View>
            {solanaConnected ? (
              <Icon name="check-circle" size={24} color={colors.success} />
            ) : (
              <Icon name={solanaExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>

          {solanaExpanded && !solanaConnected && (
            <View style={styles.formArea}>
              <TextInput
                style={styles.input}
                placeholder="Wallet address"
                placeholderTextColor={colors.outlineVariant}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.formHint}>
                <Icon name="info-outline" size={13} color={colors.onSurfaceVariant} />
                <Text style={styles.formHintText}>Works with Phantom, Solflare, etc.</Text>
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, (!walletAddress.trim() || solanaLoading) && styles.saveBtnDisabled]}
                onPress={handleSolanaConnect}
                disabled={!walletAddress.trim() || solanaLoading}
                activeOpacity={0.7}
              >
                {solanaLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>Connect Wallet</Text>}
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Bottom actions — inside scroll */}
        <View style={styles.bottomSection}>
          <PrimaryButton title="Continue" onPress={handleFinish} fullWidth />
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  stepRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    padding: 0,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(79,140,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
  formArea: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 10,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'Inter',
    color: colors.onSurface,
  },
  formHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formHintText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  bottomSection: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 16,
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#d0bcff',
  },
});
