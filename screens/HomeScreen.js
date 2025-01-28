import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width * 0.9;
const BANNER_HEIGHT = 120;
const SLIDER_ITEM_WIDTH = width * 0.28;
const SLIDER_ITEM_HEIGHT = 65;

const HomeScreen = ({ handleNavigation }) => {
  const [currentSliderSet, setCurrentSliderSet] = useState(0);
  const fadeAnim = new Animated.Value(1);

  const sliderItems = [
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
  ];

  const navigationButtons = [
    {
      id: 1,
      title: 'انیمیشن',
      icon: require('../assets/animation.png'),
      url: 'https://www.afsoone.com/Animation'
    },
    {
      id: 2,
      title: 'بازی',
      icon: require('../assets/game.png'),
      url: 'https://www.afsoone.com/web-game'
    },
    {
      id: 3,
      title: 'کتابخانه',
      icon: require('../assets/library.png'),
      url: 'https://www.afsoone.com/digital-book'
    },
    {
      id: 4,
      title: 'والدین',
      icon: require('../assets/parent.png'),
      url: 'https://www.afsoone.com/adults'
    },
    {
      id: 5,
      title: 'سرگرمی',
      icon: require('../assets/entertainment.png'),
      url: 'https://www.afsoone.com/sargarmi'
    },
    {
      id: 6,
      title: 'قصه صوتی',
      icon: require('../assets/podcast.png'),
      url: 'https://www.afsoone.com/music'
    }
  ];

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

  const handleButtonPress = (url) => {
    handleNavigation(url);
  };

  return (
    <LinearGradient
      colors={['#7C4FAE', '#272052']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleNavigation('https://www.afsoone.com/my-account')}
        >
          <Image source={require('../assets/account.png')} style={styles.headerIcon} />
          <Text style={styles.headerText}>پنل کاربری</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleNavigation('https://afsoone.com/sub')}
        >
          <Text style={styles.headerText}>خرید اشتراک</Text>
          <Image source={require('../assets/coin.png')} style={styles.headerIcon} />
          
        </TouchableOpacity>
      </View>
      <View style={styles.imagecont}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
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
              onPress={() => handleButtonPress(item.url)}
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
            onPress={() => handleButtonPress(button.url)}
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
};

const styles = StyleSheet.create({
  container: {
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
  logo: {
    width: 250,
    height: 250,
    marginTop: -60,
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
    marginBottom: 20,
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
});

export default HomeScreen;