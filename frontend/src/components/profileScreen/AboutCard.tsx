import { ComponentType } from 'react';
import { Text, View } from 'react-native';
import { CalendarIcon, MailIcon, PhoneIcon, UserIcon } from '../../assets/Icon';
import { ProfileDetails } from '../../types';

type AboutRow = { Icon: ComponentType<{ size?: number }>; text: string };

export default function AboutCard({ profile }: { profile: ProfileDetails }) {
  const rows: AboutRow[] = [];
  if (profile.phoneNumber) rows.push({ Icon: PhoneIcon, text: profile.phoneNumber });
  if (profile.email) rows.push({ Icon: MailIcon, text: profile.email });
  if (profile.dateOfBirth) rows.push({ Icon: CalendarIcon, text: profile.dateOfBirth });
  if (profile.gender) {
    rows.push({
      Icon: UserIcon,
      text: profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase(),
    });
  }

  if (rows.length === 0) return null;

  return (
    <View className="bg-gray-50 dark:bg-[#11131F] rounded-2xl p-4 border border-gray-200 dark:border-white/5">
      <Text className="font-bold text-gray-900 dark:text-white mb-3">About</Text>
      <View style={{ gap: 10 }}>
        {rows.map((row, i) => (
          <View key={i} className="flex-row items-center gap-3">
            <row.Icon size={16} />
            <Text className="text-gray-600 dark:text-gray-400 text-sm">{row.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
