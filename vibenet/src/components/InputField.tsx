import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

type InputFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export default function InputField({ label, error, className, ...rest }: InputFieldProps) {
  return (
    <View className="w-full mb-4">
      {label ? <Text className="text-white/70 text-sm mb-2">{label}</Text> : null}
      <TextInput
        placeholderTextColor="rgba(255,255,255,0.4)"
        className={`w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white ${className ?? ''}`}
        {...rest}
      />
      {error ? <Text className="text-red-400 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
