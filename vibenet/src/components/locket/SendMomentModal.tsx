import React, { useState } from "react";
import React, { useCallback, useState } from 'react';
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Colors,
  Radii,
  Spacing,
  Typography,
  MaxContentWidth,
} from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { createMoment } from "../../services/api/locket";
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radii, Spacing, Typography, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { createMoment, getCloseFriends, type CloseFriendResponse } from '../../services/api/locket';
import { resolveMediaUrl } from '../../services/config';

interface SendMomentModalProps {
  visible: boolean;
  onClose: () => void;
  onSendMoment: () => void; // caller refetches the moments feed
  onManageCloseFriends?: () => void;
}

export const SendMomentModal: React.FC<SendMomentModalProps> = ({
  visible,
  onClose,
  onSendMoment,
  onManageCloseFriends,
}) => {
  const { user } = useAuth();
  const [pickedImage, setPickedImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [caption, setCaption] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [closeFriends, setCloseFriends] = useState<CloseFriendResponse[]>([]);
  const [isLoadingCloseFriends, setIsLoadingCloseFriends] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadCloseFriends = useCallback(async () => {
    setIsLoadingCloseFriends(true);
    try {
      const res = await getCloseFriends();
      setCloseFriends(res.closeFriends);
      // Default to sending to everyone, same as Locket's default "blast" behavior.
      setSelectedIds(new Set(res.closeFriends.map((cf) => cf.userId)));
    } catch (err) {
      console.warn('Failed to load close friends', err);
    } finally {
      setIsLoadingCloseFriends(false);
    }
  }, []);

  const toggleRecipient = (friendId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const allSelected = closeFriends.length > 0 && selectedIds.size === closeFriends.length;

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        legacy: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `moment-${Date.now()}.jpg`;
        setPickedImage({
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          name: fileName,
        });
      }
    } catch (err) {
      console.warn("Pick moment image error:", err);
    }
  };

  const handleSend = async () => {
    if (!user || !pickedImage) return;
    if (closeFriends.length > 0 && selectedIds.size === 0) {
      Alert.alert('No recipients selected', 'Pick at least one close friend to send this moment to.');
      return;
    }
    setIsSending(true);
    try {
      const form = new FormData();
      if (Platform.OS === "web") {
        try {
          const res = await fetch(pickedImage.uri);
          const blob = await res.blob();
          form.append("media", blob, pickedImage.name);
        } catch {
          form.append("media", pickedImage as unknown as Blob);
        }
      } else {
        form.append("media", pickedImage as unknown as Blob);
      }
      if (caption.trim()) form.append("caption", caption.trim());
      if (caption.trim()) form.append('caption', caption.trim());
      // Omit recipientIds when everyone is selected - backend defaults to "all close friends".
      if (!allSelected) {
        selectedIds.forEach((id) => form.append('recipientIds', id));
      }

      await createMoment(form);
      onSendMoment();
      setCaption("");
      setPickedImage(null);
      onClose();
    } catch (err) {
      Alert.alert(
        "Could not send moment",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  React.useEffect(() => {
    if (visible) loadCloseFriends();
  }, [visible, loadCloseFriends]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.headerBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>New Locket Moment</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSend}
              disabled={isSending || !pickedImage}
              style={[
                styles.sendHeaderBtn,
                !pickedImage && styles.sendHeaderBtnDisabled,
              ]}
            >
              <Text style={styles.sendHeaderText}>
                {isSending ? "Sending..." : "Blast"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Viewfinder Preview */}
            <View style={styles.viewfinderWrap}>
              {pickedImage ? (
                <Image
                  source={{ uri: pickedImage.uri }}
                  style={styles.momentPreview}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.emptyPreview}>
                  <Feather
                    name="image"
                    size={32}
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text style={styles.emptyPreviewText}>
                    Pick a photo to send
                  </Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
                style={styles.choosePhotoBtn}
              >
                <Feather name="image" size={15} color="#FFFFFF" />
                <Text style={styles.choosePhotoText}>Pick from Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Caption Input */}
            <View style={styles.inputSection}>
              <TextInput
                placeholder="Add a live note or caption..."
                placeholderTextColor={Colors.textPlaceholder}
                value={caption}
                onChangeText={setCaption}
                style={styles.captionInput}
              />
            </View>

            {/* Recipient Audience Info (sent to all close friends by default) */}
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons
                  name="people"
                  size={18}
                  color={Colors.statusCloseFriend}
                />
                <Text style={styles.optionLabel}>Send to</Text>
              </View>
              <View style={styles.audienceBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.audienceText}>All Close Friends</Text>
            {/* Recipient Audience Info - tap a friend to include/exclude them from this moment */}
            <View style={styles.audienceSection}>
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="people" size={18} color={Colors.statusCloseFriend} />
                  <Text style={styles.optionLabel}>Send to</Text>
                </View>
                {isLoadingCloseFriends ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : closeFriends.length > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setSelectedIds(
                        allSelected ? new Set() : new Set(closeFriends.map((cf) => cf.userId))
                      )
                    }
                    style={styles.audienceBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.audienceText}>
                      {allSelected
                        ? `All Close Friends (${closeFriends.length})`
                        : `${selectedIds.size} of ${closeFriends.length} selected`}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.audienceBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.audienceText}>No close friends</Text>
                  </View>
                )}
              </View>

              {!isLoadingCloseFriends && closeFriends.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipientsRow}>
                  {closeFriends.map((cf) => {
                    const isSelected = selectedIds.has(cf.userId);
                    return (
                      <TouchableOpacity
                        key={cf.userId}
                        activeOpacity={0.7}
                        onPress={() => toggleRecipient(cf.userId)}
                        style={styles.recipientChip}>
                        <View style={styles.recipientAvatarWrap}>
                          <Image
                            source={{ uri: resolveMediaUrl(cf.avatarUrl) }}
                            style={[styles.recipientAvatar, !isSelected && styles.recipientAvatarDimmed]}
                          />
                          {isSelected ? (
                            <View style={styles.recipientCheckBadge}>
                              <Ionicons name="checkmark" size={11} color="#0D0E11" />
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.recipientName, !isSelected && styles.recipientNameDimmed]} numberOfLines={1}>
                          {(cf.fullName || cf.userName).split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}

              {!isLoadingCloseFriends && closeFriends.length === 0 ? (
                <View style={styles.noRecipientsWarning}>
                  <Text style={styles.noRecipientsText}>
                    You have no close friends yet, so this moment won't reach anyone.
                  </Text>
                  {onManageCloseFriends ? (
                    <TouchableOpacity activeOpacity={0.8} onPress={onManageCloseFriends}>
                      <Text style={styles.manageFriendsLink}>Add close friends</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
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
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#0D0E11",
  },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerBtn: {
    padding: Spacing.one,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: "rgba(255, 255, 255, 0.6)",
  },
  sendHeaderBtn: {
    backgroundColor: Colors.statusCloseFriend,
    paddingHorizontal: Spacing.four,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  sendHeaderBtnDisabled: {
    opacity: 0.4,
  },
  sendHeaderText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
  viewfinderWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: Radii.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1E1E22",
    marginBottom: Spacing.four,
  },
  momentPreview: {
    width: "100%",
    height: "100%",
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  emptyPreviewText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  choosePhotoBtn: {
    position: "absolute",
    bottom: Spacing.three,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  choosePhotoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  inputSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginBottom: Spacing.four,
  },
  captionInput: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  audienceSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.one,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  audienceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.statusCloseFriend,
  },
  audienceText: {
    color: Colors.statusCloseFriend,
    fontSize: 12,
    fontWeight: "700",
  },
  recipientsRow: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  recipientChip: {
    alignItems: 'center',
    width: 56,
  },
  recipientAvatarWrap: {
    position: 'relative',
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E22',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recipientAvatarDimmed: {
    opacity: 0.3,
  },
  recipientCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.statusCloseFriend,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0E11',
  },
  recipientName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  recipientNameDimmed: {
    color: 'rgba(255,255,255,0.35)',
  },
  noRecipientsWarning: {
    paddingBottom: Spacing.three,
    gap: 6,
  },
  noRecipientsText: {
    color: '#FF9F43',
    fontSize: 12,
  },
  manageFriendsLink: {
    color: Colors.statusCloseFriend,
    fontSize: 12,
    fontWeight: '700',
  },
});
