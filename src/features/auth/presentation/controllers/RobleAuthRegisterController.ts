import { RobleAuthRegisterUseCase } from '../../domain/usecases/RobleAuthRegisterUseCase';
import { RobleAuthLoginController } from './RobleAuthLoginController';

/**
 * RobleAuthRegisterController
 * 
 * Controller for user registration workflow.
 * Handles registration and automatic login.
 */
export class RobleAuthRegisterController {
    private useCase: RobleAuthRegisterUseCase;
    public isLoading: boolean = false;
    public errorMessage: string = '';
    public success: boolean = false;

    private listeners: Set<() => void> = new Set();

    constructor(useCase: RobleAuthRegisterUseCase) {
        this.useCase = useCase;
    }

    // Observer pattern para notificar cambios de estado
    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    public async register(params: {
        name: string;
        email: string;
        password: string;
        loginController: RobleAuthLoginController;
    }): Promise<boolean> {
        try {
            this.isLoading = true;
            this.errorMessage = '';
            this.success = false;
            this.notifyListeners();

            console.log('🔄 === INICIANDO REGISTRO COMPLETO ===');
            console.log('Email:', params.email);
            console.log('Nombre:', params.name);

            // 1. Registrar en el sistema de autenticación
            const result = await this.useCase.call(
                params.email,
                params.password,
                params.name
            );

            if (result) {
                console.log('✅ Registro en Auth exitoso');

                // 2. Hacer login automático para obtener token válido
                try {
                    console.log('🔐 Obteniendo token para crear usuario en tabla...');
                    const loginSuccess = await params.loginController.login({
                        email: params.email,
                        password: params.password,
                        rememberMe: false, // No recordar credenciales del registro automático
                    });

                    if (loginSuccess) {
                        console.log('✅ Login automático exitoso - Usuario creado en tabla durante login');
                        this.success = true;

                        // Nota: Snackbar se manejará en el componente React
                        console.log('¡Registro Exitoso!');
                        console.log(`Bienvenido ${params.name}. Ya puedes iniciar sesión.`);

                        // Hacer logout automático para no dejar la sesión activa
                        await params.loginController.logout();
                        console.log('🔄 Logout automático completado');
                    } else {
                        console.log('⚠️ Login automático falló, usuario se creará en primer login manual');
                        this.success = true;

                        console.log('Registro Parcial');
                        console.log('Cuenta creada. Al iniciar sesión se completará el perfil.');
                    }
                } catch (e) {
                    console.log('❌ Error en login automático:', e);
                    // Registro en Auth fue exitoso, solo falló el login automático
                    this.success = true;

                    console.log('Registro Parcial');
                    console.log('Cuenta creada. Al iniciar sesión se completará el perfil.');
                }
            } else {
                console.log('❌ Fallo en registro de Auth');
                this.success = false;
            }

            console.log('🏁 === FIN REGISTRO ===');
            return this.success;
        } catch (e) {
            console.log('❌ Error general en registro:', e);
            this.errorMessage = `Error: ${e}`;
            return false;
        } finally {
            this.isLoading = false;
            this.notifyListeners();
        }
    }
}

export default RobleAuthRegisterController;
