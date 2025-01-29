import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import axios from 'axios';
import moment from 'moment-timezone';

const LiveTV = () => {
  const [schedule, setSchedule] = useState([]);
  const [currentShow, setCurrentShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/YourUsername/YourRepo/main/tv.json');
      setSchedule(response.data.programs);
      setError(null);
    } catch (err) {
      setError('Failed to load TV schedule');
      console.error('Schedule fetch error:', err);
    }
  };

  const findCurrentShow = () => {
    if (!schedule.length) return null;

    const tehranTime = moment().tz('Asia/Tehran');
    const currentTimeMinutes = tehranTime.hours() * 60 + tehranTime.minutes();

    let totalMinutes = 0;
    for (let i = 0; i < schedule.length; i++) {
      const show = schedule[i];
      const showDuration = parseInt(show.duration);
      
      if (currentTimeMinutes >= totalMinutes && 
          currentTimeMinutes < (totalMinutes + showDuration)) {
        
        // Calculate how many minutes into the show we are
        const minutesIntoShow = currentTimeMinutes - totalMinutes;
        const millisecondsIntoShow = minutesIntoShow * 60 * 1000;
        
        return {
          ...show,
          startPosition: millisecondsIntoShow,
          index: i
        };
      }
      
      totalMinutes += showDuration;
    }

    // If we're past the last show, start from beginning
    return {
      ...schedule[0],
      startPosition: 0,
      index: 0
    };
  };

  const playNextShow = async (nextIndex) => {
    if (!schedule.length) return;
    
    const nextShowIndex = nextIndex >= schedule.length ? 0 : nextIndex;
    const show = {
      ...schedule[nextShowIndex],
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
    if (schedule.length > 0) {
      const show = findCurrentShow();
      setCurrentShow(show);
      setIsLoading(false);
    }
  }, [schedule]);

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