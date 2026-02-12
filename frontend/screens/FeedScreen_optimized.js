import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Text,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import VideoMovieCard from '../components/VideoMovieCard';

const { height } = Dimensions.get('window');

// OPTIMIZATION: Configurable prefetch settings
const PREFETCH_CONFIG = {
    AHEAD: 5,           // Prefetch 5 videos ahead
    BEHIND: 2,          // Keep 2 videos behind cached
    BATCH_SIZE: 3,      // Process 3 requests at a time (parallel)
    MAX_CACHE_SIZE: 50, // Maximum cached videos
};

const FeedScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const [streamCache, setStreamCache] = useState({});
    const [prefetchQueue, setPrefetchQueue] = useState(new Set());
    const prefetchingRef = useRef(false);

    const fetchMovies = async (pageNum = 1, isRefresh = false) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await api.get(`/movies/feed?page=${pageNum}`);
            const newMovies = response.data.results;

            if (isRefresh) {
                setMovies(newMovies);
                setStreamCache({});
                setPrefetchQueue(new Set());
            } else {
                setMovies(prev => [...prev, ...newMovies]);
            }

            setHasMore(pageNum < response.data.total_pages);
        } catch (error) {
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // OPTIMIZATION: Smart priority-based prefetching
    const prefetchStreamUrl = async (movieId) => {
        if (streamCache[movieId] || prefetchQueue.has(movieId)) {
            return;
        }

        setPrefetchQueue(prev => new Set([...prev, movieId]));

        try {
            const response = await api.get(`/movies/${movieId}/stream`, {
                timeout: 5000, // 5 second timeout
            });

            if (response.data.streamUrl) {
                setStreamCache(prev => {
                    const newCache = { ...prev, [movieId]: response.data.streamUrl };

                    // OPTIMIZATION: Limit cache size to prevent memory issues
                    const cacheKeys = Object.keys(newCache);
                    if (cacheKeys.length > PREFETCH_CONFIG.MAX_CACHE_SIZE) {
                        // Remove oldest entries (not near current position)
                        const currentMovie = movies[activeIndex]?.id;
                        const toRemove = cacheKeys
                            .filter(id => {
                                const idx = movies.findIndex(m => m.id === parseInt(id));
                                return Math.abs(idx - activeIndex) > 10;
                            })
                            .slice(0, 10);

                        toRemove.forEach(id => delete newCache[id]);
                    }

                    return newCache;
                });
            }
        } catch (err) {
            // Silent fail - will load when user reaches it
        } finally {
            setPrefetchQueue(prev => {
                const newQueue = new Set(prev);
                newQueue.delete(movieId);
                return newQueue;
            });
        }
    };

    // OPTIMIZATION: Batch prefetch with priority queue
    const batchPrefetch = async (movieIds) => {
        if (prefetchingRef.current) return;
        prefetchingRef.current = true;

        // Process in batches to avoid overwhelming the network
        for (let i = 0; i < movieIds.length; i += PREFETCH_CONFIG.BATCH_SIZE) {
            const batch = movieIds.slice(i, i + PREFETCH_CONFIG.BATCH_SIZE);
            await Promise.all(batch.map(id => prefetchStreamUrl(id)));
        }

        prefetchingRef.current = false;
    };

    // OPTIMIZATION: Prefetch based on current position
    useEffect(() => {
        if (movies.length === 0) return;

        const startIndex = Math.max(0, activeIndex - PREFETCH_CONFIG.BEHIND);
        const endIndex = Math.min(
            movies.length - 1,
            activeIndex + PREFETCH_CONFIG.AHEAD
        );

        const moviesToPrefetch = [];

        // Priority 1: Current video
        if (movies[activeIndex]) {
            moviesToPrefetch.push(movies[activeIndex].id);
        }

        // Priority 2: Next videos
        for (let i = activeIndex + 1; i <= endIndex; i++) {
            if (movies[i]) moviesToPrefetch.push(movies[i].id);
        }

        // Priority 3: Previous videos
        for (let i = activeIndex - 1; i >= startIndex; i--) {
            if (movies[i]) moviesToPrefetch.push(movies[i].id);
        }

        batchPrefetch(moviesToPrefetch);
    }, [activeIndex, movies]);

    useEffect(() => {
        fetchMovies(1);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setActiveIndex(0);
        fetchMovies(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(nextPage);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index || 0;
            setActiveIndex(newIndex);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No movies found</Text>
                <Text style={styles.emptySubtext}>
                    Try updating your preferences or check back later
                </Text>
            </View>
        );
    };

    // OPTIMIZATION: Show prefetch progress (optional debug info)
    const prefetchStats = () => {
        const cached = Object.keys(streamCache).length;
        const inQueue = prefetchQueue.size;
        return `Cached: ${cached} | Queue: ${inQueue}`;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Optional: Show prefetch stats in dev mode */}
            {__DEV__ && (
                <View style={styles.debugInfo}>
                    <Text style={styles.debugText}>{prefetchStats()}</Text>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={movies}
                renderItem={({ item, index }) => (
                    <VideoMovieCard
                        movie={item}
                        isActive={index === activeIndex}
                        cachedStreamUrl={streamCache[item.id]}
                    />
                )}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#fff"
                    />
                }
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                pagingEnabled
                snapToInterval={height}
                snapToAlignment="start"
                disableIntervalMomentum={true}
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                // OPTIMIZATION: Render optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={2}
                windowSize={3}
                initialNumToRender={1}
                scrollEventThrottle={16}
                updateCellsBatchingPeriod={50}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    footer: {
        paddingVertical: 20,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: height,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    debugInfo: {
        position: 'absolute',
        top: 50,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 4,
        zIndex: 1000,
    },
    debugText: {
        color: '#0f0',
        fontSize: 10,
        fontFamily: 'monospace',
    },
});

export default FeedScreen;
