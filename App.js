import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import OrientationLocker from "react-native-orientation-locker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import LiveTV from './components/LiveTV';

const REMOTE_CONFIG_URL = "https://raw.githubusercontent.com/Afsoone/mobile/main/app-config.json";
const CONFIG_CACHE_KEY = "app_config_cache";
const CONFIG_CACHE_DURATION = 1000 * 60 * 15; 

const SLIDER_CONFIG_URL = "https://raw.githubusercontent.com/Afsoone/mobile/main/app-slider.json";
const SLIDER_CACHE_KEY = "app_slider_cache";
const SLIDER_CACHE_DURATION = 1000 * 60 * 15; //15min


const BOTTOM_BUTTONS = [
  { title: "انیمیشن", icon: "film-outline", url: "https://www.afsoone.com/Animation", position: "left" },
  { title: "کتابخانه", icon: "book-outline", url: "https://www.afsoone.com/digital-book", position: "left" },
  { title: "پادکست", icon: "mic-outline", url: "https://www.afsoone.com/music", position: "left" },
  { title: "خانه", icon: "home", url: "https://www.afsoone.com", position: "center" },
  { title: "سرگرمی", icon: "color-palette-outline", url: "https://www.afsoone.com/sargarmi", position: "right" },
  { title: "بازی", icon: "game-controller-outline", url: "https://www.afsoone.com/web-game", position: "right" },
  { title: "والدین", icon: "people-outline", url: "https://www.afsoone.com/adults", position: "right" },
];

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width * 0.9;
const SLIDER_ITEM_WIDTH = width * 0.28;
const BANNER_HEIGHT = 120;
const SLIDER_ITEM_HEIGHT = 65;

const App = () => {
  const [currentUrl, setCurrentUrl] = useState("https://www.afsoone.com");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("خانه");
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [buttons, setButtons] = useState(BOTTOM_BUTTONS);
  const [currentSliderSet, setCurrentSliderSet] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const handleBackPress = useCallback(() => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);
  useEffect(() => {
    // Add back press listener when component mounts
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Remove listener when component unmounts
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [handleBackPress]);

  const [sliderItems, setSliderItems] = useState([
    [
      { id: 1, image: 'https://afsoone.ir/banner/slider/1.png', url: 'https://www.afsoone.com' },
      { id: 2, image: 'https://afsoone.ir/banner/slider/2.png', url: 'https://www.afsoone.com' },
      { id: 3, image: 'https://afsoone.ir/banner/slider/3.png', url: 'https://www.afsoone.com' },
    ],
    [
      { id: 4, image: 'https://afsoone.ir/banner/slider/4.png', url: 'https://www.afsoone.com' },
      { id: 5, image: 'https://afsoone.ir/banner/slider/5.png', url: 'https://www.afsoone.com' },
      { id: 6, image: 'https://afsoone.ir/banner/slider/6.png', url: 'https://www.afsoone.com' },
    ]
  ]);

  const navigationButtons = [
    { id: 1, title: 'انیمیشن', icon: require('./assets/animation.png'), url: 'https://www.afsoone.com/Animation' },
    { id: 2, title: 'بازی', icon: require('./assets/game.png'), url: 'https://www.afsoone.com/web-game' },
    { id: 3, title: 'کتابخانه', icon: require('./assets/library.png'), url: 'https://www.afsoone.com/digital-book' },
    { id: 4, title: 'والدین', icon: require('./assets/parent.png'), url: 'https://www.afsoone.com/adults' },
    { id: 5, title: 'سرگرمی', icon: require('./assets/entertainment.png'), url: 'https://www.afsoone.com/sargarmi' },
    { id: 6, title: 'قصه صوتی', icon: require('./assets/podcast.png'), url: 'https://www.afsoone.com/music' }
  ];
  const fetchSliderConfig = async () => {
    try {
      const cached = await AsyncStorage.getItem(SLIDER_CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < SLIDER_CACHE_DURATION) {
          const formattedData = [data.sliderSets[0].set1, data.sliderSets[0].set2];
          setSliderItems(formattedData);
          return;
        }
      }
  
      const response = await fetch(SLIDER_CONFIG_URL);
      const config = await response.json();
  
      await AsyncStorage.setItem(
        SLIDER_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: config,
        })
      );
  
      const formattedData = [config.sliderSets[0].set1, config.sliderSets[0].set2];
      setSliderItems(formattedData);
    } catch (error) {
      console.warn("Slider config fetch error:", error);
    }
  };

  // Add this useEffect with other effects
  useEffect(() => {
    fetchSliderConfig();
    const sliderInterval = setInterval(fetchSliderConfig, SLIDER_CACHE_DURATION);
    return () => clearInterval(sliderInterval);
  }, []);

  // Load remote config
  const fetchRemoteConfig = async () => {
    try {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CONFIG_CACHE_DURATION) {
          if (data.bottomButtons) setButtons(data.bottomButtons);
          return;
        }
      }

      const response = await fetch(REMOTE_CONFIG_URL);
      const config = await response.json();

      await AsyncStorage.setItem(
        CONFIG_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: config,
        })
      );

      if (config.bottomButtons) setButtons(config.bottomButtons);
    } catch (error) {
      console.warn("Remote config fetch error:", error);
    }
  };

  useEffect(() => {
    fetchRemoteConfig();
    const configInterval = setInterval(fetchRemoteConfig, CONFIG_CACHE_DURATION);
    return () => clearInterval(configInterval);
  }, []);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        aviny: require("./assets/aviny.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
      
      setCurrentSliderSet(prev => (prev === 0 ? 1 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = useCallback((url) => {
    setCurrentUrl(url);
    setActiveTab(buttons.find(b => b.url === url)?.title || activeTab);
  }, [buttons, activeTab]);

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
            console.warn("Orientation error:", error);
          }
        }
      }
    } catch (error) {
      console.warn("Message handling error:", error);
    }
  }, []);

  const renderHomeScreen = () => (
    <LinearGradient colors={['#7C4FAE', '#272052']} style={styles.containerhome}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleNavigation('https://www.afsoone.com/my-account')}
        >
          <Image source={require('./assets/account.png')} style={styles.headerIcon} />
          <Text style={styles.headerText}>پنل کاربری</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleNavigation('https://afsoone.com/sub')}
        >
          <Text style={styles.headerText}>خرید اشتراک</Text>
          <Image source={require('./assets/coin.png')} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.imagecont}>
        <Image source={require('./assets/logo.png')} style={styles.logohome} />
      </View>
      <View  style={styles.live}>
        <LiveTV />
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image 
          source={{ uri: 'https://afsoone.ir/banner/mobile.png' }}
          style={styles.banner}
          resizeMode="cover"
        />
      </View>

      {/* Slider */}
      <Animated.View style={[styles.sliderContainer, { opacity: fadeAnim }]}>
        <View style={styles.sliderContent}>
          {sliderItems[currentSliderSet].map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNavigation(item.url)}
              style={styles.sliderItem}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.sliderImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationGrid}>
        {navigationButtons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={styles.navButton}
            onPress={() => handleNavigation(button.url)}
          >
            <View style={styles.iconContainer}>
              <Image source={button.icon} style={styles.navIcon} />
              <Text style={styles.navText}>{button.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderBottomBar = () => {
    const screenWidth = Dimensions.get("window").width;
    const buttonWidth = Math.min(screenWidth / 8, 60);

    const leftButtons = buttons.filter((b) => b.position === "left");
    const centerButton = buttons.find((b) => b.position === "center");
    const rightButtons = buttons.filter((b) => b.position === "right");

    return (
      <Animated.View style={[styles.bottomBar, { transform: [{ scale: scaleAnimation }] }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomBarSide}>
            {leftButtons.map((item, index) => (
              <TouchableOpacity
                key={`left-${index}`}
                style={[styles.bottomButton, { width: buttonWidth }, activeTab === item.title && styles.bottomButtonActive]}
                onPress={() => handleNavigation(item.url)}
              >
                <Ionicons name={item.icon} size={22} color="#DAB9FF" />
                <Text numberOfLines={1} style={styles.bottomText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {centerButton && (
            <TouchableOpacity
              style={[styles.bottomButtonCenter, { width: buttonWidth * 1.2 }, 
                activeTab === centerButton.title && styles.bottomButtonActive]}
              onPress={() => handleNavigation(centerButton.url)}
            >
              <Ionicons name={centerButton.icon} size={24} color="#DAB9FF" />
              <Text numberOfLines={1} style={[styles.bottomText, styles.bottomTextCenter]}>
                {centerButton.title}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomBarSide}>
            {rightButtons.map((item, index) => (
              <TouchableOpacity
                key={`right-${index}`}
                style={[styles.bottomButton, { width: buttonWidth }, 
                  activeTab === item.title && styles.bottomButtonActive]}
                onPress={() => handleNavigation(item.url)}
              >
                <Ionicons name={item.icon} size={22} color="#DAB9FF" />
                <Text numberOfLines={1} style={styles.bottomText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const isHomeScreen = currentUrl === "https://www.afsoone.com";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#272052" barStyle="light-content"/>
      <View style={styles.container }>
        {!isHomeScreen && (
          <View style={styles.topBar}>
            <View style={styles.topRight}>
              <TouchableOpacity
                style={styles.topButton}
                onPress={() => handleNavigation("https://afsoone.com/sub")}
              >
                <Ionicons name="cart-outline" size={22} color="#DAB9FF" />
                <Text style={styles.topText}>خرید اشتراک</Text>
              </TouchableOpacity>
              <View style={styles.topcenter}>
              <Image
                source={require("./assets/type.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
              <TouchableOpacity
                style={styles.topButton}
                onPress={() => handleNavigation("https://www.afsoone.com/my-account")}
              >
                <Text style={styles.topText}>پنل کاربری</Text>
                <Ionicons name="person-circle-outline" size={22} color="#DAB9FF" />    
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.webviewContainer}>
          {isHomeScreen ? (
            renderHomeScreen()
          ) : (
            <WebView
              ref={webViewRef}
              source={{ uri: currentUrl }}
              style={styles.webview}
              onMessage={handleMessage}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              cacheEnabled={true}
              allowsBackForwardNavigationGestures={true}
              cacheMode="LOAD_CACHE_ELSE_NETWORK"
              onShouldStartLoadWithRequest={() => true}
              onNavigationStateChange={(navState) => {
                setCurrentUrl(navState.url);
                setCanGoBack(navState.canGoBack); 
              }}
            />
          )}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          )}
        </View>
        {!isHomeScreen && renderBottomBar()}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: "#272052",
  },
  container: {
    flex: 1,
    backgroundColor: "#272052",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#272052",
    paddingVertical: 3,
  },
  topcenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    color: "white",
    fontSize: 20,
    fontFamily: "aviny",
  },
  topRight: {
    flexDirection: "row",
  },
  topButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 70,
    padding: 8,
  },
  topText: {
    color: "white",
    fontSize: 18,
    fontFamily: "aviny",
    marginHorizontal:5
  },
  bottomBar: {
    backgroundColor: "#272052",
    paddingVertical: 5,
    marginBottom: 5,
    borderRadius: 18,
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderWidth: 1.5,
    borderColor: "white",
    overflow: "visible",
    shadowColor: "#000000", 
    shadowOpacity: 1, 
    shadowRadius: 30, 
    shadowOffset: { width: 0, height: 20 }, 
    elevation: 10, 
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  bottomBarSide: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButton: {
    alignItems: "center",
    padding: 4,
    marginHorizontal: 2,
  },
  bottomButtonCenter: {
    alignItems: "center",
    padding: 5,
    marginHorizontal: 8,
    borderRadius: 20,
    transform: [{ scale: 1.05 }],
  },
  bottomButtonActive: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 18,
    padding: 4,
  },
  bottomText: {
    color: "white",
    fontSize: 14,
    fontFamily: "aviny",
    marginTop: 2,
    textAlign: "center",
  },
  bottomTextCenter: {
    fontSize: 16,
  },
  bottomTextActive: {
    color: "#FFD700",
    fontSize: 18,
    fontFamily: "aviny",
  },
  //Home screen style
  containerhome: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'white',
  },
  headerIcon: {
    width: 35,
    height: 35,
    marginHorizontal:2
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'aviny',
  },
  imagecont:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  logohome: {
    width: 250/3.5, 
    height: 250/3.5, 
    resizeMode: 'cover',   
    marginTop: -85,
  },
  live: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 18,
  },
  sliderContainer: {
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  sliderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderItem: {
    width: SLIDER_ITEM_WIDTH,
    height: SLIDER_ITEM_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  navigationGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  navButton: {
    width: width / 3 - 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  navIcon: {
    width: 60,
    height: 60,
  },
  navText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'aviny',
    textAlign: 'center',
    marginTop: 5,
  },
};



export default App;