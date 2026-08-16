import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Typography, Spacing } from '../../constants/theme';

interface AuthSegmentedSwitchProps {
  activeTab: 'login' | 'register';
  onSelectTab: (tab: 'login' | 'register') => void;
}

/**
 * Small #F3F3F3 segmented container with a #FDFDFD nested active pill
 */
export const AuthSegmentedSwitch: React.FC<AuthSegmentedSwitchProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectTab('login')}
        style={[styles.tab, activeTab === 'login' && styles.activeTab]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'login' ? styles.activeTabText : styles.inactiveTabText,
          ]}>
          Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectTab('register')}
        style={[styles.tab, activeTab === 'register' && styles.activeTab]}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'register' ? styles.activeTabText : styles.inactiveTabText,
          ]}>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 42,
    backgroundColor: '#F3F3F3',
    borderRadius: 14,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    marginBottom: Spacing.four,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeTab: {
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#ECECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  tabText: {
    ...Typography.bodySmall,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  activeTabText: {
    fontWeight: '700',
    color: '#0D0E11',
  },
  inactiveTabText: {
    fontWeight: '500',
    color: '#717684',
  },
});
