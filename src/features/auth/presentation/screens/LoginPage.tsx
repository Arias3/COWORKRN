import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import { RobleAuthLoginUseCase } from '../../domain/usecases/RobleAuthLoginUseCase';
import { RobleAuthLoginController } from '../controllers/RobleAuthLoginController';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * LoginPage
 * 
 * Login screen with email/password authentication.
 * Includes "Remember Me" functionality and credential auto-fill.
 */
export const LoginPage: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Controller
    const [controller] = useState(() => {
        const useCase = DependencyInjection.resolve<RobleAuthLoginUseCase>('RobleAuthLoginUseCase');
        return new RobleAuthLoginController(useCase);
    });

    // Subscribe to controller changes
    useEffect(() => {
        const unsubscribe = controller.subscribe(() => {
            setIsLoading(controller.isLoading);
        });

        // Load saved credentials
        loadSavedCredentials();

        // Initialize controller
        controller.init();

        return () => {
            unsubscribe();
            controller.dispose();
        };
    }, []);

    const loadSavedCredentials = async () => {
        const credentials = await controller.getSavedCredentials();
        if (credentials.email) {
            setEmail(credentials.email);
            setPassword(credentials.password);
            setRememberMe(true);
        }
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert(
                'Campos Requeridos',
                'Completa tu email y contraseña',
                [{ text: 'OK' }]
            );
            return;
        }

        const success = await controller.login({
            email: trimmedEmail,
            password: trimmedPassword,
            rememberMe: rememberMe,
        });

        if (success) {
            console.log('✅ Login exitoso');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } else {
            Alert.alert(
                'Error de Acceso',
                'Credenciales incorrectas. Verifica tu email y contraseña.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ImageBackground
                source={require('../../../../../assets/images/login_bg.jpeg')}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Register Button */}
                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerButtonText}>Regístrate</Text>
                </TouchableOpacity>

                {/* Login Form */}
                <View style={styles.formContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>Iniciar sesión</Text>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Usuario"
                                placeholderTextColor="#191635"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!isLoading}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="#191635"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={hidePassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setHidePassword(!hidePassword)}
                            >
                                <Text style={styles.eyeIconText}>
                                    {hidePassword ? '👁️' : '🙈'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Remember Me Checkbox */}
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                            disabled={isLoading}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>Recordarme</Text>
                        </TouchableOpacity>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={() => {
                                console.log('🔄 Recuperación de contraseña - funcionalidad en desarrollo');
                                // TODO: Implementar recuperación de contraseña
                            }}
                        >
                            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#3B3576" />
                            ) : (
                                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    registerButton: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#3B3576',
        paddingHorizontal: 24,
        paddingVertical: 9,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#3B3576',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    scrollContent: {
        alignItems: 'center',
    },
    title: {
        color: '#F7D86A',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        width: 260,
        marginBottom: 10,
        position: 'relative',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 14,
        color: '#191635',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 12,
    },
    eyeIconText: {
        fontSize: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 260,
        marginVertical: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#F7D86A',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#F7D86A',
    },
    checkmark: {
        color: '#3B3576',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    forgotPassword: {
        color: '#FFFFFF',
        textDecorationLine: 'underline',
        marginVertical: 10,
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#F7D86A',
        width: 260,
        paddingVertical: 16,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#3B3576',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginPage;
