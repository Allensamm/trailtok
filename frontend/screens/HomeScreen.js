import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import FeedScreen from './FeedScreen';

const HomeScreen = ({ navigation }) => {
    const { logout, user } = useContext(AuthContext);

    useEffect(() => {
        // Check if user has selected genres
        if (user && (!user.preferences || !user.preferences.preferred_genres || user.preferences.preferred_genres.length === 0)) {
            navigation.replace('GenreSelection');
        }
    }, [user, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoIcon}>▶</Text>
                    </View>
                    <Text style={styles.headerTitle}>TrailTok</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
                    <Ionicons name="person-circle-outline" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
            <FeedScreen />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#0a0a0f',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3a',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#e50914',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 14,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    logoutText: {
        color: '#e50914',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
