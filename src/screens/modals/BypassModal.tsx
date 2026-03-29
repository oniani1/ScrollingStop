import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { Icon, PrimaryButton, ProgressRing } from '../../components/ui';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useStatsStore } from '../../stores/useStatsStore';
import { useAppStore } from '../../stores/useAppStore';
import { useWarModeStore } from '../../stores/useWarModeStore';
import { sendWarEvent } from '../../services/warModeService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Phase = 'input' | 'cooldown' | 'granted';

export default function BypassModal() {
  const navigation = useNavigation<Nav>();

  const bypassPhrase = useSettingsStore((s) => s.bypassPhrase);
  const bypassCooldownMinutes = useSettingsStore((s) => s.bypassCooldownMinutes);
  const bypassAccessMinutes = useSettingsStore((s) => s.bypassAccessMinutes);
  const addBypass = useStatsStore((s) => s.addBypass);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const warPairId = useWarModeStore((s) => s.pairId);
  const warWarriorId = useWarModeStore((s) => s.warriorId);

  const [phase, setPhase] = useState<Phase>('input');
  const [inputText, setInputText] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(bypassCooldownMinutes * 60);
  const [accessSeconds, setAccessSeconds] = useState(bypassAccessMinutes * 60);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accessRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phraseMatches = inputText.trim().toLowerCase() === bypassPhrase.toLowerCase();

  // Cooldown timer
  useEffect(() => {
    if (phase === 'cooldown') {
      setCooldownSeconds(bypassCooldownMinutes * 60);
      cooldownRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [phase, bypassCooldownMinutes]);

  // Transition from cooldown to granted when timer hits 0
  useEffect(() => {
    if (phase === 'cooldown' && cooldownSeconds === 0) {
      setPhase('granted');
      addBypass({
        timestamp: Date.now(),
        phrase: bypassPhrase,
        durationMinutes: bypassAccessMinutes,
      });
      navigation.navigate('ShameReceipt', {
        phrase: bypassPhrase,
        durationMinutes: bypassAccessMinutes,
        streakBroken: currentStreak > 0,
        currentStreak,
      });
      // Send war event if paired
      if (warPairId && warWarriorId) {
        sendWarEvent(warPairId, warWarriorId, 'bypass_complete', {
          phrase: bypassPhrase,
          durationMinutes: bypassAccessMinutes,
        }).catch(() => {});
      }
    }
  }, [phase, cooldownSeconds, addBypass, bypassPhrase, bypassAccessMinutes, currentStreak, navigation, warPairId, warWarriorId]);

  // Access timer
  useEffect(() => {
    if (phase === 'granted') {
      setAccessSeconds(bypassAccessMinutes * 60);
      accessRef.current = setInterval(() => {
        setAccessSeconds((prev) => {
          if (prev <= 1) {
            if (accessRef.current) clearInterval(accessRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (accessRef.current) clearInterval(accessRef.current);
    };
  }, [phase, bypassAccessMinutes]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSubmit = () => {
    if (phraseMatches) {
      setPhase('cooldown');
    }
  };

  const cooldownProgress =
    bypassCooldownMinutes > 0
      ? 1 - cooldownSeconds / (bypassCooldownMinutes * 60)
      : 1;

  const accessProgress =
    bypassAccessMinutes > 0
      ? accessSeconds / (bypassAccessMinutes * 60)
      : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Bypass</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning icon */}
          <View style={styles.warningCircle}>
            <Icon name="warning" size={48} color={colors.error} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Are you sure?</Text>

          {/* Phase: Input */}
          {phase === 'input' && (
            <View style={styles.phaseContainer}>
              <Text style={styles.subtitleText}>
                Type the shame phrase to unlock for {bypassAccessMinutes} minutes
              </Text>

              {/* Shame phrase display */}
              <View style={styles.phraseBlock}>
                <Text style={styles.phraseText}>{bypassPhrase}</Text>
              </View>

              {/* Input */}
              <TextInput
                style={styles.textInput}
                placeholder={`Type exactly: '${bypassPhrase}'`}
                placeholderTextColor="rgba(194,198,214,0.4)"
                value={inputText}
                onChangeText={setInputText}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {/* Helper text */}
              <Text style={styles.helperText}>
                Type exactly: '{bypassPhrase}'
              </Text>

              {/* Submit button */}
              <TouchableOpacity
                style={[
                  styles.shameButton,
                  !phraseMatches && styles.shameButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!phraseMatches}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.shameButtonText,
                    !phraseMatches && styles.shameButtonTextDisabled,
                  ]}
                >
                  I Accept the Shame
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Phase: Cooldown */}
          {phase === 'cooldown' && (
            <View style={styles.phaseContainer}>
              <Text style={styles.subtitleText}>Cooldown period</Text>

              <View style={styles.timerContainer}>
                <ProgressRing
                  progress={cooldownProgress}
                  size={200}
                  strokeWidth={4}
                  label={formatTime(cooldownSeconds)}
                  sublabel="remaining"
                />
              </View>

              <Text style={styles.cooldownHint}>
                Please wait before access is granted...
              </Text>
            </View>
          )}

          {/* Phase: Granted */}
          {phase === 'granted' && (
            <View style={styles.phaseContainer}>
              <View style={styles.grantedBadge}>
                <Icon name="lock-open" size={20} color={colors.success} />
                <Text style={styles.grantedBadgeText}>Access Granted</Text>
              </View>

              <Text style={styles.grantedMessage}>
                Access granted for {bypassAccessMinutes} minutes
              </Text>

              <View style={styles.timerContainer}>
                <ProgressRing
                  progress={accessProgress}
                  size={200}
                  strokeWidth={4}
                  label={formatTime(accessSeconds)}
                  sublabel="remaining"
                />
              </View>

              <View style={styles.closeSection}>
                <PrimaryButton
                  title="Close"
                  onPress={() => navigation.goBack()}
                  fullWidth
                />
              </View>
            </View>
          )}
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
  closeButton: {
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
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  // Warning icon
  warningCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,180,171,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  // Title
  title: {
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.02 * 30,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  // Phase container
  phaseContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // Phrase block
  phraseBlock: {
    width: '100%',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  phraseText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '500',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  // Text input
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
    marginBottom: 8,
  },
  helperText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(194,198,214,0.5)',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  // Shame button
  shameButton: {
    width: '100%',
    backgroundColor: colors.error,
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shameButtonDisabled: {
    backgroundColor: 'rgba(255,180,171,0.2)',
  },
  shameButtonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  shameButtonTextDisabled: {
    color: 'rgba(255,180,171,0.4)',
  },
  // Cooldown
  timerContainer: {
    marginVertical: 32,
    alignItems: 'center',
  },
  cooldownHint: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  // Granted
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 16,
  },
  grantedBadgeText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  grantedMessage: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  closeSection: {
    width: '100%',
    marginTop: 16,
  },
});
