import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import * as Updates from 'expo-updates';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setCheckingForUpdate(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to download it now?',
          [
            {
              text: 'Later',
              style: 'cancel'
            },
            {
              text: 'Download',
              onPress: async () => {
                await downloadUpdate();
              }
            }
          ]
        );
      } else {
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setCheckingForUpdate(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update Downloaded',
        'The update has been downloaded. The app will restart now.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await Updates.reloadAsync();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading update:', error);
      Alert.alert('Update Error', 'Failed to download update. Please try again later.');
    }
  };

  return (
    <AuthProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Movie App</Text>
        
        <View style={styles.section}>
          <Text style={styles.subtitle}>Update Status</Text>
          {checkingForUpdate ? (
            <Text style={styles.status}>Checking for updates...</Text>
          ) : isUpdateAvailable ? (
            <Text style={styles.status}>Update available!</Text>
          ) : (
            <Text style={styles.status}>App is up to date</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Manual Update Controls</Text>
          <Button
            title="Check for Updates"
            onPress={checkForUpdates}
            disabled={checkingForUpdate}
          />
          {isUpdateAvailable && (
            <Button
              title="Download & Apply Update"
              onPress={downloadUpdate}
              color="green"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Auto-Update Status</Text>
          <Text style={styles.status}>Auto-updates are enabled. The app will automatically check for and download updates in the background.</Text>
        </View>

        <AppNavigator />
      </View>
      
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  status: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  section: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  }
});