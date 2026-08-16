import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';

export interface InsetInputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export interface InsetInputGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * InsetInputGroup renders a small #F3F3F3 container housing #FDFDFD nested input fields.
 */
export const InsetInputGroup: React.FC<InsetInputGroupProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.groupContainer, style]}>{children}</View>;
};

/**
 * InsetInput renders a nested #FDFDFD input item designed for the InsetInputGroup.
 */
export const InsetInput: React.FC<InsetInputProps> = ({
  label,
  iconName,
  error,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.itemWrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorContainer,
        ]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={
              error
                ? Colors.statusLive
                : isFocused
                ? '#0D0E11'
                : '#8E95A5'
            }
            style={styles.icon}
          />
        )}

        <TextInput
          placeholderTextColor="#9CA3AF"
          style={styles.input}
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
              size={19}
              color={isFocused ? '#0D0E11' : '#8E95A5'}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    width: '100%',
    backgroundColor: '#F3F3F3',
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E8E8EC',
    gap: 6,
    marginBottom: Spacing.four,
  },
  itemWrapper: {
    width: '100%',
  },
  label: {
    ...Typography.bodySmall,
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
    marginLeft: Spacing.one,
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three + 2,
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#ECECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.15s ease-in-out',
      },
    }),
  },
  focused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0D0E11',
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(13, 14, 17, 0.06)',
      },
    }),
  },
  errorContainer: {
    borderColor: Colors.statusLive,
    backgroundColor: '#FFF8F8',
  },
  icon: {
    marginRight: Spacing.two + 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    fontWeight: '500',
    color: '#0D0E11',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  eyeButton: {
    padding: Spacing.one,
    marginLeft: Spacing.one,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.statusLive,
    marginTop: 3,
    marginLeft: Spacing.one,
  },
});
