import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import RobleAuthLoginDataSource from '../../data/datasources/RobleAuthLoginDataSource';
import RobleAuthRegisterDataSource from '../../data/datasources/RobleAuthRegisterDataSource';
import { RobleAuthLoginRepositoryImpl } from '../../data/repositories/RobleAuthLoginRepositoryImpl';
import { RobleAuthRepositoryImpl } from '../../data/repositories/RobleAuthRepositoryImpl';
import { RobleAuthLoginUseCase } from '../../domain/use_case/RobleAuthLoginUseCase';
import { RobleAuthRegisterUseCase } from '../../domain/use_case/RobleAuthRegisterUseCase';
import { useAuth } from '../context/authContext';
import { RobleAuthLoginController } from '../controllers/RobleAuthLoginController';
import { RobleAuthRegisterController } from '../controllers/RobleAuthRegisterController';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * RegisterPage
 * 
 * Registration screen with email/password/name fields.
 * Includes automatic login after successful registration.
 */
export const RegisterPage: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { login } = useAuth();

    // State
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [rol, setRol] = useState<'estudiante' | 'profesor'>('estudiante');
    const [isLoading, setIsLoading] = useState(false);

    // Controllers
    const [registerController] = useState(() => {
        const datasource = new RobleAuthRegisterDataSource();
        const repository = new RobleAuthRepositoryImpl(datasource);
        const useCase = new RobleAuthRegisterUseCase(repository);
        return new RobleAuthRegisterController(useCase);
    });

    const [loginController] = useState(() => {
        const datasource = new RobleAuthLoginDataSource();
        const repository = new RobleAuthLoginRepositoryImpl(datasource);
        const useCase = new RobleAuthLoginUseCase(repository);
        const ctrl = new RobleAuthLoginController(useCase);
        ctrl.init();
        return ctrl;
    });

    const handleRegister = async () => {
        // Validaciones
        if (!nombre.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu nombre');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu email');
            return;
        }

        const trimmedPassword = password.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$_\-])[A-Za-z\d!@#$_\-]{8,}$/;

        if (!passwordRegex.test(trimmedPassword)) {
            Alert.alert(
                'Error',
                'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo permitido (!, @, #, $, _, -)'
            );
            return;
        }

        setIsLoading(true);

        try {
            const success = await registerController.register({
                name: nombre.trim(),
                email: email.trim(),
                password: trimmedPassword,
                loginController: loginController,
            });

            if (success) {
                Alert.alert(
                    'Éxito',
                    'Cuenta creada exitosamente en Roble. Ahora puedes iniciar sesión',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Clear form
                                setNombre('');
                                setEmail('');
                                setPassword('');
                                setRol('estudiante');

                                // Navigate to login
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                });
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Error', registerController.errorMessage || 'Error al registrar');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al registrar. Intenta nuevamente');
        } finally {
            setIsLoading(false);
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
                {/* Login Button */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>Ingresa</Text>
                </TouchableOpacity>

                {/* Register Form */}
                <View style={styles.formContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>Registrate</Text>

                        {/* Nombre Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                placeholderTextColor="#191635"
                                value={nombre}
                                onChangeText={setNombre}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Correo electrónico"
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

                        {/* Rol Selector */}
                        <View style={styles.rolContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.rolButton,
                                    rol === 'estudiante' && styles.rolButtonActive,
                                ]}
                                onPress={() => setRol('estudiante')}
                                disabled={isLoading}
                            >
                                <Text
                                    style={[
                                        styles.rolButtonText,
                                        rol === 'estudiante' && styles.rolButtonTextActive,
                                    ]}
                                >
                                    Estudiante
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.rolButton,
                                    rol === 'profesor' && styles.rolButtonActive,
                                ]}
                                onPress={() => setRol('profesor')}
                                disabled={isLoading}
                            >
                                <Text
                                    style={[
                                        styles.rolButtonText,
                                        rol === 'profesor' && styles.rolButtonTextActive,
                                    ]}
                                >
                                    Profesor
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#3B3576" />
                            ) : (
                                <Text style={styles.registerButtonText}>Registrarse</Text>
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
    loginButton: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#3B3576',
        paddingHorizontal: 24,
        paddingVertical: 9,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    loginButtonText: {
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
        maxHeight: '75%',
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
        marginBottom: 12,
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
    rolContainer: {
        flexDirection: 'row',
        width: 260,
        marginVertical: 12,
        gap: 10,
    },
    rolButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    rolButtonActive: {
        backgroundColor: '#F7D86A',
        borderColor: '#F7D86A',
    },
    rolButtonText: {
        color: '#3B3576',
        fontSize: 14,
        fontWeight: '600',
    },
    rolButtonTextActive: {
        color: '#3B3576',
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: '#F7D86A',
        width: 260,
        paddingVertical: 16,
        borderRadius: 10,
        marginTop: 16,
        alignItems: 'center',
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#3B3576',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterPage;
