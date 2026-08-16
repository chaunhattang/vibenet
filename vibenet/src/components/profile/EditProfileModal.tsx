import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radii, Spacing, Typography, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import * as usersApi from '../../services/api/users';
import { resolveMediaUrl } from '../../services/config';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { user, refreshCurrentUser } = useAuth();
  const profile = user?.profileResponse;

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarPicked, setAvatarPicked] = useState(false);
  const [coverPicked, setCoverPicked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && visible) {
      setFullName(profile?.fullName || '');
      setBio(profile?.bio || '');
      setAvatarUri(profile?.avatarUrl || null);
      setCoverUri(profile?.coverImageUrl || null);
      setAvatarPicked(false);
      setCoverPicked(false);
    }
  }, [user, visible]);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        setAvatarPicked(true);
      }
    } catch (err) {
      console.warn('Pick avatar error:', err);
    }
  };

  const handlePickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverUri(result.assets[0].uri);
        setCoverPicked(true);
      }
    } catch (err) {
      console.warn('Pick cover error:', err);
    }
  };

  const appendImage = (form: FormData, field: string, uri: string) => {
    const filename = uri.split('/').pop() || `${field}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1] : 'jpg';
    form.append(field, {
      uri,
      name: filename,
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    } as any);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const form = new FormData();
      form.append('fullName', fullName.trim());
      form.append('bio', bio.trim());
      if (avatarPicked && avatarUri) appendImage(form, 'avatar', avatarUri);
      if (coverPicked && coverUri) appendImage(form, 'coverImage', coverUri);

      if (profile) {
        await usersApi.updateProfile(form);
      } else {
        await usersApi.createProfile(form);
      }
      await refreshCurrentUser();
      onClose();
    } catch (err) {
      console.warn('Save profile failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSaving}
              style={styles.headerBtn}>
              <Text style={styles.doneText}>{isSaving ? 'Saving...' : 'Done'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Cover and Avatar Photos Section */}
            <View style={styles.photosSection}>
              {/* Cover Banner Preview */}
              <TouchableOpacity activeOpacity={0.85} onPress={handlePickCover} style={styles.coverWrap}>
                <Image
                  source={{ uri: (coverPicked ? coverUri : resolveMediaUrl(coverUri)) || DEFAULT_COVER }}
                  style={styles.coverImg}
                  contentFit="cover"
                />
                <View style={styles.changeCoverBadge}>
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={styles.changePhotoText}>Change Banner</Text>
                </View>
              </TouchableOpacity>

              {/* Avatar Preview */}
              <TouchableOpacity activeOpacity={0.85} onPress={handlePickAvatar} style={styles.avatarWrap}>
                <Image
                  source={{ uri: (avatarPicked ? avatarUri : resolveMediaUrl(avatarUri)) || DEFAULT_AVATAR }}
                  style={styles.avatarImg}
                />
                <View style={styles.changeAvatarOverlay}>
                  <Feather name="camera" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={handlePickAvatar}>
                <Text style={styles.changeAvatarBtnText}>Change Profile Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.fieldsSection}>
              {/* Full Name */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.textPlaceholder}
                  style={styles.fieldInput}
                />
              </View>

              {/* Username (read-only — no backend endpoint to change it) */}
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Username</Text>
                <Text style={[styles.fieldInput, { color: Colors.textTertiary }]}>@{user?.username}</Text>
              </View>

              {/* Bio */}
              <View style={[styles.fieldRow, styles.bioRow]}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  placeholder="Tell your story..."
                  placeholderTextColor={Colors.textPlaceholder}
                  style={[styles.fieldInput, styles.bioInput]}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: {
    padding: Spacing.one,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  doneText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  scrollContent: {
    paddingBottom: Spacing.eight,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  photosSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  coverWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#1E1E22',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  changeCoverBadge: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  avatarWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginTop: -43,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceMuted,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  changeAvatarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarBtnText: {
    color: Colors.accentBlue,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  fieldsSection: {
    paddingHorizontal: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bioRow: {
    alignItems: 'flex-start',
  },
  fieldLabel: {
    width: 85,
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  bioInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
