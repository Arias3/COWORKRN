/**
 * ActivityController
 * 
 * Main controller for activity management.
 * Handles activity CRUD operations and UI state.
 */

import { Activity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';

export class ActivityController {
    private repository: IActivityRepository;

    // UI States
    public activities: Activity[] = [];
    public selectedActivity: Activity | null = null;
    public isLoading: boolean = false;
    public error: string | null = null;
    public currentFilter: 'all' | 'active' | 'pending' | 'overdue' = 'all';
    public selectedCategoryId: number | null = null;

    private listeners: Set<() => void> = new Set();

    constructor(repository: IActivityRepository) {
        this.repository = repository;
    }

    // ===================================================================
    // OBSERVER PATTERN
    // ===================================================================

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    // ===================================================================
    // INITIALIZATION
    // ===================================================================

    public async init(): Promise<void> {
        await this.loadActivities();
    }

    // ===================================================================
    // CREATE
    // ===================================================================

    public async createActivity(
        activity: Activity,
        onSuccess: (id: number) => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            console.log('📝 [Controller] Creando actividad:', activity.nombre);
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            const id = await this.repository.createActivity(activity);
            await this.loadActivities();

            this.isLoading = false;
            this.notifyListeners();

            onSuccess(id);
            console.log(`✅ [Controller] Actividad creada con ID: ${id}`);
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudo crear la actividad';
            this.notifyListeners();

            onError(this.error);
            console.error('❌ [Controller] Error creando actividad:', e);
        }
    }

    // ===================================================================
    // READ
    // ===================================================================

    public async loadActivities(): Promise<void> {
        try {
            console.log('🔍 [Controller] Cargando actividades...');
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            switch (this.currentFilter) {
                case 'active':
                    this.activities = await this.repository.getActiveActivities();
                    break;
                case 'pending':
                    {
                        const all = await this.repository.getActiveActivities();
                        this.activities = all.filter(a => a.fechaEntrega >= new Date());
                    }
                    break;
                case 'overdue':
                    {
                        const all = await this.repository.getActiveActivities();
                        this.activities = all.filter(a => a.fechaEntrega < new Date());
                    }
                    break;
                default:
                    if (this.selectedCategoryId) {
                        this.activities = await this.repository.getActivitiesByCategoria(this.selectedCategoryId);
                    } else {
                        this.activities = await this.repository.getAllActivities();
                    }
            }

            this.isLoading = false;
            this.notifyListeners();

            console.log(`✅ [Controller] ${this.activities.length} actividades cargadas`);
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudieron cargar las actividades';
            this.notifyListeners();

            console.error('❌ [Controller] Error cargando actividades:', e);
        }
    }

    public async loadActivityById(id: number): Promise<void> {
        try {
            console.log(`🔍 [Controller] Cargando actividad ${id}...`);
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            this.selectedActivity = await this.repository.getActivityById(id);

            this.isLoading = false;
            this.notifyListeners();

            if (this.selectedActivity) {
                console.log(`✅ [Controller] Actividad cargada: ${this.selectedActivity.nombre}`);
            } else {
                console.log('⚠️ [Controller] Actividad no encontrada');
            }
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudo cargar la actividad';
            this.notifyListeners();

            console.error('❌ [Controller] Error cargando actividad:', e);
        }
    }

    public async loadActivitiesByCategory(categoryId: number): Promise<void> {
        try {
            console.log(`🔍 [Controller] Cargando actividades de categoría ${categoryId}...`);
            this.isLoading = true;
            this.error = null;
            this.selectedCategoryId = categoryId;
            this.notifyListeners();

            this.activities = await this.repository.getActivitiesByCategoria(categoryId);

            this.isLoading = false;
            this.notifyListeners();

            console.log(`✅ [Controller] ${this.activities.length} actividades cargadas`);
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudieron cargar las actividades';
            this.notifyListeners();

            console.error('❌ [Controller] Error cargando actividades por categoría:', e);
        }
    }

    // ===================================================================
    // UPDATE
    // ===================================================================

    public async updateActivity(
        activity: Activity,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            console.log('📝 [Controller] Actualizando actividad:', activity.nombre);
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            await this.repository.updateActivity(activity);
            await this.loadActivities();

            this.isLoading = false;
            this.notifyListeners();

            onSuccess();
            console.log('✅ [Controller] Actividad actualizada');
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudo actualizar la actividad';
            this.notifyListeners();

            onError(this.error);
            console.error('❌ [Controller] Error actualizando actividad:', e);
        }
    }

    public async toggleActivityStatus(
        id: number,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            console.log(`📝 [Controller] Cambiando estado de actividad ${id}...`);

            const activity = this.activities.find(a => a.id === id);
            if (!activity) {
                onError('Actividad no encontrada');
                return;
            }

            const updatedActivity = activity.copyWith({ activo: !activity.activo });
            await this.repository.updateActivity(updatedActivity);
            await this.loadActivities();

            onSuccess();
            console.log(`✅ [Controller] Estado cambiado a: ${updatedActivity.activo}`);
        } catch (e) {
            onError('No se pudo cambiar el estado');
            console.error('❌ [Controller] Error cambiando estado:', e);
        }
    }

    // ===================================================================
    // DELETE
    // ===================================================================

    public async deleteActivity(
        id: number,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            console.log(`🗑️ [Controller] Eliminando actividad ${id}...`);
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            await this.repository.deleteActivity(id);
            await this.loadActivities();

            this.isLoading = false;
            this.notifyListeners();

            onSuccess();
            console.log('✅ [Controller] Actividad eliminada');
        } catch (e) {
            this.isLoading = false;
            this.error = 'No se pudo eliminar la actividad';
            this.notifyListeners();

            onError(this.error);
            console.error('❌ [Controller] Error eliminando actividad:', e);
        }
    }

    public async deactivateActivity(
        id: number,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            console.log(`🗑️ [Controller] Desactivando actividad ${id}...`);

            await this.repository.deactivateActivity(id);
            await this.loadActivities();

            onSuccess();
            console.log('✅ [Controller] Actividad desactivada');
        } catch (e) {
            onError('No se pudo desactivar la actividad');
            console.error('❌ [Controller] Error desactivando actividad:', e);
        }
    }

    // ===================================================================
    // SEARCH & FILTER
    // ===================================================================

    public async searchByName(query: string): Promise<void> {
        try {
            console.log(`🔍 [Controller] Buscando actividades: "${query}"`);
            this.isLoading = true;
            this.error = null;
            this.notifyListeners();

            if (query.trim().length === 0) {
                await this.loadActivities();
            } else {
                this.activities = await this.repository.searchActivitiesByName(query);
            }

            this.isLoading = false;
            this.notifyListeners();

            console.log(`✅ [Controller] ${this.activities.length} actividades encontradas`);
        } catch (e) {
            this.isLoading = false;
            this.error = 'Error en la búsqueda';
            this.notifyListeners();

            console.error('❌ [Controller] Error buscando actividades:', e);
        }
    }

    public setFilter(filter: 'all' | 'active' | 'pending' | 'overdue'): void {
        console.log(`🔍 [Controller] Cambiando filtro a: ${filter}`);
        this.currentFilter = filter;
        this.loadActivities();
    }

    public clearCategoryFilter(): void {
        console.log('🔍 [Controller] Limpiando filtro de categoría');
        this.selectedCategoryId = null;
        this.loadActivities();
    }

    // ===================================================================
    // UTILITIES
    // ===================================================================

    public async refreshData(): Promise<void> {
        await this.loadActivities();
    }

    public clearSelectedActivity(): void {
        this.selectedActivity = null;
        this.notifyListeners();
    }

    public clearError(): void {
        this.error = null;
        this.notifyListeners();
    }

    // ===================================================================
    // VALIDATION
    // ===================================================================

    public async validateActivityName(categoryId: number, name: string): Promise<boolean> {
        try {
            return await this.repository.existsActivityInCategory(categoryId, name);
        } catch (e) {
            console.error('❌ [Controller] Error validando nombre:', e);
            return false;
        }
    }
}

export default ActivityController;
