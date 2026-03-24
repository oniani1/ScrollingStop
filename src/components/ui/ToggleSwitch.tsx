import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../../theme/colors';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const THUMB_MARGIN = 2;
const TRANSLATE_X = TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animValue]);

  const thumbTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_MARGIN, THUMB_MARGIN + TRANSLATE_X],
  });

  const trackColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerHighest, colors.success],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      style={[styles.wrapper, disabled && styles.disabled]}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbTranslateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ToggleSwitch;
