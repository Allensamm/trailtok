import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import * as Updates from 'expo-updates';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const UPDATE_CHECK_INTERVAL = 60000; // Check every minute

export default function App() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Animation for update notification
  const [updateNotificationVisible, setUpdateNotificationVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Check for updates on app start
    checkForUpdates();
    
    // Set up periodic update checks
    const interval = setInterval(() => {
      checkForUpdates();
    }, UPDATE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        setUpdateNotificationVisible(true);
        
        // Animate notification
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const downloadUpdate = async () => {
    try {
      setUpdateProgress(0);
      setUpdateMessage('Downloading update...');
      
      const downloadProgress = (progress) => {
        const progressPercent = Math.round(progress.totalBytesWritten / progress.totalBytesExpectedToWrite * 100);
        setUpdateProgress(progressPercent);
        setUpdateMessage(`Downloading update... ${progressPercent}%`);
      };

      await Updates.fetchUpdateAsync(downloadProgress);
      
      setUpdateProgress(100);
      setUpdateMessage('Update downloaded!');
      setUpdateDownloaded(true);
      
      // Auto-apply update after short delay
      setTimeout(async () => {
        await applyUpdate();
      }, 2000);
      
    } catch (error) {
      console.error('Error downloading update:', error);
      Alert.alert('Update Error', 'Failed to download update. Please try again later.');
      setUpdateNotificationVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const applyUpdate = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error applying update:', error);
      Alert.alert('Update Error', 'Failed to apply update. Please restart the app.');
    }
  };

  const handleUpdateAction = (action) => {
    if (action === 'download') {
      downloadUpdate();
    } else {
      // Hide notification
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setUpdateNotificationVisible(false);
      });
    }
  };

  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Update Notification - Small and Non-intrusive */}
        {updateNotificationVisible && (
          <Animated.View 
            style={[
              styles.updateNotification,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }) }]
              }
            ]}
          >
            <Text style={styles.notificationText}>Update Available!</Text>
            <View style={styles.notificationActions}>
              <TouchableOpacity
                style={[styles.notificationButton, styles.downloadButton]}
                onPress={() => handleUpdateAction('download')}
              >
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notificationButton, styles.laterButton]}
                onPress={() => handleUpdateAction('later')}
              >
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Progress Overlay for Active Downloads */}
        {updateProgress > 0 && updateProgress < 100 && (
          <View style={styles.progressOverlay}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{updateMessage}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${updateProgress}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Main App Content */}
        <View style={styles.mainContent}>
          <AppNavigator />
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
  },
  updateNotification: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#27ae60',
  },
  laterButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
});