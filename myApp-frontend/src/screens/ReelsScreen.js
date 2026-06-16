// src/screens/ReelsScreen.js
import { SafeAreaView, StyleSheet, Text, View, useWindowDimensions, Image, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { feed as feedApi } from "../api/apiClient";
import { Video } from "expo-av";
import AppHeader from "../components/AppHeader";

export default function ReelsScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isWeb = Platform.OS === "web";
  const mainScrollRef = useRef(null);
  const offsetsRef = useRef({});
  const headerOffset = 72;

  // Responsive sizing
  let mainFlex = 3;
  let sideWidth = 240;
  let shortsWidth = 340;
  let shortThumbW = 300;

  if (width >= 1400) {
    mainFlex = 4;
    sideWidth = 280;
    shortsWidth = 420;
    shortThumbW = 360;
  } else if (width >= 1100) {
    mainFlex = 3.5;
    sideWidth = 260;
    shortsWidth = 380;
    shortThumbW = 320;
  } else if (width >= 900) {
    mainFlex = 3;
    sideWidth = 240;
    shortsWidth = 340;
    shortThumbW = 300;
  } else if (width >= 700) {
    mainFlex = 2.2;
    sideWidth = 200;
    shortsWidth = 260;
    shortThumbW = 220;
  } else {
    mainFlex = 1;
    sideWidth = 180;
    shortsWidth = 200;
    shortThumbW = 160;
  }

  const sideInlineStyle = isWeb
    ? { width: sideWidth }
    : { position: "absolute", top: headerOffset, left: 12, width: sideWidth };
  const shortsMaxHeight = Math.max(340, height - headerOffset - 96);
  const relatedMaxHeight = Math.max(300, height - headerOffset - 120);
  const shortsInlineStyle = isWeb
    ? { width: shortsWidth }
    : { position: "absolute", top: headerOffset, left: 12, width: shortsWidth, maxHeight: shortsMaxHeight };
  const mainColInline = { flex: mainFlex, marginHorizontal: isWeb ? 16 : 24 };
  const [activeId, setActiveId] = useState(null);

  const { user } = useAuth();
  const [mainVideos, setMainVideos] = useState([]);
  const [related, setRelated] = useState([]);
  const [shorts, setShorts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadVideos = async () => {
      try {
        const result = await feedApi.fetchFeed({ tenantId: user?.tenant_id, page: 1, limit: 50 });
        const items = Array.isArray(result) ? result : result.items ?? [];
        const foundLong = [];
        const foundShorts = [];
        const foundRelated = [];

        for (const it of items) {
          const medias = it.media || [];
          for (const m of medias) {
            const type = (m.type || '').toLowerCase();
            if (!type.includes('video') && !(m.url || m.uri || m.video)) continue;
            const url = m.url || m.uri || m.video || m;
            const width = m.width || m.w || m.metadata?.width;
            const height = m.height || m.h || m.metadata?.height;
            const ratio = width && height ? width / height : null;
            const entry = { id: it.id || `${it.post_id || Math.random()}`, title: it.title || it.content?.slice?.(0, 40) || 'Video', thumb: m.thumb || m.thumbnail || m.poster || (m.url || m.uri) + '?thumb=1', video: url, description: it.content || '' };
            if (ratio) {
              if (ratio >= 1.5) foundLong.push(entry);
              else if (ratio <= 0.8) foundShorts.push(entry);
              else foundRelated.push(entry);
            } else {
              // unknown ratio => treat as related
              foundRelated.push(entry);
            }
          }
        }
        if (!mounted) return;
        setMainVideos(foundLong);
        setShorts(foundShorts);
        setRelated(foundRelated);
      } catch (err) {
        console.warn('Failed to load feed for reels', err);
      }
    };
    loadVideos();
    return () => { mounted = false; };
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onSearchPress={() => navigation.navigate("Search", { source: "reels" })} />

      {isDesktop ? (
        <View style={styles.desktopWrap}>
          {/* Shorts column (9:16 thumbnails) - LEFT */}
          <View style={[styles.shortsCol, styles.stickyPanel, shortsInlineStyle]}>
            <Text style={styles.panelHeading}>Shorts</Text>
            <ScrollView style={{ maxHeight: shortsMaxHeight }} contentContainerStyle={styles.shortsList}>
              {shorts.map((s, idx) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.shortItem}
                  onPress={() => {
                    // Map short to a main video index (wrap)
                    const target = mainVideos[idx % mainVideos.length];
                    const y = offsetsRef.current[target.id] || 0;
                    setActiveId(target.id);
                    if (mainScrollRef.current && mainScrollRef.current.scrollTo) {
                      mainScrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
                    }
                  }}>
                  <Image source={{ uri: s.thumb }} style={[styles.shortThumb, { width: shortThumbW }]} />
                  <Text style={styles.shortText}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Main large video column (16:9) - MIDDLE */}
          <View style={[styles.mainCol, mainColInline]}>
            <ScrollView ref={mainScrollRef} contentContainerStyle={styles.mainScroll}>
              {mainVideos.map((v, idx) => {
                const isActive = activeId === v.id;
                return (
                  <View
                    key={v.id}
                    style={[styles.featureCard, isActive && styles.featureActive]}
                    onLayout={(e) => (offsetsRef.current[v.id] = e.nativeEvent.layout.y)}>
                    {isActive ? (
                      <Video
                        source={{ uri: v.video }}
                        style={styles.featureThumb}
                        useNativeControls
                        resizeMode="cover"
                        shouldPlay
                        isLooping
                      />
                    ) : (
                      <Image source={{ uri: v.thumb }} style={styles.featureThumb} />
                    )}
                    {isActive && (
                      <View style={styles.playBadge}>
                        <Text style={styles.playBadgeText}>Playing</Text>
                      </View>
                    )}
                    <Text style={styles.featureTitle}>{v.title}</Text>
                    <Text style={styles.featureDesc}>{v.description}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Related videos side panel - RIGHT */}
          <View style={[styles.sidePanel, styles.stickyPanel, sideInlineStyle]}>
            <Text style={styles.panelHeading}>Related</Text>
            <ScrollView style={{ maxHeight: relatedMaxHeight }}>
              {related.map((r, idx) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.relatedItem}
                  onPress={() => {
                    const target = mainVideos[idx % mainVideos.length];
                    const y = offsetsRef.current[target.id] || 0;
                    setActiveId(target.id);
                    if (mainScrollRef.current && mainScrollRef.current.scrollTo) {
                      mainScrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
                    }
                  }}>
                  <Image source={{ uri: r.thumb }} style={styles.relatedThumb} />
                  <Text style={styles.relatedText}>{r.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        // Mobile: simple vertical list of videos (compact)
        <ScrollView contentContainerStyle={styles.mobileList}>
          {mainVideos.concat(shorts).map((v) => (
            <View key={v.id} style={styles.mobileItem}>
              <Image source={{ uri: v.thumb || v.thumb }} style={styles.mobileThumb} />
              <Text style={styles.title}>{v.title}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  desktopWrap: { flex: 1, flexDirection: "row", padding: 12, position: "relative" },
  mainCol: { flex: 3, marginHorizontal: 0 },
  mainScroll: { paddingBottom: 24 },
  featureCard: { marginBottom: 18 },
  featureThumb: { width: "100%", aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: "#eee" },
  featureTitle: { marginTop: 10, fontSize: 16, fontWeight: "700" },
  featureDesc: { fontSize: 13, color: "#666", marginTop: 6 },
  sidePanel: { width: 240, padding: 8, borderLeftWidth: 1, borderLeftColor: "#f0f0f0" },
  panelHeading: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  relatedItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f3f3", flexDirection: "row", alignItems: "center" },
  relatedThumb: { width: 82, height: 48, borderRadius: 6, marginRight: 10, backgroundColor: "#eee" },
  relatedText: { fontSize: 14 },
  shortsCol: { width: 340, paddingRight: 12, borderRightWidth: 1, borderRightColor: "#f0f0f0" },
  shortsList: { paddingBottom: 24 },
  shortItem: { marginBottom: 14, alignItems: "center" },
  shortThumb: { width: 300, aspectRatio: 9 / 16, borderRadius: 8, backgroundColor: "#ddd" },
  shortText: { marginTop: 8, fontSize: 13, textAlign: "center" },
  stickyPanel: { position: "sticky", top: 72, alignSelf: "flex-start" },
  featureActive: { borderWidth: 2, borderColor: "#1e90ff", borderRadius: 10, padding: 4 },
  playBadge: { position: "absolute", top: 12, right: 12, backgroundColor: "#1e90ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  playBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  mobileList: { padding: 12 },
  mobileItem: { marginBottom: 16 },
  mobileThumb: { width: "100%", aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: "#eee" },
  title: { marginTop: 8, fontSize: 14, fontWeight: "600" },
});