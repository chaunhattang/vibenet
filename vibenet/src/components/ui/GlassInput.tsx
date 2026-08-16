import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  dark?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  iconName,
  error,
  containerStyle,
  isPassword = false,
  dark = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, dark && styles.labelDark]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          dark ? styles.inputContainerDark : styles.inputContainerLight,
          isFocused && (dark ? styles.focusedDark : styles.focusedLight),
          !!error && styles.errorContainer,
        ]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={19}
            color={
              error
                ? Colors.statusLive
                : isFocused
                ? Colors.textPrimary
                : Colors.textTertiary
            }
            style={styles.icon}
          />
        )}

        <TextInput
          placeholderTextColor={dark ? Colors.textTertiary : Colors.textPlaceholder}
          style={[styles.input, dark && styles.inputDark]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={dark ? Colors.textTertiary : Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.four,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.one + 2,
    marginLeft: Spacing.one,
  },
  labelDark: {
    color: Colors.textOnDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.four,
    borderWidth: 1.5,
  },
  inputContainerLight: {
    backgroundColor: '#F7F8FA',
    borderColor: '#E6E8EC',
  },
  inputContainerDark: {
    backgroundColor: 'rgba(35, 35, 40, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusedLight: {
    borderColor: Colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  focusedDark: {
    borderColor: Colors.surfaceWhite,
    backgroundColor: 'rgba(45, 45, 52, 0.95)',
  },
  errorContainer: {
    borderColor: Colors.statusLive,
  },
  icon: {
    marginRight: Spacing.three,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  inputDark: {
    color: Colors.textOnDark,
  },
  eyeButton: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.statusLive,
    marginTop: Spacing.one,
    marginLeft: Spacing.one,
  },
});
