import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from './Icon';

const TAB_CONFIG = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'timer' },
  { name: 'Achievements', label: 'Stats', icon: 'bar-chart' },
  { name: 'Settings', label: 'Settings', icon: 'settings' },
] as const;

export default function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      {TAB_CONFIG.map((tab) => {
        const isActive = activeRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isActive ? '#4F8CFF' : '#C2C6D6'}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(19,19,24,0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228,225,233,0.1)',
    paddingTop: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(79,140,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.2)',
  },
  label: {
    color: '#C2C6D6',
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  activeLabel: {
    color: '#4F8CFF',
    fontWeight: '600',
  },
});
