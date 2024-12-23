import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  ActivityIndicator,
  StatusBar,
  Animated,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import OrientationLocker from "react-native-orientation-locker";

const BOTTOM_BUTTONS = [
  { title: "خانه", icon: "home", url: "https://www.afsoone.com" },
  {
    title: "انیمیشن",
    icon: "film-outline",
    url: "https://www.afsoone.com/Animation",
  },
  {
    title: "کتابخونه",
    icon: "book-outline",
    url: "https://www.afsoone.com/digital-book",
  },
  {
    title: "پادکست",
    icon: "mic-outline",
    url: "https://www.afsoone.com/music",
  },
  {
    title: "بازی",
    icon: "game-controller-outline",
    url: "https://www.afsoone.com/web-game",
  },
  {
    title: "والدین",
    icon: "people-outline",
    url: "https://www.afsoone.com/adults",
  },
];

const injectedJavaScript = `
  (() => {
    let observer;
    
    const setupVideoHandlers = (element) => {
      const sendMessage = (action) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'jwplayer',
          action
        }));
      };

      element.addEventListener('fullscreenchange', () => {
        sendMessage(document.fullscreenElement ? 'fullscreen-enter' : 'fullscreen-exit');
      });
      
      element.addEventListener('play', () => sendMessage('play'));
    };

    const setupPlayers = () => {
      document.querySelectorAll('.jwplayer, video').forEach(setupVideoHandlers);
    };

    setupPlayers();

    if (observer) observer.disconnect();

    observer = new MutationObserver(setupPlayers);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const style = document.createElement('style');
    style.innerHTML = 'video, .jwplayer { transform: translateZ(0); will-change: transform; }';
    document.head.appendChild(style);
  })();

  (function() {
    window.addEventListener('click', function(e) {
      const target = e.target.closest('a');
      if (target && target.target === '_blank') {
        e.preventDefault();
        window.location.href = target.href;
      }
    }, true);

    const originalOpen = window.open;
    window.open = function(url) {
      window.location.href = url;
      return null;
    };
  })();
`;

const App = () => {
  const [currentUrl, setCurrentUrl] = useState("https://www.afsoone.com");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("خانه");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const webViewRef = useRef(null);
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        AShablon: require("./assets/A Shablon Cut.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);
  const animatePress = useCallback(
    (toValue) => {
      Animated.spring(scaleAnimation, {
        toValue,
        useNativeDriver: true,
        friction: 4,
      }).start();
    },
    [scaleAnimation]
  );

  const handleNavigation = useCallback((url) => {
    setCurrentUrl(url);
  }, []);

  const handleBackPress = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, []);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "jwplayer") {
        if (OrientationLocker) {
          try {
            if (data.action === "fullscreen-enter") {
              OrientationLocker.lockToLandscape();
            } else {
              OrientationLocker.lockToPortrait();
            }
          } catch (error) {
            console.warn("Orientation change error:", error);
          }
        }
      }
    } catch (error) {
      console.warn("Message handling error:", error);
    }
  }, []);

  useEffect(() => {
    const initOrientation = async () => {
      if (OrientationLocker) {
        try {
          OrientationLocker.lockToPortrait();
        } catch (error) {
          console.warn("Orientation setup error:", error);
        }
      }
    };

    initOrientation();

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
      if (OrientationLocker) {
        try {
          OrientationLocker.unlockAllOrientations();
        } catch (error) {
          console.warn("Orientation cleanup error:", error);
        }
      }
    };
  }, [handleBackPress]);

  const renderBottomBar = () => (
    <Animated.View
      style={[styles.bottomBar, { transform: [{ scale: scaleAnimation }] }]}
    >
      {BOTTOM_BUTTONS.map((item, index) => {
        const isActive = activeTab === item.title;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.bottomButton, isActive && styles.bottomButtonActive]}
            onPress={() => {
              handleNavigation(item.url);
              setActiveTab(item.title);
            }}
            onPressIn={() => animatePress(0.95)}
            onPressOut={() => animatePress(1)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color="#FFD700"
              style={[
                styles.bottomButtonIcon,
                isActive && { transform: [{ scale: 1.1 }] },
              ]}
            />
            <Text
              style={[styles.bottomText, isActive && styles.bottomTextActive]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4B0082" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Image
              source={require("./assets/afsoone.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>افسونه</Text>
          </View>
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => handleNavigation("https://afsoone.com/sub")}
            >
              <Ionicons name="cart-outline" size={20} color="#FFD700" />
              <Text style={styles.topText}>خرید اشتراک</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() =>
                handleNavigation("https://www.afsoone.com/my-account")
              }
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#FFD700"
              />
              <Text style={styles.topText}>پنل کاربری</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webview}
            onMessage={handleMessage}
            injectedJavaScript={injectedJavaScript}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            onShouldStartLoadWithRequest={() => true}
            onNavigationStateChange={(navState) => {
              setCurrentUrl(navState.url);
            }}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          )}
        </View>
        {renderBottomBar()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4B0082",
  },
  container: {
    flex: 1,
    backgroundColor: "#4B0082",
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(75, 0, 130, 0.3)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4B0082",
    paddingHorizontal: 10,
    paddingVertical: 3,
    //  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  appName: {
    color: "#FFD700",
    fontSize: 20,
    fontFamily: "AShablon",
  },
  topRight: {
    flexDirection: "row",
  },
  topButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    padding: 8,
  },
  topText: {
    color: "#FFD700",
    fontSize: 18,
    fontFamily: "AShablon",
    marginLeft: 5,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#4B0082",
    paddingVertical: 5,
    marginBottom: 10,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: "yellow",
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  bottomButton: {
    alignItems: "center",
    padding: 8,
    minWidth: 60,
  },
  bottomButtonActive: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 6,
    transform: [{ scale: 1.05 }],
  },
  bottomText: {
    color: "#FFD700",
    fontSize: 18,
    fontFamily: "AShablon",
    marginTop: 2,
  },
  bottomTextActive: {
    color: "#FFD700",
    fontSize: 18,
    fontFamily: "AShablon",
  },
});

export default App;
