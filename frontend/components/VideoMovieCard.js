import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Share,
    ActivityIndicator,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import ytdl from '@distube/ytdl-core';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const VideoMovieCard = ({ movie, isActive, cachedStreamUrl }) => {
    const navigation = useNavigation();
    const videoRef = useRef(null);
    const [liked, setLiked] = useState(false);
    const [watched, setWatched] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [videoReady, setVideoReady] = useState(false);
    const [streamUrl, setStreamUrl] = useState(cachedStreamUrl || null);
    const [loading, setLoading] = useState(!cachedStreamUrl);
    const [error, setError] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showPauseIcon, setShowPauseIcon] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [embedUrl, setEmbedUrl] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const slideAnim = useRef(new Animated.Value(height)).current;

    // Fetch embed URL for YouTube video
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setLoading(true);
                setError(false);
                
                // Try to get embed URL from backend first
                const response = await api.get(`/movies/${movie.id}/stream`);
                
                if (response.data.embedUrl) {
                    setEmbedUrl(response.data.embedUrl);
                    setVideoReady(true);
                } else {
                    // Fallback: Use ytdl to get direct video URL
                    const videoInfo = await ytdl.getInfo(response.data.videoKey);
                    const videoUrl = videoInfo.videoDetails.video_url;
                    setStreamUrl(videoUrl);
                    setVideoReady(true);
                }
            } catch (err) {
                console.log('Video fetch error:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [movie.id]);

    // Auto-play/pause based on visibility and manual pause state
    useEffect(() => {
        if (videoRef.current) {
            if (isActive && streamUrl && videoReady && !isPaused) {
                videoRef.current.playAsync().catch(err => {
                    console.log('Play error:', err);
                });
            } else {
                videoRef.current.pauseAsync().catch(err => {
                    console.log('Pause error:', err);
                });
            }
        }
    }, [isActive, streamUrl, videoReady, isPaused]);

    // Reset pause state when scrolling to new video
    useEffect(() => {
        if (!isActive) {
            setIsPaused(false);
        }
    }, [isActive]);

    const handleVideoTap = () => {
        if (videoRef.current && streamUrl && videoReady) {
            setIsPaused(!isPaused);
            setShowPauseIcon(true);

            // Hide pause icon after 500ms
            setTimeout(() => {
                setShowPauseIcon(false);
            }, 500);
        }
    };

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

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await api.get(`/movies/${movie.id}`);
            setComments(response.data.user_data?.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCommentPress = () => {
        if (!showComments) {
            fetchComments();
            setShowComments(true);
            Animated.spring(slideAnim, {
                toValue: height * 0.5, // Slide to 50% of screen height
                useNativeDriver: false,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            closeComments();
        }
    };

    const closeComments = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setShowComments(false);
            setCommentText('');
        });
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            const response = await api.post(`/movies/${movie.id}/comment`, {
                comment_text: commentText.trim(),
            });

            // Add new comment to the list
            setComments([response.data.comment, ...comments]);
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const posterUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null;

    return (
        <View style={styles.container}>
            {/* Video Modal with WebView */}
            <Modal
                animationType="fade"
                transparent={false}
                visible={showVideoModal}
                onRequestClose={() => setShowVideoModal(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setShowVideoModal(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {embedUrl && (
                        <WebView
                            source={{ uri: embedUrl }}
                            style={styles.webView}
                            allowsFullscreenVideo={true}
                            mediaPlaybackRequiresUserAction={false}
                        />
                    )}
                </View>
            </Modal>

            {/* Poster Image with Play Button */}
            <View style={[styles.posterContainer, styles.absoluteFill]}>
                {posterUrl ? (
                    <Image source={{ uri: posterUrl }} style={styles.poster} />
                ) : (
                    <View style={[styles.poster, styles.placeholder]}>
                        <Ionicons name="film-outline" size={80} color="#666" />
                    </View>
                )}

                {/* Play Button Overlay */}
                {!loading && !error && embedUrl && (
                    <TouchableOpacity 
                        style={styles.playButtonOverlay}
                        onPress={() => setShowVideoModal(true)}
                    >
                        <View style={styles.playButton}>
                            <Ionicons name="play" size={40} color="#fff" />
                        </View>
                        <Text style={styles.playButtonText}>Watch Trailer</Text>
                    </TouchableOpacity>
                )}

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading trailer...</Text>
                    </View>
                )}
            </View>

            {/* Gradient Overlays */}
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={[styles.gradient, styles.absoluteFill]}
                pointerEvents="none"
            />

            {/* Touchable overlay for pause/play */}
            <TouchableOpacity
                style={styles.videoTouchable}
                onPress={handleVideoTap}
                activeOpacity={1}
            >
                {/* Pause/Play Icon Indicator */}
                {showPauseIcon && (
                    <View style={styles.pauseIconContainer}>
                        <View style={styles.pauseIconBackground}>
                            <Ionicons
                                name={isPaused ? 'play' : 'pause'}
                                size={60}
                                color="#fff"
                            />
                        </View>
                    </View>
                )}
            </TouchableOpacity>

            {/* Movie Info */}
            <View style={styles.infoContainer}>
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
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                        </>
                    )}
                </View>

                {movie.overview && (
                    <Text style={styles.overview} numberOfLines={2}>
                        {movie.overview}
                    </Text>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Ionicons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={36}
                        color={liked ? '#FF3B30' : '#fff'}
                    />
                    {likeCount > 0 && <Text style={styles.actionText}>{likeCount}</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCommentPress}
                >
                    <Ionicons name="chatbubble" size={36} color="#fff" />
                    <Text style={styles.actionText}>{comments.length > 0 ? comments.length : 'Comment'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="share-social" size={36} color="#fff" />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleWatch}>
                    <Ionicons
                        name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={36}
                        color={watched ? '#34C759' : '#fff'}
                    />
                    <Text style={styles.actionText}>Watch</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Sheet Comments */}
            {showComments && (
                <Animated.View
                    style={[
                        styles.commentsBottomSheet,
                        { top: slideAnim }
                    ]}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.commentsContainer}
                    >
                        {/* Header */}
                        <View style={styles.commentsHeader}>
                            <View style={styles.commentsDragHandle} />
                            <View style={styles.commentsHeaderContent}>
                                <Text style={styles.commentsTitle}>
                                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                                </Text>
                                <TouchableOpacity onPress={closeComments}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Comments List */}
                        <FlatList
                            data={comments}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <View style={styles.commentAvatar}>
                                        <Ionicons name="person-circle" size={32} color="#666" />
                                    </View>
                                    <View style={styles.commentContent}>
                                        <Text style={styles.commentUsername}>{item.user?.username || 'User'}</Text>
                                        <Text style={styles.commentText}>{item.comment_text}</Text>
                                        <Text style={styles.commentTime}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                loadingComments ? (
                                    <View style={styles.emptyComments}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                ) : (
                                    <View style={styles.emptyComments}>
                                        <Ionicons name="chatbubble-outline" size={40} color="#666" />
                                        <Text style={styles.emptyCommentsText}>No comments yet</Text>
                                        <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
                                    </View>
                                )
                            }
                            style={styles.commentsList}
                        />

                        {/* Input */}
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="#666"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    !commentText.trim() && styles.sendButtonDisabled
                                ]}
                                onPress={handleAddComment}
                                disabled={!commentText.trim()}
                            >
                                <Ionicons
                                    name="send"
                                    size={24}
                                    color={commentText.trim() ? '#007AFF' : '#666'}
                                />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width,
        height,
        backgroundColor: '#000',
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    nativeVideo: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    webView: {
        flex: 1,
        backgroundColor: '#000',
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        borderRadius: 50,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    posterContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    poster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    videoTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 100, // Don't cover action buttons
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseIconBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 50,
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    noTrailerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    noTrailerText: {
        color: '#999',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    gradient: {
        // Gradient position is handled by absoluteFill
    },
    infoContainer: {
        position: 'absolute',
        bottom: 120,
        left: 16,
        right: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    metadata: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    year: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    dot: {
        fontSize: 14,
        color: '#fff',
        marginHorizontal: 6,
    },
    rating: {
        fontSize: 14,
        color: '#FFD700',
        marginLeft: 4,
        fontWeight: '600',
    },
    overview: {
        fontSize: 13,
        color: '#fff',
        lineHeight: 18,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    actionsContainer: {
        position: 'absolute',
        right: 12,
        bottom: 120,
        alignItems: 'center',
        marginBottom: 20,
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    // Bottom Sheet Comments Styles
    commentsBottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.5,
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    commentsContainer: {
        flex: 1,
    },
    commentsHeader: {
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    commentsDragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#666',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    commentsHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    commentsList: {
        flex: 1,
    },
    commentItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    commentAvatar: {
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#ddd',
        lineHeight: 20,
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12,
        color: '#666',
    },
    emptyComments: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCommentsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
        fontWeight: '600',
    },
    emptyCommentsSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#0a0a0a',
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default VideoMovieCard;
