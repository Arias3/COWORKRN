import Activity from '../entities/Activity';

/**
 * IActivityRepository Interface
 * 
 * Defines operations for activity management.
 */
export interface IActivityRepository {
    // ✅ OPERACIONES BÁSICAS CRUD
    getAllActivities(): Promise<Activity[]>;
    getActivityById(id: number): Promise<Activity | null>;
    getActivitiesByCategoria(categoriaId: number): Promise<Activity[]>;
    createActivity(activity: Activity): Promise<number>;
    updateActivity(activity: Activity): Promise<void>;
    deleteActivity(id: number): Promise<void>;

    // ✅ OPERACIONES ESPECÍFICAS
    getActiveActivities(): Promise<Activity[]>;
    getActivitiesInDateRange(inicio: Date, fin: Date): Promise<Activity[]>;
    deactivateActivity(id: number): Promise<void>;
    deleteActivitiesByCategoria(categoriaId: number): Promise<void>;

    // ✅ BÚSQUEDAS
    searchActivitiesByName(query: string): Promise<Activity[]>;
    existsActivityInCategory(categoriaId: number, nombre: string): Promise<boolean>;
}

export default IActivityRepository;
