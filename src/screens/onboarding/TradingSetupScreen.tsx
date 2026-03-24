import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
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
import { useAppStore, useTradeStore } from '../../stores';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export default function TradingSetupScreen() {
  const navigation = useNavigation<Nav>();
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

  const handleFinish = () => {
    completeOnboarding();
  };

  const handleBinanceConnect = () => {
    if (apiKey.trim() && apiSecret.trim()) {
      connectBinance(apiKey.trim(), apiSecret.trim());
      setBinanceExpanded(false);
    }
  };

  const handleSolanaConnect = () => {
    if (walletAddress.trim()) {
      connectSolana(walletAddress.trim());
      setSolanaExpanded(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Subtle purple glow */}
      <View style={styles.glowOuter}>
        <View style={styles.glowInner} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <View style={styles.headerSpacer} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <StepIndicator totalSteps={4} currentStep={2} />
      </View>
      <Text style={styles.stepLabel}>Step 3 of 4</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Connect Your Trading</Text>
        <Text style={styles.subtitle}>
          Link your exchange to verify trades. Both are optional.
        </Text>

        {/* Binance card */}
        <GlassCard style={styles.integrationCard}>
          <View style={styles.integrationRow}>
            <View style={styles.avatarCircle}>
              <Icon name="account-balance-wallet" size={24} color={colors.primary} />
            </View>
            <View style={styles.integrationText}>
              <Text style={styles.integrationTitle}>Binance</Text>
              <Text style={styles.integrationStatus}>
                {binanceConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            {binanceConnected ? (
              <View style={styles.connectedBadge}>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectPill}
                onPress={() => setBinanceExpanded(!binanceExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.connectPillText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoLine}>
            <Icon name="info-outline" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.infoLineText}>Read-only API keys for safety</Text>
          </View>

          {binanceExpanded && !binanceConnected && (
            <View style={styles.expandedForm}>
              <TextInput
                style={styles.textInput}
                placeholder="API Key"
                placeholderTextColor={colors.outlineVariant}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.textInput}
                placeholder="API Secret"
                placeholderTextColor={colors.outlineVariant}
                value={apiSecret}
                onChangeText={setApiSecret}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!apiKey.trim() || !apiSecret.trim()) && styles.submitBtnDisabled,
                ]}
                onPress={handleBinanceConnect}
                disabled={!apiKey.trim() || !apiSecret.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.submitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* Solana Wallet card */}
        <GlassCard style={styles.integrationCard}>
          <View style={styles.integrationRow}>
            <View style={[styles.avatarCircle, { backgroundColor: 'rgba(208,188,255,0.15)' }]}>
              <Icon name="account-balance-wallet" size={24} color="#d0bcff" />
            </View>
            <View style={styles.integrationText}>
              <Text style={styles.integrationTitle}>Solana Wallet</Text>
              <Text style={styles.integrationStatus}>
                {solanaConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            {solanaConnected ? (
              <View style={styles.connectedBadge}>
                <Icon name="check-circle" size={20} color={colors.success} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectPill}
                onPress={() => setSolanaExpanded(!solanaExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.connectPillText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoLine}>
            <Icon name="info-outline" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.infoLineText}>Works with Phantom wallet</Text>
          </View>

          {solanaExpanded && !solanaConnected && (
            <View style={styles.expandedForm}>
              <TextInput
                style={styles.textInput}
                placeholder="Wallet address"
                placeholderTextColor={colors.outlineVariant}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !walletAddress.trim() && styles.submitBtnDisabled,
                ]}
                onPress={handleSolanaConnect}
                disabled={!walletAddress.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.submitBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomArea}>
        <View style={styles.gradientFade} />
        <View style={styles.bottomInner}>
          <Text style={styles.bottomHint}>
            You can skip this and connect later in Settings
          </Text>
          <PrimaryButton
            title="Continue"
            onPress={handleFinish}
            fullWidth
          />
          <TouchableOpacity
            onPress={handleFinish}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowOuter: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowInner: {
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#571bc1',
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  stepRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 32,
  },
  integrationCard: {
    padding: 20,
    marginBottom: 16,
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79,140,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  integrationText: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: colors.onSurface,
    marginBottom: 2,
  },
  integrationStatus: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
  connectedBadge: {
    padding: 4,
  },
  connectPill: {
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  connectPillText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: colors.primaryLight,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  infoLineText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
  },
  expandedForm: {
    marginTop: 16,
    gap: 12,
  },
  textInput: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Inter',
    color: colors.onSurface,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientFade: {
    height: 40,
    backgroundColor: colors.background,
    opacity: 0.85,
  },
  bottomInner: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 4,
    alignItems: 'center',
  },
  bottomHint: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  skipBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#d0bcff',
  },
});
