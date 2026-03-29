import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { WarEvent } from '../../types/models';
import { colors } from '../../theme/colors';
import { Icon, GlassCard } from '../../components/ui';
import { useWarModeStore } from '../../stores/useWarModeStore';
import {
  registerWarrior,
  createWarPair,
  joinWarPair,
  leavePair,
  getPartnerEvents,
  getPartnerName,
  subscribeToEvents,
} from '../../services/warModeService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EVENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  bypass_complete: { icon: 'warning', color: '#FF4444', label: 'Used bypass' },
  bypass_attempt: { icon: 'error-outline', color: '#FF6B6B', label: 'Attempted bypass' },
  trade_unlock: { icon: 'lock-open', color: '#4ADE80', label: 'Trade unlock' },
  streak_milestone: { icon: 'local-fire-department', color: '#FFB77B', label: 'Streak milestone' },
};

export default function WarModeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const {
    isWarrior, warriorId, displayName, pairId, pairCode,
    partnerId, partnerName, partnerEvents,
    setWarrior, setPair, clearPair, addPartnerEvent, setPartnerEvents, setPartnerInfo,
  } = useWarModeStore();

  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForPartner, setWaitingForPartner] = useState(false);

  const isPaired = !!(pairId && partnerId);

  // Subscribe to real-time events when paired
  useEffect(() => {
    if (!pairId || !partnerId) return;

    // Fetch existing events
    getPartnerEvents(pairId, partnerId).then(setPartnerEvents);

    const channel = subscribeToEvents(pairId, (event: WarEvent) => {
      if (event.warrior_id !== warriorId) {
        addPartnerEvent(event);
      }
    });

    return () => { channel.unsubscribe(); };
  }, [pairId, partnerId, warriorId, setPartnerEvents, addPartnerEvent]);

  const handleRegister = useCallback(async () => {
    if (!nameInput.trim()) return;
    setLoading(true);
    const warrior = await registerWarrior(nameInput.trim());
    if (warrior) {
      setWarrior(warrior.id, warrior.device_code, warrior.display_name);
    } else {
      Alert.alert('Error', 'Could not register. Check your connection.');
    }
    setLoading(false);
  }, [nameInput, setWarrior]);

  const handleCreatePair = useCallback(async () => {
    if (!warriorId) return;
    setLoading(true);
    const result = await createWarPair(warriorId);
    if (result) {
      setPair(result.pairId, result.pairCode, null, null);
      setWaitingForPartner(true);
    } else {
      Alert.alert('Error', 'Could not create pair.');
    }
    setLoading(false);
  }, [warriorId, setPair]);

  const handleJoinPair = useCallback(async () => {
    if (!warriorId || !codeInput.trim()) return;
    setLoading(true);
    const pair = await joinWarPair(codeInput.trim(), warriorId);
    if (pair) {
      const partnerWarriorId = pair.warrior_a === warriorId ? pair.warrior_b : pair.warrior_a;
      const name = partnerWarriorId ? await getPartnerName(partnerWarriorId) : null;
      setPair(pair.id, pair.pair_code, partnerWarriorId, name);
    } else {
      Alert.alert('Invalid Code', 'No open pair found with this code.');
    }
    setLoading(false);
  }, [warriorId, codeInput, setPair]);

  const handleLeavePair = useCallback(() => {
    Alert.alert('Leave War?', 'This will disconnect you from your partner.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          if (pairId) await leavePair(pairId);
          clearPair();
          setWaitingForPartner(false);
        },
      },
    ]);
  }, [pairId, clearPair]);

  // Poll for partner joining (when waiting)
  useEffect(() => {
    if (!waitingForPartner || !pairId || partnerId) return;

    const interval = setInterval(async () => {
      const events = await getPartnerEvents(pairId, '');
      // Simple check: refetch pair to see if warrior_b was set
      // For now, we check via the store — the realtime subscription handles it
    }, 5000);

    return () => clearInterval(interval);
  }, [waitingForPartner, pairId, partnerId]);

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
        <Text style={styles.headerTitle}>War Mode</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase 1: Not registered */}
        {!isWarrior && (
          <View style={styles.phase}>
            <View style={styles.shieldCircle}>
              <Icon name="shield" size={48} color={colors.primary} />
            </View>
            <Text style={styles.phaseTitle}>Become a Warrior</Text>
            <Text style={styles.phaseDesc}>
              Set your display name to pair with a friend for mutual accountability.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Your display name"
              placeholderTextColor="rgba(194,198,214,0.4)"
              value={nameInput}
              onChangeText={setNameInput}
              autoCapitalize="words"
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, !nameInput.trim() && styles.btnDisabled]}
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={!nameInput.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Phase 2: Registered, not paired */}
        {isWarrior && !isPaired && (
          <View style={styles.phase}>
            <View style={styles.shieldCircle}>
              <Icon name="people" size={44} color={colors.primary} />
            </View>
            <Text style={styles.phaseTitle}>
              Welcome, {displayName}
            </Text>

            {pairCode && !partnerId ? (
              // Waiting for partner
              <View style={styles.waitingSection}>
                <Text style={styles.phaseDesc}>Share this code with your partner:</Text>
                <View style={styles.codeDisplay}>
                  <Text style={styles.codeText}>{pairCode}</Text>
                </View>
                <Text style={styles.waitingText}>Waiting for partner to join...</Text>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={() => { clearPair(); setWaitingForPartner(false); }}
                >
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Choose to create or join
              <View style={styles.optionsSection}>
                <TouchableOpacity
                  style={styles.optionCard}
                  activeOpacity={0.7}
                  onPress={handleCreatePair}
                  disabled={loading}
                >
                  <Icon name="add-circle" size={28} color={colors.primary} />
                  <Text style={styles.optionTitle}>Create Pair</Text>
                  <Text style={styles.optionDesc}>Generate a code for your partner</Text>
                </TouchableOpacity>

                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <Text style={styles.joinLabel}>Enter partner's code</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="000000"
                  placeholderTextColor="rgba(194,198,214,0.3)"
                  value={codeInput}
                  onChangeText={setCodeInput}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, codeInput.length < 6 && styles.btnDisabled]}
                  activeOpacity={0.8}
                  onPress={handleJoinPair}
                  disabled={codeInput.length < 6 || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Join Pair</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Phase 3: Paired — partner dashboard */}
        {isWarrior && isPaired && (
          <View style={styles.phase}>
            {/* Partner card */}
            <GlassCard style={styles.partnerCard}>
              <View style={styles.partnerRow}>
                <View style={styles.partnerAvatar}>
                  <Icon name="person" size={28} color={colors.primary} />
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{partnerName || 'Partner'}</Text>
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Linked</Text>
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* Event feed */}
            <Text style={styles.feedLabel}>PARTNER ACTIVITY</Text>
            {partnerEvents.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Icon name="inbox" size={32} color={colors.onSurfaceVariant} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyText}>No events yet</Text>
              </View>
            ) : (
              <View style={styles.feedList}>
                {partnerEvents.map((event, i) => {
                  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.bypass_complete;
                  return (
                    <GlassCard key={event.id || i} style={styles.eventCard}>
                      <View style={styles.eventRow}>
                        <View style={[styles.eventIconCircle, { backgroundColor: config.color + '1A' }]}>
                          <Icon name={config.icon} size={18} color={config.color} />
                        </View>
                        <View style={styles.eventInfo}>
                          <Text style={[styles.eventLabel, { color: config.color }]}>
                            {config.label}
                          </Text>
                          <Text style={styles.eventTime}>
                            {dayjs(event.created_at).fromNow()}
                          </Text>
                        </View>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            )}

            {/* Leave */}
            <TouchableOpacity
              style={styles.leaveBtn}
              activeOpacity={0.7}
              onPress={handleLeavePair}
            >
              <Icon name="link-off" size={16} color={colors.error} />
              <Text style={styles.leaveBtnText}>Leave War</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  // Shared phase container
  phase: {
    alignItems: 'center',
    paddingTop: 32,
  },
  shieldCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(79,140,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  phaseTitle: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.02 * 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  phaseDesc: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  textInput: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 16,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    marginTop: 16,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  // Waiting
  waitingSection: {
    width: '100%',
    alignItems: 'center',
  },
  codeDisplay: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 8,
  },
  waitingText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  // Options
  optionsSection: {
    width: '100%',
    alignItems: 'center',
  },
  optionCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
  },
  optionDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  orText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  joinLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  codeInput: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 16,
  },
  // Partner dashboard
  partnerCard: {
    width: '100%',
    marginBottom: 24,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  partnerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(79,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfo: {
    flex: 1,
    gap: 4,
  },
  partnerName: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  activeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  // Feed
  feedLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    opacity: 0.4,
  },
  feedList: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  eventCard: {
    padding: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  eventTime: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  // Leave
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 8,
  },
  leaveBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
