import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import GenreSelectionScreen from '../screens/GenreSelectionScreen';
import CommentsScreen from '../screens/CommentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.logo}>
                    <Text style={styles.logoIcon}>▶</Text>
                </View>
                <Text style={styles.logoText}>TrailTok</Text>
                <ActivityIndicator size="large" color="#e50914" style={styles.spinner} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Group>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="GenreSelection" component={GenreSelectionScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen
                            name="Comments"
                            component={CommentsScreen}
                            options={{
                                presentation: 'modal',
                                headerShown: false
                            }}
                        />
                    </Stack.Group>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#e50914',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoIcon: {
        fontSize: 30,
        color: '#fff',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
    },
    spinner: {
        marginTop: 8,
    },
});

export default AppNavigator;
