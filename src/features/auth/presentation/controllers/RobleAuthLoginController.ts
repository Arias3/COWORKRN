import AsyncStorage from '@react-native-async-storage/async-storage';
import RobleConfig from '../../../../core/data/database/RobleConfig';
import DependencyInjection from '../../../../core/di/DependencyInjection';
import { RobleAuthLogoutDataSource } from '../../data/datasources/RobleAuthLogoutDataSource';
import { RobleAuthRefreshTokenDataSource } from '../../data/datasources/RobleAuthRefreshTokenDataSource';
import { Usuario } from '../../domain/entities/UserEntity';
import { RobleAuthLoginUseCase } from '../../domain/usecases/RobleAuthLoginUseCase';
import { UsuarioUseCase } from '../../domain/usecases/UsuarioUseCase';

export class RobleAuthLoginController {
    private useCase: RobleAuthLoginUseCase;
    private refreshDatasource: RobleAuthRefreshTokenDataSource;
    private logoutDatasource: RobleAuthLogoutDataSource;

    public isLoading: boolean = false;
    public errorMessage: string = '';
    public accessToken: string = '';
    public refreshToken: string = '';
    public currentUser: Usuario | null = null;

    private refreshTimer: NodeJS.Timeout | null = null;
    private listeners: Set<() => void> = new Set();

    constructor(useCase: RobleAuthLoginUseCase) {
        this.useCase = useCase;
        this.refreshDatasource = new RobleAuthRefreshTokenDataSource();
        this.logoutDatasource = new RobleAuthLogoutDataSource();
    }

    // Observer pattern para notificar cambios de estado
    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    public init(): void {
        // Timer para refrescar token cada 10 minutos
        this.refreshTimer = setInterval(async () => {
            await this.refreshAccessTokenIfNeeded();
        }, 10 * 60 * 1000); // 10 minutos
    }

    public dispose(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    public async login(params: {
        email: string;
        password: string;
        rememberMe?: boolean;
    }): Promise<boolean> {
        try {
            this.isLoading = true;
            this.errorMessage = '';
            this.notifyListeners();

            // Llamar al login de RobleAuth
            const result = await this.useCase.call(params.email, params.password);

            this.accessToken = result.accessToken || '';
            this.refreshToken = result.refreshToken || '';

            // Configurar token único para tu proyecto
            RobleConfig.setAccessToken(this.accessToken);

            // Activar Roble directamente (tablas ya creadas manualmente)
            if (this.accessToken && !RobleConfig.useRoble) {
                RobleConfig.useRoble = true;
                console.log('✅ Roble activado - usando tablas existentes');
            }

            // Guardar tokens
            await AsyncStorage.setItem('accessToken', this.accessToken);
            await AsyncStorage.setItem('refreshToken', this.refreshToken);

            // Guardar credenciales si es necesario
            if (params.rememberMe) {
                await this.saveCredentials(params.email, params.password);
            } else {
                await AsyncStorage.removeItem('savedEmail');
                await AsyncStorage.removeItem('savedPassword');
            }

            // Procesar información del usuario
            if (result.user) {
                const userData = result.user;
                const authUserId = userData.id.toString();
                const emailNormalizado = params.email.toLowerCase().trim();

                // Obtener el UsuarioUseCase desde DI
                const usuarioUseCase = DependencyInjection.resolve<UsuarioUseCase>('UsuarioUseCase');
                let perfil: Usuario | null = null;

                console.log('🔍 === BÚSQUEDA Y REPARACIÓN DE USUARIO ===');
                console.log('Email:', emailNormalizado);
                console.log('AuthUserId:', authUserId);

                try {
                    // 1. Buscar por email
                    perfil = await usuarioUseCase.getUsuarioByEmail(emailNormalizado);
                    console.log('🔍 Búsqueda por email:', perfil ? 'ENCONTRADO' : 'NO ENCONTRADO');

                    if (perfil) {
                        console.log(`📋 Usuario encontrado - ID actual: ${perfil.id}, Rol: ${perfil.rol}`);

                        // REPARAR DATOS SI ES NECESARIO
                        let necesitaReparacion = false;

                        // Reparar ID si es null o 0
                        if (perfil.id == null || perfil.id <= 0) {
                            const nuevoId = Date.now() % 0x7FFFFFFF;
                            perfil.id = nuevoId === 0 ? 1 : nuevoId;
                            necesitaReparacion = true;
                            console.log('🆔 Nuevo ID asignado:', perfil.id);
                        }

                        // Reparar authUserId
                        if (perfil.authUserId !== authUserId) {
                            perfil.authUserId = authUserId;
                            necesitaReparacion = true;
                            console.log('🔧 REPARANDO: AuthUserId actualizado');
                        }

                        // Reparar nombre
                        const nuevoNombre = userData.name || '';
                        if (nuevoNombre && perfil.nombre !== nuevoNombre) {
                            perfil.nombre = nuevoNombre;
                            necesitaReparacion = true;
                            console.log(`🔧 REPARANDO: Nombre actualizado a "${nuevoNombre}"`);
                        }

                        // Reparar rol: si no es profesor, detectar automáticamente por email
                        const rolFinal = (perfil.rol && perfil.rol === 'profesor')
                            ? 'profesor'
                            : usuarioUseCase.detectarRolPorEmail(emailNormalizado);

                        if (perfil.rol !== rolFinal) {
                            perfil.rol = rolFinal;
                            necesitaReparacion = true;
                            console.log('🔧 REPARANDO: Rol actualizado a', rolFinal);
                        }

                        // Guardar reparaciones
                        if (necesitaReparacion) {
                            await usuarioUseCase.updateUsuario(perfil);
                            console.log('✅ Usuario actualizado correctamente');
                        }

                        this.currentUser = perfil;
                        console.log(`✅ Login completado - Usuario: ${perfil.nombre} (ID: ${perfil.id}, Rol: ${perfil.rol})`);

                    } else {
                        // 2. Usuario no existe, crear nuevo
                        console.log('🆕 Usuario no existe, creando nuevo...');
                        const rolFinal = usuarioUseCase.detectarRolPorEmail(emailNormalizado);
                        const nuevoUsuario = new Usuario({
                            nombre: userData.name || 'Usuario',
                            email: emailNormalizado,
                            password: '',
                            rol: rolFinal,
                            authUserId: authUserId,
                        });

                        const nuevoId = await usuarioUseCase.createUsuarioFromAuth({
                            nombre: nuevoUsuario.nombre,
                            email: nuevoUsuario.email,
                            authUserId: authUserId,
                            rol: rolFinal,
                        });

                        if (nuevoId != null) {
                            nuevoUsuario.id = nuevoId;
                            console.log('✅ Usuario creado con ID:', nuevoId);
                        }

                        this.currentUser = nuevoUsuario;

                        // Nota: Snackbar equivalente se manejará en el componente React
                        console.log(rolFinal === 'profesor' ? 'Profesor Registrado' : 'Usuario Creado');
                        console.log(`Bienvenido ${nuevoUsuario.nombre}`);
                    }

                } catch (e) {
                    console.log('❌ Error general en procesamiento de usuario:', e);
                }
            }

            return this.accessToken.length > 0;
        } catch (e) {
            console.log('❌ Error en login:', e);
            this.errorMessage = String(e);
            return false;
        } finally {
            this.isLoading = false;
            this.notifyListeners();
        }
    }

    public async refreshAccessTokenIfNeeded(): Promise<boolean> {
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken') || '';
        if (!storedRefreshToken) return false;

        try {
            const newAccessToken = await this.refreshDatasource.refreshToken(storedRefreshToken);
            this.accessToken = newAccessToken;

            // Actualizar token
            RobleConfig.setAccessToken(newAccessToken);

            await AsyncStorage.setItem('accessToken', newAccessToken);
            this.notifyListeners();
            return true;
        } catch (e) {
            this.errorMessage = `Error al refrescar token: ${e}`;

            // Nota: Snackbar se manejará en el componente React
            console.log('Sesión expirada - Por seguridad, vuelve a iniciar sesión.');

            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');

            // Nota: Navegación se manejará en el componente React
            return false;
        }
    }

    public async logout(): Promise<void> {
        const token = await AsyncStorage.getItem('accessToken') || '';

        try {
            await this.logoutDatasource.logout(token);
        } catch (e) {
            console.log('Error en logout:', e);
        }

        // Limpiar configuración de Roble
        RobleConfig.clearTokens();
        RobleConfig.useRoble = false;

        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        this.accessToken = '';
        this.refreshToken = '';
        this.currentUser = null;
        this.notifyListeners();

        // Nota: Navegación se manejará en el componente React
    }

    public async saveCredentials(email: string, password: string): Promise<void> {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
    }

    public async getSavedCredentials(): Promise<{ email: string; password: string }> {
        const email = await AsyncStorage.getItem('savedEmail') || '';
        const password = await AsyncStorage.getItem('savedPassword') || '';
        return { email, password };
    }

    public async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
    }

    public async getAccessToken(): Promise<string> {
        return await AsyncStorage.getItem('accessToken') || '';
    }

    public async getRefreshToken(): Promise<string> {
        return await AsyncStorage.getItem('refreshToken') || '';
    }
}
