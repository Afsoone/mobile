import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import axios from 'axios';
import moment from 'moment-timezone';
import { Maximize2, Play, Pause } from 'lucide-react-native';

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
    const elapsedTime = secondsSinceMidnight % totalDuration; // Loops back when all videos finish

    let accumulatedTime = 0;
    for (let i = 0; i < schedule.length; i++) {
      const show = schedule[i];
      if (elapsedTime < accumulatedTime + show.duration) {
        return { ...show, startPosition: (elapsedTime - accumulatedTime) * 1000, index: i };
      }
      accumulatedTime += show.duration;
    }
    
    return { ...schedule[0], startPosition: 0, index: 0 }; // Default to first show
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish) {
      let nextIndex = (currentShow.index + 1) % schedule.length; // Loop back to first show
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
      <Text style={styles.nowPlaying}>در حال پخش: {currentShow?.name}</Text>
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
          <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
            {isPlaying ? <Pause color="#DAB9FF" size={24} /> : <Play color="#DAB9FF" size={24} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
            <Maximize2 color="#DAB9FF" size={24} />
          </TouchableOpacity>
        </View>
      </View>
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
  videoContainer: {
    flex: 1,
    position: 'relative',
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
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    marginRight: 15,
    padding: 5,
  }
});

export default LiveTV;
