import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.75;

const MovieCard = ({ movie }) => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);
    const [watched, setWatched] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/movies/${movie.id}/like`);
                setLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                await api.post(`/movies/${movie.id}/like`);
                setLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleWatch = async () => {
        try {
            if (!watched) {
                await api.post(`/movies/${movie.id}/watched`);
                setWatched(true);
            }
        } catch (error) {
            console.error('Error marking as watched:', error);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${movie.title}! https://www.themoviedb.org/movie/${movie.id}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    return (
        <View style={styles.card}>
            {/* Movie Poster/Backdrop */}
            {posterUrl ? (
                <Image source={{ uri: posterUrl }} style={styles.poster} />
            ) : (
                <View style={[styles.poster, styles.placeholderPoster]}>
                    <Ionicons name="film-outline" size={80} color="#666" />
                </View>
            )}

            {/* Gradient Overlay */}
            <View style={styles.gradient} />

            {/* Movie Info */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {movie.title}
                </Text>

                <View style={styles.metadata}>
                    <Text style={styles.year}>
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </Text>
                    {movie.vote_average > 0 && (
                        <>
                            <Text style={styles.dot}>•</Text>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                        </>
                    )}
                </View>

                {movie.overview && (
                    <Text style={styles.overview} numberOfLines={3}>
                        {movie.overview}
                    </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Ionicons
                            name={liked ? 'heart' : 'heart-outline'}
                            size={32}
                            color={liked ? '#FF3B30' : '#fff'}
                        />
                        {likeCount > 0 && <Text style={styles.actionText}>{likeCount}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Comments', {
                            movieId: movie.id,
                            movieTitle: movie.title
                        })}
                    >
                        <Ionicons name="chatbubble-outline" size={32} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Ionicons name="share-outline" size={32} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleWatch}>
                        <Ionicons
                            name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                            size={32}
                            color={watched ? '#34C759' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width,
        height: CARD_HEIGHT,
        backgroundColor: '#000',
    },
    poster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderPoster: {
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))',
    },
    info: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    year: {
        fontSize: 16,
        color: '#ccc',
    },
    dot: {
        fontSize: 16,
        color: '#ccc',
        marginHorizontal: 8,
    },
    rating: {
        fontSize: 16,
        color: '#FFD700',
        marginLeft: 4,
        fontWeight: '600',
    },
    overview: {
        fontSize: 14,
        color: '#ddd',
        lineHeight: 20,
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        padding: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
    },
});

export default MovieCard;
