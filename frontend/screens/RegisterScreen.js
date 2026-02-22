import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        setError('');
        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        const response = await register(username, email, password);
        setLoading(false);
        
        if (!response.success) {
            if (response.error.includes('exists') || response.error.includes('already')) {
                setError('An account with this email or username already exists');
            } else if (response.error.includes('required')) {
                setError('All fields are required');
            } else {
                setError(response.error);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Background gradient effect */}
                <View style={styles.backgroundGradient}>
                    <View style={styles.gradientOrb1} />
                    <View style={styles.gradientOrb2} />
                </View>

                <View style={styles.content}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Text style={styles.logoIcon}>▶</Text>
                        </View>
                        <Text style={styles.logoText}>TrailTok</Text>
                    </View>

                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                setError('');
                            }}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setError('');
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setError('');
                            }}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    keyboardView: {
        flex: 1,
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradientOrb1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#ff6b6b',
        opacity: 0.15,
    },
    gradientOrb2: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#e50914',
        opacity: 0.1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
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
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
        marginBottom: 32,
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: 'rgba(229, 9, 20, 0.15)',
        borderWidth: 1,
        borderColor: '#e50914',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#1a1a25',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2a2a3a',
    },
    button: {
        backgroundColor: '#e50914',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#4a1a1a',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#666',
        fontSize: 16,
    },
    link: {
        color: '#e50914',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
