import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Video } from 'expo-av';

export default function StoryViewerScreen({ route, navigation }) {
  const { stories = [], initialId = null } = route.params || {};
  const startIndex = Math.max(0, stories.findIndex((s) => s.id === initialId));
  const [index, setIndex] = useState(startIndex >= 0 ? startIndex : 0);
  const story = stories[index] || {};
  const media = Array.isArray(story.media) && story.media.length ? story.media[0] : null;
  const window = Dimensions.get('window');
  const videoRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // auto-advance only for images after 4s
      if (media && !((media.type || '').toLowerCase().includes('video')) ) {
        if (index < stories.length - 1) setIndex((i) => i + 1);
        else navigation.goBack();
      }
    }, 4000);
    return () => clearTimeout(timeout);
  }, [index, media, navigation, stories.length]);

  const goNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else navigation.goBack();
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.userLabel}>{story.user_name || story.userName || 'Story'}</Text>
      </View>

      <View style={styles.previewArea}>
        {media && (media.type || '').toLowerCase().includes('video') ? (
          <Video
            ref={videoRef}
            source={{ uri: media.url || media.uri || media.video }}
            style={[styles.media, { width: window.width, height: window.height * 0.75 }]}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
        ) : (
          <Image source={{ uri: media?.url || media?.uri || story.image }} style={[styles.media, { width: window.width, height: window.height * 0.75 }]} />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={goPrev} style={styles.ctrlBtn}><Text style={styles.ctrlText}>Prev</Text></TouchableOpacity>
        <Text style={styles.counter}>{index + 1}/{stories.length}</Text>
        <TouchableOpacity onPress={goNext} style={styles.ctrlBtn}><Text style={styles.ctrlText}>Next</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, justifyContent: 'space-between' },
  closeBtn: { padding: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  userLabel: { color: '#fff', fontWeight: '700' },
  previewArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  media: { backgroundColor: '#111', borderRadius: 8 },
  controls: { height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  ctrlBtn: { padding: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  ctrlText: { color: '#fff', fontWeight: '600' },
  counter: { color: '#fff' },
});
