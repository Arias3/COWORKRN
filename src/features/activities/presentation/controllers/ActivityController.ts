/**
 * ActivityController
 * 
 * Main controller for activity management.
 * Handles activity CRUD operations and UI state.
 */

import { CategoriaEquipo } from '../../../categories/domain/entities/CategoriaEquipoEntity';
import { Equipo } from '../../../categories/domain/entities/EquipoEntity';
import { CategoriaEquipoUseCase } from '../../../categories/domain/usecases/CategoriaEquipoUseCase';
import { EquipoActividadUseCase } from '../../../categories/domain/usecases/EquipoActividadUseCase';
import { Activity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';

export class ActivityController {
    private repository: IActivityRepository;
    private categoriaEquipoUseCase: CategoriaEquipoUseCase;
    private equipoActividadUseCase: EquipoActividadUseCase;

    // UI States
    public activities: Activity[] = [];
    public selectedActivity: Activity | null = null;
    public isLoading: boolean = false;
    public error: string | null = null;
    public currentFilter: 'all' | 'active' | 'pending' | 'overdue' = 'all';
    public selectedCategoryId: number | null = null;

    // Team Assignment States
    public categorias: CategoriaEquipo[] = [];
    public equiposDisponibles: Equipo[] = [];
    public equiposSeleccionados: Set<number> = new Set();
    public isLoadingTeams: boolean = false;

    private listeners: Set<() => void> = new Set();

    constructor(
        repository: IActivityRepository,
        categoriaEquipoUseCase: CategoriaEquipoUseCase,
        equipoActividadUseCase: EquipoActividadUseCase
    ) {
        this.repository = repository;
        this.categoriaEquipoUseCase = categoriaEquipoUseCase;
        this.equipoActividadUseCase = equipoActividadUseCase;
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
    // TEAM ASSIGNMENT METHODS
    // ===================================================================

    /**
     * Load categories for a specific course
     */
    public async loadCategoriasPorCurso(cursoId: number): Promise<void> {
        try {
            console.log(`🔍 [Controller] Cargando categorías del curso ${cursoId}...`);
            this.isLoadingTeams = true;
            this.notifyListeners();

            this.categorias = await this.categoriaEquipoUseCase.getCategoriasPorCurso(cursoId);

            this.isLoadingTeams = false;
            this.notifyListeners();

            console.log(`✅ [Controller] ${this.categorias.length} categorías cargadas`);
        } catch (e) {
            this.isLoadingTeams = false;
            this.notifyListeners();
            console.error('❌ [Controller] Error cargando categorías:', e);
        }
    }

    /**
     * Load teams for a specific category
     */
    public async loadEquiposPorCategoria(categoriaId: number): Promise<void> {
        try {
            console.log(`🔍 [Controller] Cargando equipos de categoría ${categoriaId}...`);
            this.isLoadingTeams = true;
            this.notifyListeners();

            this.equiposDisponibles = await this.categoriaEquipoUseCase.getEquiposPorCategoria(categoriaId);
            this.equiposSeleccionados.clear(); // Clear previous selection

            this.isLoadingTeams = false;
            this.notifyListeners();

            console.log(`✅ [Controller] ${this.equiposDisponibles.length} equipos cargados`);
        } catch (e) {
            this.isLoadingTeams = false;
            this.notifyListeners();
            console.error('❌ [Controller] Error cargando equipos:', e);
        }
    }

    /**
     * Toggle team selection
     */
    public toggleEquipoSelection(equipoId: number): void {
        console.log(`🔄 [Controller] Toggle equipo ${equipoId}`);
        console.log(`   Antes: ${Array.from(this.equiposSeleccionados)}`);

        if (this.equiposSeleccionados.has(equipoId)) {
            this.equiposSeleccionados.delete(equipoId);
            console.log('   ➖ Removido');
        } else {
            this.equiposSeleccionados.add(equipoId);
            console.log('   ➕ Agregado');
        }

        console.log(`   Después: ${Array.from(this.equiposSeleccionados)}`);
        this.notifyListeners();
    }

    /**
     * Select all teams
     */
    public selectAllTeams(): void {
        this.equiposSeleccionados.clear();
        this.equiposDisponibles.forEach(equipo => {
            if (equipo.id) {
                this.equiposSeleccionados.add(equipo.id);
            }
        });
        this.notifyListeners();
        console.log(`🔄 [Controller] Seleccionados todos los equipos: ${Array.from(this.equiposSeleccionados)}`);
    }

    /**
     * Select teams that don't have the activity assigned
     */
    public async selectTeamsWithoutActivity(activityId: string): Promise<void> {
        try {
            console.log(`🔍 [Controller] Seleccionando equipos sin actividad ${activityId}...`);

            const equiposConActividad = await this.getEquiposConActividad(activityId);
            const equiposConActividadIds = new Set(equiposConActividad);

            this.equiposSeleccionados.clear();
            this.equiposDisponibles.forEach(equipo => {
                if (equipo.id && !equiposConActividadIds.has(equipo.id)) {
                    this.equiposSeleccionados.add(equipo.id);
                }
            });

            this.notifyListeners();
            console.log(`✅ [Controller] ${this.equiposSeleccionados.size} equipos sin actividad seleccionados`);
        } catch (e) {
            console.error('❌ [Controller] Error seleccionando equipos sin actividad:', e);
        }
    }

    /**
     * Get teams that have the activity assigned (returns team IDs)
     */
    public async getEquiposConActividad(activityId: string): Promise<number[]> {
        try {
            console.log(`🔍 [Controller] Buscando equipos con actividad: ${activityId}`);

            const asignaciones = await this.equipoActividadUseCase.getAsignacionesByActividad(activityId);
            const equiposIds = asignaciones.map(a => a.equipoId);

            console.log(`   Asignaciones encontradas: ${asignaciones.length}`);
            console.log(`   Equipos con actividad: ${equiposIds}`);

            return equiposIds;
        } catch (e) {
            console.error('❌ [Controller] Error obteniendo equipos con actividad:', e);
            return [];
        }
    }

    /**
     * Check if a team has the activity assigned
     */
    public async equipoTieneActividad(equipoId: number, activityId: string): Promise<boolean> {
        try {
            const asignacion = await this.equipoActividadUseCase.getAsignacion(equipoId, activityId);
            return asignacion !== null;
        } catch (e) {
            console.error('❌ [Controller] Error verificando actividad del equipo:', e);
            return false;
        }
    }

    /**
     * Clear team selection
     */
    public clearEquiposSelection(): void {
        this.equiposSeleccionados.clear();
        this.notifyListeners();
        console.log('🔄 [Controller] Selección de equipos limpiada');
    }

    /**
     * Check if a team is selected
     */
    public isEquipoSelected(equipoId: number): boolean {
        const isSelected = this.equiposSeleccionados.has(equipoId);
        // Only log for first team to avoid spam
        if (this.equiposDisponibles.length > 0 && equipoId === this.equiposDisponibles[0].id) {
            console.log(`🔍 [Controller] isEquipoSelected(${equipoId}): ${isSelected}`);
            console.log(`   Lista actual: ${Array.from(this.equiposSeleccionados)}`);
        }
        return isSelected;
    }

    /**
     * Assign activity to selected teams
     */
    public async assignActivityToSelectedTeams(
        activity: Activity,
        onSuccess: (count: number) => void,
        onError: (message: string) => void
    ): Promise<void> {
        if (this.equiposSeleccionados.size === 0) {
            onError('Debe seleccionar al menos un equipo');
            return;
        }

        try {
            console.log(`📝 [Controller] Asignando actividad ${activity.id} a ${this.equiposSeleccionados.size} equipos...`);
            this.isLoading = true;
            this.notifyListeners();

            const activityId = activity.id?.toString() || '';
            const equipoIds = Array.from(this.equiposSeleccionados);

            await this.equipoActividadUseCase.asignarActividadAEquipos(
                activityId,
                equipoIds,
                activity.fechaEntrega
            );

            this.isLoading = false;
            this.equiposSeleccionados.clear();
            this.notifyListeners();

            onSuccess(equipoIds.length);
            console.log(`✅ [Controller] Actividad asignada a ${equipoIds.length} equipos`);
        } catch (e) {
            this.isLoading = false;
            this.notifyListeners();
            onError('Error al asignar actividad a equipos');
            console.error('❌ [Controller] Error asignando actividad:', e);
        }
    }

    /**
     * Get activities assigned to a specific team
     */
    public async getActividadesAsignadasAEquipo(equipoId: number): Promise<Activity[]> {
        try {
            console.log(`🔍 [Controller] Obteniendo actividades del equipo ${equipoId}...`);

            const asignaciones = await this.equipoActividadUseCase.getAsignacionesByEquipo(equipoId);

            if (asignaciones.length === 0) {
                console.log(`ℹ️ [Controller] No hay actividades asignadas al equipo ${equipoId}`);
                return [];
            }

            // Load all activities if not loaded
            if (this.activities.length === 0) {
                await this.loadActivities();
            }

            // Filter activities assigned to this team
            const actividadesAsignadas: Activity[] = [];
            for (const asignacion of asignaciones) {
                const actividad = this.activities.find(
                    a => a.id?.toString() === asignacion.actividadId
                );
                if (actividad) {
                    actividadesAsignadas.push(actividad);
                }
            }

            console.log(`✅ [Controller] ${actividadesAsignadas.length} actividades encontradas para equipo ${equipoId}`);
            return actividadesAsignadas;
        } catch (e) {
            console.error('❌ [Controller] Error obteniendo actividades del equipo:', e);
            return [];
        }
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
