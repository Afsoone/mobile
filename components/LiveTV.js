// components/LiveTV.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import axios from 'axios';
import moment from 'moment-timezone';

const LiveTV = () => {
  const [schedule, setSchedule] = useState([]);
  const [processedSchedule, setProcessedSchedule] = useState([]);
  const [currentShow, setCurrentShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const getVideoDuration = async (url) => {
    try {
      const { sound, status } = await Video.createAsync(
        { uri: url },
        { shouldPlay: false }
      );
      
      if (status.isLoaded) {
        const durationMillis = status.durationMillis;
        await sound.unloadAsync(); // Clean up
        return Math.floor(durationMillis / 1000); // Convert to seconds
      }
      
      return null;
    } catch (error) {
      console.error('Error getting video duration:', error);
      return null;
    }
  };

  const processSchedule = async (rawSchedule) => {
    const processed = [];
    
    for (const show of rawSchedule) {
      const duration = await getVideoDuration(show.url);
      if (duration) {
        processed.push({
          ...show,
          duration: duration
        });
      }
    }
    
    return processed;
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/Afsoone/mobile/main/tv.json');
      setSchedule(response.data.programs);
      
      const processed = await processSchedule(response.data.programs);
      setProcessedSchedule(processed);
      setError(null);
    } catch (err) {
      setError('Failed to load TV schedule');
      console.error('Schedule fetch error:', err);
    }
  };

  const findCurrentShow = () => {
    if (!processedSchedule.length) return null;

    const tehranTime = moment().tz('Asia/Tehran');
    const currentTimeSeconds = tehranTime.hours() * 3600 + tehranTime.minutes() * 60 + tehranTime.seconds();

    let totalSeconds = 0;
    for (let i = 0; i < processedSchedule.length; i++) {
      const show = processedSchedule[i];
      const showDuration = show.duration;
      
      if (currentTimeSeconds >= totalSeconds && 
          currentTimeSeconds < (totalSeconds + showDuration)) {
        
        const secondsIntoShow = currentTimeSeconds - totalSeconds;
        const millisecondsIntoShow = secondsIntoShow * 1000;
        
        return {
          ...show,
          startPosition: millisecondsIntoShow,
          index: i
        };
      }
      
      totalSeconds += showDuration;
    }

    return {
      ...processedSchedule[0],
      startPosition: 0,
      index: 0
    };
  };

  const playNextShow = async (nextIndex) => {
    if (!processedSchedule.length) return;
    
    const nextShowIndex = nextIndex >= processedSchedule.length ? 0 : nextIndex;
    const show = {
      ...processedSchedule[nextShowIndex],
      startPosition: 0,
      index: nextShowIndex
    };
    
    setCurrentShow(show);
  };

  useEffect(() => {
    fetchSchedule();
    const scheduleInterval = setInterval(fetchSchedule, 1000 * 60 * 60); // Refresh schedule every hour
    
    return () => clearInterval(scheduleInterval);
  }, []);

  useEffect(() => {
    if (processedSchedule.length > 0) {
      const show = findCurrentShow();
      setCurrentShow(show);
      setIsLoading(false);

      const syncInterval = setInterval(() => {
        const updatedShow = findCurrentShow();
        setCurrentShow(updatedShow);
      }, 1000);

      return () => clearInterval(syncInterval);
    }
  }, [processedSchedule]);

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.nowPlaying}>
        در حال پخش: {currentShow?.name}
      </Text>
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
          onPlaybackStatusUpdate={status => {
            if (status.didJustFinish) {
              playNextShow(currentShow.index + 1);
            }
          }}
          style={styles.video}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#272052',
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  nowPlaying: {
    color: '#DAB9FF',
    textAlign: 'center',
    padding: 5,
    fontFamily: 'aviny',
    fontSize: 16,
  },
  errorText: {
    color: '#DAB9FF',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'aviny',
  }
});

export default LiveTV;