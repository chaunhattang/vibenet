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
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Colors, Radii, Spacing, MomentAspectRatio } from '../../constants/theme';
import { createMoment, type MomentCreationResponse } from '../../services/api/locket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_WIDTH = SCREEN_WIDTH - Spacing.four * 2;
const VIEWFINDER_HEIGHT = VIEWFINDER_WIDTH * MomentAspectRatio;

// The camera sensor's native capture ratio rarely matches the moment card's display
// ratio, so center-crop every capture to MomentAspectRatio before it's ever uploaded —
// what's framed in the on-screen viewfinder is then exactly what gets posted.
async function cropToMomentRatio(photo: { uri: string; width: number; height: number }) {
  const currentRatio = photo.height / photo.width;
  let cropWidth = photo.width;
  let cropHeight = photo.height;
  if (currentRatio > MomentAspectRatio) {
    cropHeight = Math.round(photo.width * MomentAspectRatio);
  } else {
    cropWidth = Math.round(photo.height / MomentAspectRatio);
  }
  const originX = Math.round((photo.width - cropWidth) / 2);
  const originY = Math.round((photo.height - cropHeight) / 2);

  return manipulateAsync(
    photo.uri,
    [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
    { compress: 0.9, format: SaveFormat.JPEG }
  );
}

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
  const insets = useSafeAreaInsets();
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
        const cropped = await cropToMomentRatio(result);
        setPhoto({ uri: cropped.uri, mimeType: 'image/jpeg' });
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
            {/* Framed to the same ratio as the moment card so the review screen shows
                exactly what was already center-cropped in cropToMomentRatio(). */}
            <View style={styles.previewCenterArea}>
              <View style={[styles.viewfinderFrame, { width: VIEWFINDER_WIDTH, height: VIEWFINDER_HEIGHT }]}>
                <Image source={{ uri: photo.uri }} style={styles.frameMedia} contentFit="cover" />
              </View>
            </View>

            {/* topBar stays absolutely positioned (doesn't need keyboard avoidance).
                captionBar is a normal flex child below so it actually gets pushed up by
                KeyboardAvoidingView's padding — an absolutely-positioned overlay wrapping
                both was found to not reliably track that padding on iOS. */}
            <View style={[styles.topBar, styles.topBarAbsolute, { top: insets.top + Spacing.two }]}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setPhoto(null)} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <SafeAreaView edges={['bottom']} style={styles.captionSafeArea} pointerEvents="box-none">
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
            {/* Framed to MomentAspectRatio so what's composed here matches the moment
                card's display ratio — see cropToMomentRatio() for the capture-time crop. */}
            <View style={styles.previewCenterArea}>
              <View style={[styles.viewfinderFrame, { width: VIEWFINDER_WIDTH, height: VIEWFINDER_HEIGHT }]}>
                <CameraView ref={cameraRef} style={styles.frameMedia} facing={facing} />
              </View>
            </View>

            {/* Plain View, not SafeAreaView — this overlay is absolutely positioned to
                fill the Modal (see overlaySafeArea), and SafeAreaView's automatic inset
                padding isn't reliable measured against a <Modal>'s own surface, so insets
                are applied manually here (same approach the post-capture topBar already
                uses below). */}
            <View style={styles.overlaySafeArea} pointerEvents="box-none">
              <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
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

              <View style={[styles.shutterRow, { paddingBottom: insets.bottom + Spacing.eight }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isCapturing}
                  onPress={handleCapture}
                  style={styles.shutterOuter}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>
            </View>
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
  previewCenterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderFrame: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  frameMedia: {
    width: '100%',
    height: '100%',
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
  // Sits above the photo preview without participating in flex layout, since it
  // doesn't need to move for the keyboard the way captionSafeArea does.
  topBarAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 0,
  },
  captionSafeArea: {
    justifyContent: 'flex-end',
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
