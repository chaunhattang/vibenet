import { ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../../assets/Icon';
import { Gender, ProfileDetails } from '../../types';

type EditProfileModalProps = {
  visible: boolean;
  profile: ProfileDetails;
  onClose: () => void;
  onSave: (updated: ProfileDetails) => void;
};

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

export default function EditProfileModal({
  visible,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(profile.fullName);
  const [bio, setBio] = useState(profile.bio);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? '');
  const [gender, setGender] = useState<Gender>(profile.gender ?? 'OTHER');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? '');

  const handleSave = () => {
    // Sau này có be thì: await updateProfile({...}) rồi mới onSave với data server trả về
    onSave({
      ...profile,
      fullName: fullName.trim() || profile.fullName,
      bio: bio.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      gender,
      dateOfBirth: dateOfBirth.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          style={{ maxHeight: '85%', paddingBottom: insets.bottom + 16 }}
          className="bg-white dark:bg-[#181825] rounded-t-3xl"
        >
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Profile
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Field label="Full Name">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                textBreakStrategy="simple"
                className="border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </Field>

            <Field label="Bio">
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textBreakStrategy="simple"
                className="border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
              />
            </Field>

            <Field label="Phone Number">
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                className="border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </Field>

            <Field label="Date of Birth">
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              />
            </Field>

            <Field label="Gender">
              <View className="flex-row gap-2">
                {GENDERS.map(g => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    className={`px-4 py-2 rounded-full border ${
                      gender === g
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-transparent border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        gender === g ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>
          </ScrollView>

          <View className="px-5 pt-2">
            <Pressable
              onPress={handleSave}
              className="bg-indigo-600 rounded-full py-3.5 items-center"
            >
              <Text className="text-white font-semibold text-base">Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </Text>
      {children}
    </View>
  );
}
