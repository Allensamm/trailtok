import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import FeedScreen from './FeedScreen';

const HomeScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (user && (!user.preferences || !user.preferences.preferred_genres || user.preferences.preferred_genres.length === 0)) {
            navigation.replace('GenreSelection');
        }
    }, [user, navigation]);

    return (
        <View style={styles.container}>
            {/* Feed takes full screen */}
            <FeedScreen />

            {/* Header floats over the feed */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        zIndex: 10,
        // Gradient-like fade so header doesn't fully block the video
        backgroundColor: 'rgba(10, 10, 15, 0.6)',
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
});

export default HomeScreen;
