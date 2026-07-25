import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraIcon, ImageIcon, UserIcon } from '../assets/Icon';
import { RootStackParamList } from '../navigation/types';
import { Gender } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SetupProfile'>;

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

// Chọn ảnh thật cần thư viện image-picker (native dependency) — chưa thêm ở bản demo này,
// nên 2 nút bên dưới chỉ mang tính minh hoạ.
const notifyPickerUnavailable = () =>
  Alert.alert('Chưa hỗ trợ', 'Chọn ảnh chưa được hỗ trợ trong bản demo này.');

export default function SetupProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!fullName.trim() || !dateOfBirth.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên và ngày sinh.');
      return;
    }
    setSubmitting(true);
    // Sau này có be thì: await createProfile({ fullName, bio, phoneNumber, gender, dateOfBirth, avatar, coverImage })
    setTimeout(() => {
      setSubmitting(false);
      navigation.navigate('Home');
    }, 400);
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      className="flex-1 bg-white dark:bg-[#0a0a0a]"
    >
      <View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Set Up Your Profile
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-1">
          This is how people will see you on Vibenet.
        </Text>
      </View>

      <View>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Cover Image
        </Text>
        <Pressable
          onPress={notifyPickerUnavailable}
          className="h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 items-center justify-center"
        >
          <ImageIcon size={26} />
          <Text className="text-sm text-gray-400 mt-2">Click to upload cover image</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={notifyPickerUnavailable}
          className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 items-center justify-center"
        >
          <UserIcon size={26} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            Profile Photo
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Recommended: square image, at least 200x200px
          </Text>
        </View>
        <CameraIcon size={18} />
      </View>

      <Field label="Full Name">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
          placeholderTextColor="#9CA3AF"
          textBreakStrategy="simple"
          className="border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
        />
      </Field>

      <Field label="Bio">
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="A few words about yourself..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textBreakStrategy="simple"
          className="border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
        />
      </Field>

      <Field label="Phone Number">
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="e.g. +84 912 345 678"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          className="border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
        />
      </Field>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Field label="Gender">
            <View className="flex-row gap-2">
              {GENDERS.map(g => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  className={`px-3 py-2 rounded-full border ${
                    gender === g
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 dark:border-white/10'
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
        </View>
      </View>

      <Field label="Date of Birth">
        <TextInput
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          className="border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
        />
      </Field>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-[#0f172a] rounded-xl py-3.5 items-center disabled:opacity-60"
      >
        <Text className="text-white font-semibold text-base">
          {submitting ? 'Saving...' : 'Complete Setup'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Home')} className="items-center py-2">
        <Text className="text-gray-500 text-sm font-medium">Skip for now</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</Text>
      {children}
    </View>
  );
}
