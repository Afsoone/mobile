import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import axios from 'axios';
import moment from 'moment-timezone';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LiveTV = () => {
  const [schedule, setSchedule] = useState([]);
  const [currentShow, setCurrentShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 60 * 60 * 1000); // Refresh schedule every hour
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (schedule.length > 0) {
      const show = calculateCurrentShow();
      setCurrentShow(show);
      setIsLoading(false);
    }
  }, [schedule]);

  useEffect(() => {
    if (currentShow) {
      playCurrentShow();
    }
  }, [currentShow]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/Afsoone/mobile/main/tv.json');
      setSchedule(response.data.programs.map(show => ({
        ...show,
        duration: show.duration || 300 // Default to 5 minutes if duration is missing
      })));
      setError(null);
    } catch (err) {
      setError('Failed to load TV schedule');
      console.error('Schedule fetch error:', err);
    }
  };

  const calculateCurrentShow = () => {
    if (!schedule.length) return null;

    const tehranTime = moment().tz('Asia/Tehran');
    const secondsSinceMidnight = tehranTime.hours() * 3600 + tehranTime.minutes() * 60 + tehranTime.seconds();
    
    const totalDuration = schedule.reduce((sum, show) => sum + show.duration, 0);
    const elapsedTime = secondsSinceMidnight % totalDuration;

    let accumulatedTime = 0;
    for (let i = 0; i < schedule.length; i++) {
      const show = schedule[i];
      if (elapsedTime < accumulatedTime + show.duration) {
        return { 
          ...show, 
          startPosition: (elapsedTime - accumulatedTime) * 1000, 
          index: i 
        };
      }
      accumulatedTime += show.duration;
    }
    
    return { ...schedule[0], startPosition: 0, index: 0 };
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish) {
      let nextIndex = (currentShow.index + 1) % schedule.length;
      setCurrentShow({ ...schedule[nextIndex], startPosition: 0, index: nextIndex });
    }
  };

  const playCurrentShow = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
        await videoRef.current.setPositionAsync(currentShow.startPosition);
        await videoRef.current.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling play:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (videoRef.current) {
      await videoRef.current.presentFullscreenPlayer();
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchSchedule();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DAB9FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#DAB9FF" />
          <Text style={styles.refreshButtonText}>تلاش مجدد</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.nowPlaying}>در حال پخش: {currentShow?.name}</Text>
      </View>
      <View style={styles.videoContainer}>
        {currentShow && (
          <Video
            ref={videoRef}
            source={{ uri: currentShow.url }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={true}
            positionMillis={currentShow.startPosition}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            style={styles.video}
          />
        )}
        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={togglePlayPause} 
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={28} 
              color="#DAB9FF" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={toggleFullscreen} 
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="expand" 
              size={28} 
              color="#DAB9FF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.85, // Slightly adjusted width
    alignSelf: 'center',
    backgroundColor: '#272052',
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  headerContainer: {
    backgroundColor: 'rgba(39, 32, 82, 0.8)',
    paddingVertical: 8,
  },
  videoContainer: {
    aspectRatio: 16/9,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  nowPlaying: {
    color: '#DAB9FF',
    textAlign: 'center',
    fontFamily: 'aviny',
    fontSize: 16,
  },
  errorText: {
    color: '#DAB9FF',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'aviny',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 30, 
  },
  controlButton: {
    marginRight: 15,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(218, 185, 255, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#DAB9FF',
    marginLeft: 10,
    fontFamily: 'aviny',
  }
});

export default LiveTV;