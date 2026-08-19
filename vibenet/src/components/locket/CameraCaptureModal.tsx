import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Colors, Radii, Spacing } from '../../constants/theme';
import { createMoment, type MomentCreationResponse } from '../../services/api/locket';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateMoment: (moment: MomentCreationResponse) => void;
}

interface CapturedPhoto {
  uri: string;
  mimeType: string;
}

async function toFormFile(photo: CapturedPhoto): Promise<any> {
  if (Platform.OS === 'web') {
    try {
      const res = await fetch(photo.uri);
      return await res.blob();
    } catch {
      // fallback below
    }
  }
  return { uri: photo.uri, name: 'moment.jpg', type: photo.mimeType } as unknown as Blob;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  visible,
  onClose,
  onCreateMoment,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [caption, setCaption] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const resetAndClose = () => {
    setPhoto(null);
    setCaption('');
    onClose();
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (result) {
        setPhoto({ uri: result.uri, mimeType: 'image/jpeg' });
      }
    } catch (err) {
      console.warn('Capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePost = async () => {
    if (!photo) return;
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('media', await toFormFile(photo));
      if (caption.trim()) form.append('caption', caption.trim());
      const created = await createMoment(form);
      onCreateMoment(created);
      resetAndClose();
    } catch (err) {
      Alert.alert('Could not post moment', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={resetAndClose}>
      <View style={styles.root}>
        {photo ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.root}>
            <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" />

            <SafeAreaView style={styles.overlaySafeArea}>
              <View style={styles.topBar}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setPhoto(null)} style={styles.iconBtn}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.captionBar}>
                <TextInput
                  placeholder="Add a caption..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={caption}
                  onChangeText={setCaption}
                  style={styles.captionInput}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  onPress={handlePost}
                  style={styles.postBtn}>
                  {isSubmitting ? (
                    <Text style={styles.postBtnText}>Posting…</Text>
                  ) : (
                    <Feather name="send" size={18} color="#0D0E11" />
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        ) : !permission ? (
          <View style={styles.centered} />
        ) : !permission.granted ? (
          <SafeAreaView style={styles.centered}>
            <Ionicons name="camera-outline" size={40} color="rgba(255,255,255,0.6)" />
            <Text style={styles.permissionText}>
              VibeNet needs camera access to capture a moment.
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={requestPermission} style={styles.permissionBtn}>
              <Text style={styles.permissionBtnText}>Allow Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={resetAndClose} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        ) : (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

            <SafeAreaView style={styles.overlaySafeArea} pointerEvents="box-none">
              <View style={styles.topBar}>
                <TouchableOpacity activeOpacity={0.7} onPress={resetAndClose} style={styles.iconBtn}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                  style={styles.iconBtn}>
                  <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.shutterRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isCapturing}
                  onPress={handleCapture}
                  style={styles.shutterOuter}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  overlaySafeArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRow: {
    alignItems: 'center',
    paddingBottom: Spacing.eight,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  captionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.six,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingLeft: Spacing.four,
    paddingRight: Spacing.two,
    height: 50,
  },
  captionInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
  },
  postBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    color: '#0D0E11',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.six,
  },
  permissionText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: Colors.statusCloseFriend,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelLink: {
    paddingVertical: Spacing.two,
  },
  cancelLinkText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
});
