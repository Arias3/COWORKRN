import AsyncStorage from '@react-native-async-storage/async-storage';
import { RobleAuthLogoutDataSource } from '../../data/datasources/RobleAuthLogoutDataSource';

/**
 * RobleAuthLogoutController
 * 
 * Controller for user logout.
 * Handles logout API call and local token cleanup.
 */
export class RobleAuthLogoutController {
    private logoutDatasource: RobleAuthLogoutDataSource;
    public isLoading: boolean = false;
    public errorMessage: string = '';

    private listeners: Set<() => void> = new Set();

    constructor() {
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

    /**
     * Realiza logout en el backend y limpia los tokens locales
     */
    public async logout(): Promise<void> {
        this.isLoading = true;
        this.notifyListeners();

        const token = await AsyncStorage.getItem('accessToken') || '';

        try {
            await this.logoutDatasource.logout(token);
        } catch (e) {
            this.errorMessage = `Error en logout: ${e}`;
            console.log('Error en logout:', e);
        } finally {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            this.isLoading = false;
            this.notifyListeners();

            // Nota: Navegación se manejará en el componente React
            // Get.offAllNamed('/login');
        }
    }
}

export default RobleAuthLogoutController;
