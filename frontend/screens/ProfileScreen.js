import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [likedMovies, setLikedMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const [watchedResponse, likedResponse] = await Promise.all([
                api.get(`/users/${user.id}/watched`),
                api.get(`/users/${user.id}/liked`),
            ]);

            setWatchedMovies(watchedResponse.data.movies || []);
            setLikedMovies(likedResponse.data.movies || []);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMovieGrid = (movies, title) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {movies.length === 0 ? (
                <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>No movies yet</Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {movies.map((movie) => (
                        <View key={movie.id} style={styles.movieItem}>
                            {movie.poster_path ? (
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                                    style={styles.moviePoster}
                                />
                            ) : (
                                <View style={[styles.moviePoster, styles.placeholderPoster]}>
                                    <Ionicons name="film-outline" size={40} color="#666" />
                                </View>
                            )}
                            <Text style={styles.movieTitle} numberOfLines={2}>
                                {movie.title}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e50914" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity onPress={logout}>
                        <Ionicons name="log-out-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        {user.profile_picture_url ? (
                            <Image source={{ uri: user.profile_picture_url }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={50} color="#666" />
                        )}
                    </View>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.email}>{user.email}</Text>

                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{watchedMovies.length}</Text>
                            <Text style={styles.statLabel}>Watched</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{likedMovies.length}</Text>
                            <Text style={styles.statLabel}>Liked</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('GenreSelection')}
                    >
                        <Ionicons name="settings-outline" size={20} color="#e50914" />
                        <Text style={styles.editButtonText}>Edit Preferences</Text>
                    </TouchableOpacity>
                </View>

                {/* Watched Movies */}
                {renderMovieGrid(watchedMovies, 'Watched Movies')}

                {/* Liked Movies */}
                {renderMovieGrid(likedMovies, 'Liked Movies')}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#333',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e50914',
    },
    editButtonText: {
        color: '#e50914',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    emptySection: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
    movieItem: {
        width: 120,
        marginRight: 12,
    },
    moviePoster: {
        width: 120,
        height: 180,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    placeholderPoster: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    movieTitle: {
        fontSize: 12,
        color: '#fff',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default ProfileScreen;
