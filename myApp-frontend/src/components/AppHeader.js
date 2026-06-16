// src/components/AppHeader.js
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function AppHeader({ scrollY, title: propTitle, leftIcon: propLeftIcon, onLeftPress: propOnLeftPress, rightIcons: propRightIcons }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const navItems = [
    { name: "Home", label: "Home" },
    { name: "Reels", label: "Watch" },
    { name: "Market", label: "Market" },
    { name: "Profile", label: "Profile" },
  ];

  const titleOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, 1],
        extrapolate: "clamp",
      })
    : 1;

  const navigateToSearch = (source) => {
    navigation.navigate("Search", { source });
  };

  // If parent passed `rightIcons` prop (array of {name,onPress}), use it for desktop rendering only.
  const providedRightIcons = Array.isArray(propRightIcons) ? propRightIcons : null;

  const defaultDesktopIcons = {
    Home: [
      { name: "search-outline", onPress: () => navigateToSearch("home"), type: "ion" },
      { name: "notifications-outline", onPress: () => navigation.navigate("Notifications"), type: "ion" },
      { name: "chatbubble-outline", onPress: () => navigation.navigate("Messages"), type: "ion" },
    ],
    Reels: [{ name: "search-outline", onPress: () => navigateToSearch("reels"), type: "ion" }],
    Market: [
      { name: "search-outline", onPress: () => navigateToSearch("market"), type: "ion" },
      { name: "cart-outline", onPress: () => navigation.navigate("Cart"), type: "ion" },
      { name: "filter-outline", onPress: () => navigation.navigate("Filters"), type: "ion" },
    ],
    Profile: [{ name: "search-outline", onPress: () => navigateToSearch("profile"), type: "ion" }],
    Add: [{ name: "checkmark", onPress: () => console.log("Post submitted!"), type: "ion" }],
  };

  const getDesktopIconsForRoute = (rName) => {
    const defaults = defaultDesktopIcons[rName] || [{ name: "ellipsis-horizontal", type: "ion" }];
    if (providedRightIcons && isDesktop) {
      // Merge provided icons with defaults, keeping provided order but ensuring defaults exist
      const provided = providedRightIcons.slice();
      const providedNames = new Set(provided.map((i) => i.name));
      defaults.forEach((d) => {
        if (!providedNames.has(d.name)) provided.push(d);
      });
      return provided;
    }
    return defaults;
  };

  const renderIconItem = (icon, idx) => {
    const key = `${icon.name}-${idx}`;
    const onPress = icon.onPress ? icon.onPress : () => {};
    const size = icon.size ? icon.size : isDesktop ? 20 : 24;
    if (icon.type === "fa" || icon.name === "shopping-bag") {
      return (
        <TouchableOpacity key={key} onPress={onPress}>
          <FontAwesome5 name={icon.name} size={size} color="#000" />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity key={key} onPress={onPress}>
        <Ionicons name={icon.name} size={size} color="#000" />
      </TouchableOpacity>
    );
  };

  const headers = {
    Home: (
      <>
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.title, { opacity: titleOpacity, fontSize: isDesktop ? 20 : 18 }]}
        >
          Godemar&apos;s Empire
        </Animated.Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigateToSearch("home")}>
            <Ionicons name="search-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Messages")}>
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </>
    ),

    Reels: (
      <>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { fontSize: isDesktop ? 18 : 16 }]}>Watch</Text>
        <TouchableOpacity onPress={() => navigateToSearch("reels")}>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </>
    ),

    Add: (
      <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Post</Text>
        <TouchableOpacity onPress={() => console.log("Post submitted!")}>
          <Ionicons name="checkmark" size={26} color="#1DA1F2" />
        </TouchableOpacity>
      </>
    ),

    Market: (
      <>
        <Text style={styles.title}>Market</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => navigateToSearch("market")}>
            <Ionicons name="search-outline" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
            <FontAwesome5 name="shopping-bag" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Filters")}>
            <Ionicons name="filter-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </>
    ),

    // Search route: show only a back button on the left and keep icons on the right
    Search: (
      <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.iconGroup}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
        </View>
      </>
    ),

    Profile: (
      <>
        <TouchableOpacity
          onPress={() => {
            // Toggle menu via route params so the Profile screen can render the drawer inline
            if (route.name === 'Profile') {
              navigation.setParams({ menuOpen: true });
            } else {
              navigation.navigate('Profile', { menuOpen: true });
            }
          }}
        >
          <Ionicons name="menu-outline" size={26} color="#000" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigateToSearch("profile")}>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </>
    ),
  };

  const currentHeader = headers[route.name] || (
    <>
      <Text style={styles.title}>{route.name}</Text>
      <View style={styles.iconGroup}>
        <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
      </View>
    </>
  );

  const desktopHeader = (
    <View style={styles.desktopHeader}>
      <View style={[styles.desktopTitleSection, route.name === "Profile" ? { minWidth: 56 } : null]}>
        {route.name === "Profile" ? (
          <TouchableOpacity
            onPress={() => {
              if (route.name === 'Profile') {
                navigation.setParams({ menuOpen: true });
              } else {
                navigation.navigate('Profile', { menuOpen: true });
              }
            }}
            style={styles.leftIcon}
          >
            <Ionicons name="menu-outline" size={26} color="#000" />
          </TouchableOpacity>
        ) : route.name === "Add" || route.name === "Search" ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.leftIcon}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : null}
        {route.name !== "Profile" && route.name !== "Search" && (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.desktopTitle}>{route.name === "Add" ? "Add Post" : "Godemar's Empire"}</Text>
        )}
      </View>

      {route.name !== "Add" && route.name !== "Search" ? (
        <View style={styles.desktopNavRow}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              style={[
                styles.desktopNavButton,
                route.name === item.name ? styles.desktopNavButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.desktopNavText,
                  route.name === item.name ? styles.desktopNavTextActive : null,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.desktopNavRow, { flex: 1 }]} />
      )}

      <View style={styles.desktopIconGroup}>
        {getDesktopIconsForRoute(route.name).map((icon, i) => renderIconItem(icon, i))}
      </View>
    </View>
  );

  // compute right padding based on number of header icons for this route (desktop only)
  const iconsForRoute = getDesktopIconsForRoute(route.name);
  if (isDesktop) console.log("[AppHeader] route", route.name, "desktop icons:", iconsForRoute.map((i) => i.name));
  const headerStyle = [styles.header, isDesktop ? styles.headerDesktop : null];

  return <Animated.View style={headerStyle}>{isDesktop ? desktopHeader : currentHeader}</Animated.View>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    width: "100%",
    overflow: "visible",
  },
  headerDesktop: {
    minHeight: 64,
    paddingVertical: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  desktopHeader: {
    width: "100%",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  desktopTitleSection: {
    flex: 0,
    minWidth: 140,
    maxWidth: 520,
    flexShrink: 0,
  },
  leftIcon: {
    marginRight: 6,
  },
  desktopTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  desktopNavRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  desktopNavButton: {
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  desktopNavButtonActive: {
    backgroundColor: "#eef6ff",
  },
  desktopNavText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  desktopNavTextActive: {
    color: "#1DA1F2",
  },
  desktopIconGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
});