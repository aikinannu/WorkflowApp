// src/screens/HomeScreen.js
import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { feed as feedApi } from "../api/apiClient";

export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 600 && width < 900;
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Navigation links for side panel
  const navLinks = [
    { label: "Plans & Licensing", id: "plans", screen: "License" },
    { label: "Software Development", id: "software" },
    { label: "Fashion Design", id: "fashion" },
    { label: "Graphic Design", id: "graphic" },
    { label: "Real Estate", id: "realestate" },
    { label: "Architecture", id: "architecture" },
    { label: "Trading", id: "trading" },
    { label: "Marketing", id: "marketing" },
    { label: "Commercials", id: "commercials" },
    { label: "Business", id: "business" },
    { label: "Entrepreneurship", id: "entrepreneurship" },
    { label: "Consultation", id: "consultation" },
    { label: "Management", id: "management" },
    { label: "Jobs", id: "jobs" },
    { label: "Hiring", id: "hiring" },
    { label: "Services", id: "services" },
    { label: "Careers", id: "careers" },
    { label: "FAQs", id: "faqs" },
    { label: "Refund & Returns Policy", id: "refund" },
    { label: "Privacy Policy", id: "privacy" },
    { label: "Settings", id: "settings" },
  ];

  

  useEffect(() => {
    const loadFeed = async () => {
      if (!user?.id) {
        setFeedItems([]);
        setLoadingFeed(false);
        return;
      }

      setLoadingFeed(true);
      try {
        const result = await feedApi.fetchFeed({
          userId: user.id,
          tenantId: user.tenant_id,
          limit: 20,
        });
        const items = Array.isArray(result) ? result : result.items ?? [];
        setFeedItems(items.map((item, index) => ({
          ...item,
          id: item.id || item.post_id || `feed_${index}`,
        })));
      } catch (error) {
        console.warn("Failed to load feed", error);
      } finally {
        setLoadingFeed(false);
      }
    };

    loadFeed();
  }, [user]);
  const sideMaxHeight = Math.max(300, height - 120);

  // Status input box component
  const StatusInputBox = () => (
    <View style={styles.statusInputContainer}>
      <View style={styles.statusInputBox}>
        <Image
          source={{ uri: "https://picsum.photos/seed/currentuser/200/200" }}
          style={styles.currentUserAvatar}
        />
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => navigation.navigate("Add", { source: "status" })}>
          <Text style={styles.inputPlaceholder}>What's on your mind?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusActionBar}>
        <TouchableOpacity style={styles.statusAction}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusAction}>
          <Text style={styles.actionIcon}>😊</Text>
          <Text style={styles.actionLabel}>Feeling</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusAction}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionLabel}>Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const StoriesCarousel = ({ items }) => {
    if (!items || !items.length) return null;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {items.map((it, idx) => {
          const media = Array.isArray(it.media) && it.media.length ? it.media[0] : null;
          const thumb = media?.url || media?.uri || it.image || `https://picsum.photos/seed/${it.id || 'story'}/200/350`;
          return (
            <TouchableOpacity key={it.id || it.post_id} style={styles.storyItem} onPress={() => navigation.navigate('StoryViewer', { stories: items, initialId: it.id })}>
              <Image source={{ uri: thumb }} style={styles.storyThumb} />
              <Text style={styles.storyLabel} numberOfLines={1}>{it.user_name || it.userName || 'Story'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // Feed item renderer
  const FeedItemRenderer = ({ item }) => {
    const userName = item.user_name || item.userName || item.user_id || "Community";
    const userAvatar =
      item.user_avatar ||
      item.userAvatar ||
      `https://picsum.photos/seed/${encodeURIComponent(userName)}/200/200`;
    const timestamp = item.created_at || item.timestamp || "Just now";
    const content = item.content || item.status || item.caption || "Shared an update.";
    const imageUrl =
      Array.isArray(item.media) && item.media.length
        ? item.media[0]?.uri || item.media[0]
        : item.image || null;

    return (
      <View style={styles.feedPost}>
        <View style={styles.postHeader}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <View style={styles.postUserInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
        </View>
        <Text style={styles.postText}>{content}</Text>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
        <View style={styles.postFooter}>
          {typeof item.likes !== 'undefined' ? <Text style={styles.postStat}>{item.likes} Likes</Text> : null}
          {typeof item.comments !== 'undefined' ? <Text style={styles.postStat}>{item.comments} Comments</Text> : null}
          {typeof item.shares !== 'undefined' ? <Text style={styles.postStat}>{item.shares} Shares</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerFull}>
        <AppHeader onSearchPress={() => navigation.navigate("Search", { source: "home" })} />
      </View>

      {isDesktop ? (
        // Desktop: Side panel + Main content
        <View style={styles.desktopLayout}>
          {/* Left Navigation Panel */}
          <View style={[styles.sidePanel, { maxHeight: sideMaxHeight }]}>
            <Text style={styles.panelTitle}>Explore</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {navLinks.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={styles.navLink}
                  onPress={() => {
                    if (link.screen) {
                      navigation.navigate(link.screen);
                    }
                  }}>
                  <Text style={styles.navLinkText}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Center: Status Input + Feed */}
          <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentScroll}>
            <StoriesCarousel items={feedItems.filter((i) => (i.post_type || i.postType) === 'Story')} />
            <StatusInputBox />
            {loadingFeed ? (
              <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>Loading feed...</Text>
            ) : feedItems.length ? (
              feedItems.map((item) => <FeedItemRenderer key={item.id} item={item} />)
            ) : (
              <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>No feed items available yet.</Text>
            )}
          </ScrollView>
        </View>
      ) : isTablet ? (
        // Tablet: Feed with status input
        <ScrollView style={styles.tabletLayout} contentContainerStyle={styles.tabletContent}>
          <StatusInputBox />
          {loadingFeed ? (
            <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>Loading feed...</Text>
          ) : feedItems.length ? (
            feedItems.map((item) => <FeedItemRenderer key={item.id} item={item} />)
          ) : (
            <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>No feed items available yet.</Text>
          )}
        </ScrollView>
      ) : (
        // Mobile: Full-width feed
        <ScrollView style={styles.mobileLayout} contentContainerStyle={styles.mobileContent}>
          <StatusInputBox />
          {loadingFeed ? (
            <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>Loading feed...</Text>
          ) : feedItems.length ? (
            feedItems.map((item) => <FeedItemRenderer key={item.id} item={item} />)
          ) : (
            <Text style={{ padding: 12, color: "#5f6a7d", textAlign: "center" }}>No feed items available yet.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  headerFull: {
    width: "100%",
  },
  desktopLayout: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
  },
  sidePanel: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1d2433",
  },
  navLink: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navLinkText: {
    fontSize: 14,
    color: "#333",
  },
  mainContent: {
    flex: 1,
    marginRight: 12,
  },
  mainContentScroll: {
    paddingBottom: 24,
  },
  // Status input box styles
  statusInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusInputBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  currentUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  inputField: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
  },
  inputPlaceholder: {
    color: "#999",
    fontSize: 14,
  },
  statusActionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statusAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  // Feed post styles
  feedPost: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  postUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1d2433",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  postText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  postCaption: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 280,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  postFooter: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  postStat: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  tabletLayout: {
    flex: 1,
  },
  tabletContent: {
    padding: 16,
    paddingBottom: 24,
  },
  mobileLayout: {
    flex: 1,
  },
  mobileContent: {
    padding: 12,
    paddingBottom: 20,
  },
});