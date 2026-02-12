import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GENRES } from '../constants/Genres';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GenreSelectionScreen = ({ navigation }) => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [saving, setSaving] = useState(false);
    const { user, updateUser } = useContext(AuthContext);

    const toggleGenre = (id) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter((genreId) => genreId !== id));
        } else {
            setSelectedGenres([...selectedGenres, id]);
        }
    };

    const savePreferences = async () => {
        if (selectedGenres.length < 3) {
            Alert.alert('Selection Required', 'Please select at least 3 genres to get better recommendations.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/users/preferences', {
                preferred_genres: selectedGenres
            });

            // Update user context with new preferences
            updateUser({
                preferences: {
                    ...user.preferences,
                    preferred_genres: selectedGenres
                }
            });

            // Navigate to Home or Feed
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pick Your Favorites</Text>
                <Text style={styles.subtitle}>Select at least 3 genres so we can personalize your feed.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id);
                    return (
                        <TouchableOpacity
                            key={genre.id}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected
                            ]}
                            onPress={() => toggleGenre(genre.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.chipText,
                                isSelected && styles.chipTextSelected
                            ]}>
                                {genre.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, selectedGenres.length < 3 && styles.buttonDisabled]}
                    onPress={savePreferences}
                    disabled={saving || selectedGenres.length < 3}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        paddingBottom: 100, // Space for footer
    },
    chip: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 30,
        margin: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipSelected: {
        backgroundColor: '#007AFF', // Or your app primary color
        borderColor: '#005bb5',
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#fff',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GenreSelectionScreen;
