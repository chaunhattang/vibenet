import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type ButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export default function Button({ label, loading, variant = 'primary', className, disabled, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`items-center justify-center rounded-full py-4 px-6 ${
        isPrimary ? 'bg-white' : 'bg-white/10 border border-white/20'
      } ${disabled || loading ? 'opacity-50' : ''} ${className ?? ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#0f172a' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-semibold ${isPrimary ? 'text-slate-900' : 'text-white'}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
