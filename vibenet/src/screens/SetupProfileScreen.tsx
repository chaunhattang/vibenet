import { ReactNode, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraIcon, ImageIcon, UserIcon } from '../assets/Icon';
import GradientButton from '../components/ui/GradientButton';
import { useGoToTab } from '../hooks/useGoToTab';
import { PLACEHOLDER } from '../theme/colors';
import { Gender } from '../types';

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

// Chọn ảnh thật cần thư viện image-picker (native dependency) — chưa thêm ở bản demo này,
// nên 2 nút bên dưới chỉ mang tính minh hoạ.
const notifyPickerUnavailable = () =>
  Alert.alert('Chưa hỗ trợ', 'Chọn ảnh chưa được hỗ trợ trong bản demo này.');

export default function SetupProfileScreen() {
  const goToTab = useGoToTab();
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
      goToTab('home');
    }, 400);
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      className="flex-1 bg-paper-base dark:bg-ink-base"
    >
      <View>
        <Text className="text-title text-content-strong dark:text-content-strong-dark">
          Set Up Your Profile
        </Text>
        <Text className="text-content-muted dark:text-content-muted-dark mt-1">
          This is how people will see you on Vibenet.
        </Text>
      </View>

      <View>
        <Text className="text-sm font-semibold text-content-strong dark:text-content-strong-dark mb-2">
          Cover Image
        </Text>
        <Pressable
          onPress={notifyPickerUnavailable}
          className="h-32 rounded-hero border-2 border-dashed border-hairline-light dark:border-hairline-dark items-center justify-center"
        >
          <ImageIcon size={26} />
          <Text className="text-sm text-content-faint dark:text-content-faint-dark mt-2">
            Click to upload cover image
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={notifyPickerUnavailable}
          className="w-20 h-20 rounded-[24px] border-2 border-dashed border-hairline-light dark:border-hairline-dark items-center justify-center"
        >
          <UserIcon size={26} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-content-strong dark:text-content-strong-dark">
            Profile Photo
          </Text>
          <Text className="text-xs text-content-muted dark:text-content-muted-dark mt-0.5">
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
          placeholderTextColor={PLACEHOLDER}
          textBreakStrategy="simple"
          className="border border-hairline-light dark:border-hairline-dark rounded-field px-4 py-3 text-content-strong dark:text-content-strong-dark"
        />
      </Field>

      <Field label="Bio">
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="A few words about yourself..."
          placeholderTextColor={PLACEHOLDER}
          multiline
          numberOfLines={3}
          textBreakStrategy="simple"
          className="border border-hairline-light dark:border-hairline-dark rounded-field px-4 py-3 text-content-strong dark:text-content-strong-dark min-h-[80px]"
        />
      </Field>

      <Field label="Phone Number">
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="e.g. +84 912 345 678"
          placeholderTextColor={PLACEHOLDER}
          keyboardType="phone-pad"
          className="border border-hairline-light dark:border-hairline-dark rounded-field px-4 py-3 text-content-strong dark:text-content-strong-dark"
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
                      ? 'bg-brand border-brand'
                      : 'border-hairline-light dark:border-hairline-dark'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      gender === g
                        ? 'text-white'
                        : 'text-content-muted dark:text-content-muted-dark'
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
          placeholderTextColor={PLACEHOLDER}
          className="border border-hairline-light dark:border-hairline-dark rounded-field px-4 py-3 text-content-strong dark:text-content-strong-dark"
        />
      </Field>

      <GradientButton
        onPress={handleSubmit}
        disabled={submitting}
        loading={submitting}
        label={submitting ? 'Saving...' : 'Complete Setup'}
      />

      <Pressable onPress={() => goToTab('home')} className="items-center py-2">
        <Text className="text-content-muted dark:text-content-muted-dark text-sm font-medium">
          Skip for now
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-semibold text-content-strong dark:text-content-strong-dark mb-2">
        {label}
      </Text>
      {children}
    </View>
  );
}
