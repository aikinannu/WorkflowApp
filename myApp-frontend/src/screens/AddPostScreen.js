import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Image, TextInput, useWindowDimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { enrichAssetMetadata } from "../api/mediaUtils";
import { social } from "../api/apiClient";
import AppHeader from "../components/AppHeader";

const options = ["Photo", "Video", "Story", "Product", "Job"];

const mediaConfigs = {
  Photo: {
    title: "Create a photo post",
    subtitle: "Upload or capture one or more photos to share with your community.",
    mediaTypes: "Images",
    allowsMultiple: true,
    uploadLabel: "Upload photos",
    recordLabel: "Capture photo",
  },
  Video: {
    title: "Create a video post",
    subtitle: "Upload or record a short video for your feed.",
    mediaTypes: "Videos",
    allowsMultiple: false,
    uploadLabel: "Upload video",
    recordLabel: "Record video",
  },
  Story: {
    title: "Create a story",
    subtitle: "Share a quick photo or short video story.",
    mediaTypes: "All",
    allowsMultiple: true,
    uploadLabel: "Upload story",
    recordLabel: "Record story",
  },
};

function normalizeAsset(asset) {
  const uri = asset.uri || asset.localUri || asset.uri;
  const name = asset.name || asset.fileName || uri?.split("/").pop() || "media";
  let type = asset.type || asset.mediaType || asset.mimeType;
  const width = asset.width || asset.metadata?.width;
  const height = asset.height || asset.metadata?.height;
  if (type === "image" || type === "video") {
    type = `${type}/*`;
  }
  if (!type && uri && uri.includes(".")) {
    const ext = uri.split(".").pop().toLowerCase();
    type = ext === "mp4" || ext === "mov" ? "video/*" : "image/*";
  }
  return { name, uri, type: type || "application/octet-stream", file: asset.file, width, height };
}

export default function AddPostScreen({ navigation }) {
  
  const { user } = useAuth();
  const [selected, setSelected] = useState(options[0]);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isFocused = useIsFocused();
 
  
  // Camera overlay states
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraPreview, setCameraPreview] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const cameraRequestedRef = useRef(false);
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [isRecording, setIsRecording] = useState(false);
  const recordingPromiseRef = useRef(null);
  const [CameraModule, setCameraModule] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (Platform.OS !== 'web') {
      import('expo-camera')
        .then((mod) => {
          if (mounted) setCameraModule(mod);
        })
        .catch((err) => {
          console.warn('expo-camera dynamic import failed', err);
        });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const CameraComp = CameraModule ? CameraModule.Camera || CameraModule.default : null;

  const removeFile = (uri) => {
    setFiles((prev) => prev.filter((file) => file.uri !== uri));
  };

  const handleMediaAssets = (result) => {
    if (!result) return;
    const chosen = Array.isArray(result.assets)
      ? result.assets
      : result.selected || (result.uri ? [result] : []);
    (async () => {
      try {
        const enriched = await Promise.all((chosen || []).map(enrichAssetMetadata));
        const mapped = enriched.map(normalizeAsset);
        setFiles((prev) => {
          if (selected === "Video") {
            return mapped.length ? [mapped[0]] : prev;
          }
          return [...prev, ...mapped];
        });
      } catch (e) {
        console.warn('asset enrichment failed', e);
        const mapped = (chosen || []).map(normalizeAsset);
        setFiles((prev) => {
          if (selected === "Video") {
            return mapped.length ? [mapped[0]] : prev;
          }
          return [...prev, ...mapped];
        });
      }
    })();
  };

  const openFilePickerWeb = (accept, allowsMultiple = false) => {
    if (Platform.OS !== "web") return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = allowsMultiple;
    input.onchange = async (event) => {
      const fileList = Array.from(event.target.files || []);
      const assets = fileList.map((file) => ({
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type || (file.type.startsWith("video") ? "video/*" : "image/*"),
        file,
      }));
      handleMediaAssets({ assets });
    };
    input.click();
  };

  const chooseMediaFromLibrary = async (mediaTypes, allowsMultiple = false) => {
    if (Platform.OS === "web") {
      const accept = mediaTypes === "Videos" ? "video/*" : mediaTypes === "All" ? "image/*,video/*" : "image/*";
      openFilePickerWeb(accept, allowsMultiple);
      return;
    }

    try {
      const ImagePicker = await import("expo-image-picker");
      const pickerMediaTypes =
        mediaTypes === "Videos"
          ? ImagePicker.MediaTypeOptions.Videos
          : mediaTypes === "All"
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images;
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!status.granted) {
        alert("Media library permission is required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: pickerMediaTypes,
        allowsMultipleSelection: allowsMultiple,
        quality: 0.8,
      });
      handleMediaAssets(result);
    } catch (error) {
      console.warn("chooseMediaFromLibrary error", error);
    }
  };

  const recordMedia = async (mediaTypes) => {
    if (Platform.OS === "web") {
      alert("Recording is not available on web. Please upload a file instead.");
      return;
    }

    try {
      const ImagePicker = await import("expo-image-picker");
      const pickerMediaTypes =
        mediaTypes === "Videos"
          ? ImagePicker.MediaTypeOptions.Videos
          : mediaTypes === "All"
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images;
      const status = await ImagePicker.requestCameraPermissionsAsync();
      if (!status.granted) {
        alert("Camera permission is required to record media.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: pickerMediaTypes,
        quality: 0.8,
      });
      handleMediaAssets(result);
    } catch (error) {
      console.warn("recordMedia error", error);
    }
  };

  const openCameraOverlay = async () => {
    // For web, fallback to ImagePicker/alert
    if (Platform.OS === "web") {
      alert("Camera UI is not available on web — use upload instead.");
      return;
    }
    setCameraPreview(null);
    setCameraOpen(true);
    cameraRequestedRef.current = true;
  };

  const handleSelectOption = (option) => {
    if (option === 'Product') {
      navigation.navigate('SellProduct');
      return;
    }
    if (option === 'Job') {
      navigation.navigate('PostJob');
      return;
    }
    // Photo / Video / Story -> set mode and open camera overlay on mobile
    setSelected(option);
    if (!isDesktop) {
      openCameraOverlay();
    } else {
      // on desktop, also open the two-column camera layout
      setCameraOpen(true);
    }
  };

  const closeCameraOverlay = () => {
    setCameraOpen(false);
    setCameraPreview(null);
    cameraRequestedRef.current = false;
  };

  const handleCaptureWithPicker = async () => {
    setCapturing(true);
    try {
      const ImagePicker = await import("expo-image-picker");
      const pickerMediaTypes =
        selected === "Video"
          ? ImagePicker.MediaTypeOptions.Videos
          : selected === "Story"
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images;
      const status = await ImagePicker.requestCameraPermissionsAsync();
      if (!status.granted) {
        alert("Camera permission is required to capture media.");
        setCapturing(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: pickerMediaTypes, quality: 0.8 });
      if (!result) {
        setCapturing(false);
        return;
      }
      const assets = Array.isArray(result.assets) ? result.assets : result.uri ? [{ uri: result.uri, type: result.type || (result.uri.endsWith('.mp4') ? 'video/*' : 'image/*') }] : [];
      if (assets.length) {
        // add to selected files and keep preview open so user can retake or confirm
        handleMediaAssets({ assets });
        setCameraPreview(assets[0]);
      }
    } catch (e) {
      console.warn("camera capture failed", e);
      alert("Unable to access camera.");
    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (cameraOpen) {
      (async () => {
        try {
          if (!CameraModule) {
            if (mounted) setHasCameraPermission(false);
            return;
          }
          const { status } = await CameraModule.requestCameraPermissionsAsync();
          let mic = { status: 'granted' };
          if (selected === 'Video' || selected === 'Story') {
            try {
              mic = await CameraModule.requestMicrophonePermissionsAsync();
            } catch (e) {
              mic = { status: 'denied' };
            }
          }
          if (mounted) setHasCameraPermission(status === 'granted' && mic.status === 'granted');
        } catch (e) {
          console.warn('camera permission error', e);
          if (mounted) setHasCameraPermission(false);
        }
      })();
    } else {
      setHasCameraPermission(null);
    }
    return () => {
      mounted = false;
    };
  }, [cameraOpen, selected, CameraModule]);

  const takePicture = async () => {
    setCapturing(true);
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const asset = { uri: photo.uri, width: photo.width, height: photo.height, type: 'image/*', name: photo.uri.split('/').pop() };
      handleMediaAssets({ assets: [asset] });
      setCameraPreview(asset);
    } catch (e) {
      console.warn('takePicture error', e);
      alert('Capture failed');
    } finally {
      setCapturing(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!cameraRef.current) return;
      setIsRecording(true);
      const promise = cameraRef.current.recordAsync();
      recordingPromiseRef.current = promise;
      const video = await promise;
      const asset = { uri: video.uri, type: 'video/*', name: video.uri.split('/').pop() };
      handleMediaAssets({ assets: [asset] });
      setCameraPreview(asset);
    } catch (e) {
      console.warn('startRecording error', e);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (cameraRef.current && isRecording) {
        cameraRef.current.stopRecording();
      }
    } catch (e) {
      console.warn('stopRecording error', e);
    }
  };

  const toggleFlash = () => setFlashMode((f) => (f === 'off' ? 'on' : 'off'));
  const switchCamera = () => setCameraType((t) => (t === 'back' ? 'front' : 'back'));

  const handleCreatePost = async () => {
    if (!user?.tenant_id) {
      alert("Unable to create post: missing tenant context.");
      return;
    }

    if (selected === "Product") {
      navigation.navigate("SellProduct");
      return;
    }

    if (selected === "Job") {
      navigation.navigate("PostJob");
      return;
    }

    setSubmitting(true);
    try {
      let uploaded = [];
      if (files.length) {
        const { uploadFiles } = await import("../api/mediaUploader");
        uploaded = await uploadFiles(files, user.tenant_id);
      }
      const media = uploaded.map((m) => ({ id: m.id, url: m.url, filename: m.filename }));
      await social.createPost({
        content: content || `New ${selected.toLowerCase()} post from ${user.email || "community member"}`,
        tenant_id: user.tenant_id,
        media,
        post_type: selected,
      });
      alert("Post submitted successfully.");
      navigation.goBack();
    } catch (error) {
      console.warn(error);
      alert(error.message || "Unable to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  // When the screen becomes focused on mobile and the user opened Add via tab, open camera
  useEffect(() => {
    if (isFocused && !isDesktop && cameraRequestedRef.current) {
      openCameraOverlay();
    }
  }, [isFocused]);

  const config = mediaConfigs[selected] || mediaConfigs.Photo;
  const buttonText = selected === "Product" ? "Create product listing" : selected === "Job" ? "Create job post" : submitting ? "Publishing..." : "Publish post";

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Create Post" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.optionRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionPill, selected === option ? styles.optionPillActive : null]}
              onPress={() => handleSelectOption(option)}
            >
              <Text style={[styles.optionText, selected === option ? styles.optionTextActive : null]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected === "Photo" || selected === "Video" || selected === "Story" ? (
          <View style={styles.mediaPanel}>
            <Text style={styles.heading}>{config.title}</Text>
            <Text style={styles.subheading}>{config.subtitle}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => chooseMediaFromLibrary(config.mediaTypes, config.allowsMultiple)}>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>{config.uploadLabel}</Text>
              </TouchableOpacity>
              {Platform.OS !== "web" ? (
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => openCameraOverlay()}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>{config.recordLabel}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {files.length ? (
              <View style={styles.previewGrid}>
                {files.map((file) => (
                  <View key={file.uri} style={styles.previewItem}>
                    {file.type?.startsWith("video") ? (
                      <View style={styles.videoPreview}>
                        <Text style={styles.videoLabel}>VIDEO</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: file.uri }} style={styles.previewImage} />
                    )}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(file.uri)}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>No media selected yet.</Text>
              </View>
            )}
          </View>
        ) : selected === "Product" ? (
          <View style={styles.calloutCard}>
            <Text style={styles.heading}>Sell a product</Text>
            <Text style={styles.subheading}>Use the dedicated marketplace flow to publish a product listing.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("SellProduct")}> 
              <Text style={styles.primaryButtonText}>Go to Sell Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.calloutCard}>
            <Text style={styles.heading}>Post a job</Text>
            <Text style={styles.subheading}>Create a job posting with a dedicated workflow.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("PostJob")}> 
              <Text style={styles.primaryButtonText}>Go to Job Post</Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder="Write a caption, description, or story..."
          multiline
          editable={!submitting}
        />

        <TouchableOpacity style={[styles.submitButton, submitting ? styles.submitButtonDisabled : null]} onPress={handleCreatePost} disabled={submitting}>
          <Text style={styles.submitButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </ScrollView>
      {cameraOpen && (
        <View style={[styles.cameraOverlay, isDesktop ? styles.cameraOverlayDesktop : null]}>
          <View style={styles.cameraTop}>
            <TouchableOpacity onPress={closeCameraOverlay} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>{selected}</Text>
            <View style={{ width: 36 }} />
          </View>

          {!isDesktop ? (
            <View style={styles.cameraViewCenter}>
              {!cameraPreview ? (
                <>
                  {hasCameraPermission && CameraComp ? (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                      <CameraComp ref={cameraRef} style={{ width: '100%', height: 420 }} type={CameraModule.Constants.Type[cameraType]} flashMode={CameraModule.Constants.FlashMode[flashMode]} ratio="16:9" />
                      <View style={styles.cameraControlsOverlay}>
                        <TouchableOpacity onPress={switchCamera} style={{ padding: 8 }}>
                          <Ionicons name="camera-reverse" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.captureButton} onPress={selected === 'Video' ? (isRecording ? stopRecording : startRecording) : takePicture} disabled={capturing || isRecording}>
                          {isRecording || capturing ? <ActivityIndicator color="#fff" /> : <View style={styles.captureInner} />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleFlash} style={{ padding: 8 }}>
                          <Ionicons name={flashMode === 'on' ? "flash" : "flash-off"} size={22} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.captureButton} onPress={handleCaptureWithPicker} disabled={capturing}>
                      {capturing ? <ActivityIndicator color="#fff" /> : <View style={styles.captureInner} />}
                    </TouchableOpacity>
                  )}
                  <View style={styles.cameraFooter}>
                    <TouchableOpacity onPress={() => setSelected('Photo')}>
                      <Text style={selected === 'Photo' ? styles.cameraModeActive : styles.cameraMode}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelected('Video')}>
                      <Text style={selected === 'Video' ? styles.cameraModeActive : styles.cameraMode}>Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelected('Story')}>
                      <Text style={selected === 'Story' ? styles.cameraModeActive : styles.cameraMode}>Story</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.previewWrap}>
                  {cameraPreview.type && cameraPreview.type.startsWith('video') ? (
                    <View style={styles.videoPreviewLarge}><Text style={{ color: '#fff' }}>VIDEO</Text></View>
                  ) : (
                    <Image source={{ uri: cameraPreview.uri }} style={styles.previewImageFull} />
                  )}
                  <View style={styles.previewControls}>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => setCameraPreview(null)}>
                      <Text style={styles.actionButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => closeCameraOverlay()}>
                      <Text style={styles.actionButtonText}>Use</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cameraDesktopRow}>
              <View style={styles.cameraPane}>
                {!cameraPreview ? (
                  <View style={styles.cameraViewLarge}>
                    {hasCameraPermission && CameraComp ? (
                      <View style={{ width: '100%', alignItems: 'center' }}>
                        <CameraComp ref={cameraRef} style={{ width: '100%', height: 420 }} type={CameraModule.Constants.Type[cameraType]} flashMode={CameraModule.Constants.FlashMode[flashMode]} ratio="16:9" />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                          <TouchableOpacity onPress={switchCamera} style={{ padding: 8, marginRight: 12 }}>
                            <Ionicons name="camera-reverse" size={20} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.captureButtonLarge} onPress={selected === 'Video' ? (isRecording ? stopRecording : startRecording) : takePicture} disabled={capturing || isRecording}>
                            {isRecording || capturing ? <ActivityIndicator color="#fff" /> : <View style={styles.captureInnerLarge} />}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={toggleFlash} style={{ padding: 8, marginLeft: 12 }}>
                            <Ionicons name={flashMode === 'on' ? "flash" : "flash-off"} size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.captureButtonLarge} onPress={handleCaptureWithPicker} disabled={capturing}>
                        {capturing ? <ActivityIndicator color="#fff" /> : <View style={styles.captureInnerLarge} />}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.previewWrap}>
                    {cameraPreview.type && cameraPreview.type.startsWith('video') ? (
                      <View style={styles.videoPreviewLarge}><Text style={{ color: '#fff' }}>VIDEO</Text></View>
                    ) : (
                      <Image source={{ uri: cameraPreview.uri }} style={styles.previewImageFull} />
                    )}
                  </View>
                )}
              </View>
              <View style={styles.sidePane}>
                <Text style={styles.heading}>Details</Text>
                <TextInput value={content} onChangeText={setContent} placeholder="Write a caption..." multiline style={[styles.textInput, { minHeight: 120 }]} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => setCameraPreview(null)}>
                    <Text style={styles.actionButtonText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => closeCameraOverlay()}>
                    <Text style={styles.actionButtonText}>Use</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 48 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  optionPill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#f3f6fb", marginBottom: 10, marginRight: 10 },
  optionPillActive: { backgroundColor: "#1DA1F2" },
  optionText: { fontSize: 13, color: "#333", fontWeight: "600" },
  optionTextActive: { color: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#111" },
  subheading: { fontSize: 14, color: "#556" , marginBottom: 16},
  mediaPanel: { backgroundColor: "#fafbff", borderRadius: 18, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: "#e5eaf5" },
  calloutCard: { backgroundColor: "#f7f8fc", borderRadius: 18, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: "#e5eaf5" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  actionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#1DA1F2", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginRight: 10, marginBottom: 10 },
  secondaryButton: { backgroundColor: "#3b82f6" },
  actionButtonText: { color: "#fff", fontWeight: "700" },
  previewGrid: { flexDirection: "row", flexWrap: "wrap" },
  previewItem: { width: 140, height: 140, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff", position: "relative", borderWidth: 1, borderColor: "#e5eaf5", marginRight: 12, marginBottom: 12 },
  previewImage: { width: "100%", height: "100%" },
  videoPreview: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  videoLabel: { color: "#fff", fontWeight: "700" },
  removeBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  removeBtnText: { color: "#fff", fontSize: 10 },
  placeholderCard: { borderRadius: 18, padding: 18, backgroundColor: "#f9fafc", borderWidth: 1, borderColor: "#e5eaf5", alignItems: "center" },
  placeholderText: { color: "#6b7280" },
  primaryButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#1DA1F2", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, marginTop: 16 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  textInput: { minHeight: 120, borderRadius: 18, borderWidth: 1, borderColor: "#e5eaf5", backgroundColor: "#f7f8fc", padding: 14, marginBottom: 18, color: "#111", textAlignVertical: "top" },
  submitButton: { backgroundColor: "#1DA1F2", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  /* Camera overlay styles */
  cameraOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000', zIndex: 1200, justifyContent: 'flex-start' },
  cameraOverlayDesktop: { padding: 24 },
  cameraTop: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  cameraTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cameraViewCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  cameraControlsOverlay: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cameraFooter: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingVertical: 18 },
  cameraMode: { color: '#ddd', fontSize: 16, paddingHorizontal: 12 },
  cameraModeActive: { color: '#fff', fontSize: 16, paddingHorizontal: 12, fontWeight: '700' },
  previewWrap: { alignItems: 'center', justifyContent: 'center' },
  previewImageFull: { width: '100%', height: 420, resizeMode: 'cover' },
  previewControls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, width: '100%' },
  videoPreviewLarge: { width: '100%', height: 420, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  cameraDesktopRow: { flex: 1, flexDirection: 'row' },
  cameraPane: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  cameraViewLarge: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  captureButtonLarge: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  captureInnerLarge: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#fff' },
  sidePane: { flex: 1, paddingLeft: 18 },
});
