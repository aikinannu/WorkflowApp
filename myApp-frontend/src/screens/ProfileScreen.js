// src/screens/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Image, ScrollView, Platform, Animated } from "react-native";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const route = useRoute();

  // Inline menu drawer state and animation
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Open drawer when route param `menuOpen` is set (by AppHeader)
    if (route?.params?.menuOpen) {
      setMenuOpen(true);
    }
  }, [route?.params?.menuOpen]);

  useEffect(() => {
    Animated.timing(menuAnim, { toValue: menuOpen ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [menuOpen, menuAnim]);

  const HEADER_OFFSET = 96; // match header top offset used elsewhere
  const [sideFixed, setSideFixed] = useState(false);
  const [sideY, setSideY] = useState(0);
  const scrollRef = useRef(null);
  const sideAnim = useRef(new Animated.Value(0)).current;

  const tabs = ["Posts", "Photos", "Videos", "Stories", "Products", "Jobs"];

  const menuItems = [
    { label: "Profile", screen: "Profile" },
    { label: "Dashboard", screen: "Dashboard" },
    { label: "Community", screen: "Community" },
    { label: "Plans & Licensing", screen: "License" },
    { label: "Settings", screen: "Settings" },
    { label: "Vision", screen: "Vision" },
    { label: "Team", screen: "Team" },
    { label: "Careers & Job Offers", screen: "Careers" },
    { label: "Contact", screen: "Contact" },
    { label: "About", screen: "About" },
  ];

  const [activeTab, setActiveTab] = useState("Posts");

  const postsData = useMemo(() => {
    const types = ["Posts", "Photos", "Videos", "Stories", "Products", "Jobs"];
    return Array.from({ length: 18 }).map((_, i) => {
      const type = types[i % types.length];
      const item = {
        id: i,
        title: `${type} ${i + 1}`,
        type,
        image: `https://picsum.photos/seed/profile${i}/600/400`,
      };
      if (type === 'Products') {
        item.price = (9.99 + i * 3).toFixed(2);
        item.description = 'High quality product';
      }
      if (type === 'Jobs') {
        item.company = `Company ${i + 1}`;
        item.location = ['Remote', 'New York', 'London'][i % 3];
      }
      if (type === 'Stories') {
        item.story = true;
        item.image = `https://picsum.photos/seed/story${i}/400/700`;
      }
      return item;
    });
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeTab === "Posts") return postsData.filter((p) => p.type === "Posts");
    return postsData.filter((p) => p.type === activeTab);
  }, [activeTab, postsData]);

  /* Small card renderers for dynamic display */
  const PostCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postText}>{item.title}</Text>
    </View>
  );

  const PhotoCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postText}>{item.title}</Text>
    </View>
  );

  const VideoCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <View>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <View style={styles.playBadge}><Ionicons name="play" size={18} color="#fff" /></View>
      </View>
      <Text style={styles.postText}>{item.title}</Text>
    </View>
  );

  const StoryCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <Image source={{ uri: item.image }} style={[styles.postImage, { height: 320 }]} />
      <Text style={styles.postText}>{item.title}</Text>
    </View>
  );

  const ProductCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postText}>{item.title}</Text>
      <Text style={styles.productPrice}>${item.price}</Text>
    </View>
  );

  const JobCard = ({ item }) => (
    <View style={[styles.postItem, isDesktop ? styles.postItemDesktop : styles.postItemMobile]}>
      <Text style={[styles.postText, { marginBottom: 8 }]}>{item.title}</Text>
      <Text style={styles.cardMeta}>{item.company} · {item.location}</Text>
    </View>
  );

  const renderItem = (item) => {
    switch (item.type) {
      case 'Photos': return <PhotoCard key={item.id} item={item} />;
      case 'Videos': return <VideoCard key={item.id} item={item} />;
      case 'Stories': return <StoryCard key={item.id} item={item} />;
      case 'Products': return <ProductCard key={item.id} item={item} />;
      case 'Jobs': return <JobCard key={item.id} item={item} />;
      default: return <PostCard key={item.id} item={item} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader rightIcons={[{ name: "search-outline", onPress: () => navigation.navigate("Search", { source: "profile" }) }]} />

      {/* Drawer overlay */}
      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
        style={[
          styles.drawerOverlay,
          { opacity: menuAnim },
        ]}
      >
        {menuOpen && (
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => { setMenuOpen(false); navigation.setParams({ menuOpen: false }); }} />
        )}
      </Animated.View>

      {/* Inline menu drawer */}
      <Animated.View
        style={[
          styles.profileDrawer,
          isDesktop ? styles.profileDrawerDesktop : styles.profileDrawerMobile,
          {
            transform: [
              {
                translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-(isDesktop ? 320 : width), 0] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>
          <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.setParams({ menuOpen: false }); }}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.drawerScroll}>
          {menuItems.map((it) => (
            <TouchableOpacity key={it.label} style={styles.drawerItem} onPress={() => { navigation.navigate(it.screen); setMenuOpen(false); navigation.setParams({ menuOpen: false }); }}>
              <Text style={styles.drawerText}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.drawerFooter}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => { navigation.replace('Login'); setMenuOpen(false); navigation.setParams({ menuOpen: false }); }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.profileHeaderContainer}>
        <Image 
          source={{ uri: "https://picsum.photos/seed/profile_bg/1200/300" }} 
          style={styles.profileBg} 
        />
        <View style={styles.profileOverlay}>
          <Image 
            source={{ uri: "https://picsum.photos/seed/user_avatar/150/150" }} 
            style={styles.profileAvatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>@afrobeats_artist</Text>
            <Text style={styles.bio}>Creating music, fashion, and vibes 🎶👕✨</Text>
            <Text style={styles.stats}>Posts: 12 | Followers: 240 | Following: 180</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={18} color="#fff" />
          <Text style={styles.shareText}>Share Profile</Text>
        </TouchableOpacity>
      </View>

      {isDesktop ? (
        <View style={[styles.desktopLayout, { position: 'relative' }]}> 
          <Animated.View
            onLayout={(e) => setSideY(e.nativeEvent.layout.y)}
            style={[
              styles.sidePanel,
              Platform.OS === 'web' ? { position: 'sticky', top: HEADER_OFFSET } : (Platform.OS !== 'web' && sideFixed ? { position: 'absolute', top: HEADER_OFFSET } : null),
              Platform.OS !== 'web'
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: sideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
                    shadowRadius: sideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
                    transform: [
                      { translateY: sideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                    ],
                  }
                : null,
            ]}
          >
            {tabs.slice(0, 5).map((t) => (
              <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.sideLink, activeTab === t ? styles.sideLinkActive : null]}>
                <Text style={[styles.sideText, activeTab === t ? styles.sideTextActive : null]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <View style={[styles.mainContent, Platform.OS !== 'web' && sideFixed ? { marginLeft: 280 } : null]}>
            <ScrollView
              ref={scrollRef}
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                  if (Platform.OS !== 'web') {
                    if (offsetY + HEADER_OFFSET >= sideY) {
                      if (!sideFixed) {
                        setSideFixed(true);
                        Animated.timing(sideAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start();
                      }
                    } else {
                      if (sideFixed) {
                        setSideFixed(false);
                        Animated.timing(sideAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start();
                      }
                    }
                  }
              }}
              scrollEventThrottle={16}
              contentContainerStyle={[styles.posts, styles.postsDesktop]}
            >
              {filteredPosts.map((post) => renderItem(post))}
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.mobileTabsRow}>
            {tabs.map((t) => (
              <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={styles.mobileTab}>
                <Text style={[styles.mobileTabText, activeTab === t ? styles.mobileTabActive : null]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={[styles.posts, styles.postsMobile]} keyboardShouldPersistTaps="handled">
            {filteredPosts.map((post) => renderItem(post))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  profileHeaderContainer: {
    position: "relative",
    height: 260,
    backgroundColor: "#f5f5f5",
    marginBottom: 16,
  },
  profileBg: {
    width: "100%",
    height: 180,
    backgroundColor: "#e5e5e5",
  },
  profileOverlay: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    marginRight: 16,
    backgroundColor: "#eee",
    marginTop: -60,
  },
  profileInfo: {
    flex: 1,
    paddingBottom: 8,
  },
  username: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  bio: { fontSize: 14, color: "#666", marginBottom: 6 },
  stats: { fontSize: 13, color: "#999" },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 10,
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  editText: { color: "#fff", marginLeft: 6, fontWeight: "600", fontSize: 15 },

  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  shareText: { color: "#fff", marginLeft: 6, fontWeight: "600", fontSize: 15 },
  posts: { padding: 15 },
  postsDesktop: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  postsMobile: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  postItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  postItemDesktop: { flex: 0, width: "31.33%", minWidth: 220 },
  postItemMobile: { flex: 0, width: "48%", minWidth: 160 },
  postImage: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10, backgroundColor: "#eee" },
  postText: { color: "#333", fontSize: 16, fontWeight: "600" },

  playBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  productPrice: { marginTop: 8, fontWeight: '700', color: '#111' },
  cardMeta: { fontSize: 13, color: '#666' },

  desktopLayout: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  sidePanel: { width: 260, padding: 16, borderRightWidth: 1, borderRightColor: "#eee", alignSelf: "flex-start" },
  sideLink: { paddingVertical: 10 },
  sideText: { fontSize: 15, color: "#222" },
  sideLinkActive: { backgroundColor: "transparent" },
  sideTextActive: { fontWeight: "700", color: "#007bff" },
  mainContent: { flex: 1, padding: 16 },
  mobileTabsRow: { flexDirection: "row", justifyContent: "space-around", padding: 12 },
  mobileTab: { paddingVertical: 8 },
  mobileTabText: { fontSize: 13 },
  mobileTabActive: { fontWeight: "700", color: "#007bff" },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 900 },
  profileDrawer: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: '#fff', zIndex: 1000, shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 12 },
  profileDrawerDesktop: { width: 320 },
  profileDrawerMobile: { width: '100%' },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  drawerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  drawerScroll: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 80 },
  drawerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f4f4f4' },
  drawerText: { fontSize: 16, color: '#222' },
  drawerFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
});