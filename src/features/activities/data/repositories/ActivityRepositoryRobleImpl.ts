/**
 * ActivityRepositoryRobleImpl
 * 
 * Roble API implementation of IActivityRepository.
 * Handles activity CRUD operations with Roble cloud database.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { Activity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';
import { RobleActivityDTO } from '../models/RobleActivityDTO';

export class ActivityRepositoryRobleImpl implements IActivityRepository {
    private dataSource: RobleApiDataSource;
    private static readonly tableName = 'activities';

    // ID mapping for consistency
    private static localToRoble: Map<number, string> = new Map();
    private static robleToLocal: Map<string, number> = new Map();

    constructor(dataSource: RobleApiDataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Save ID mapping
     */
    private saveMapping(localId: number, robleId: string): void {
        ActivityRepositoryRobleImpl.localToRoble.set(localId, robleId);
        ActivityRepositoryRobleImpl.robleToLocal.set(robleId, localId);
    }

    /**
     * Get original Roble ID from local ID
     */
    private getRobleIdOriginal(localId: number): string | undefined {
        return ActivityRepositoryRobleImpl.localToRoble.get(localId);
    }

    // ===================================================================
    // CREATE
    // ===================================================================

    async createActivity(activity: Activity): Promise<number> {
        try {
            console.log('📝 [Repository] Creando actividad:', activity.nombre);

            const dto = RobleActivityDTO.fromEntity(activity);
            const response = await this.dataSource.create(
                ActivityRepositoryRobleImpl.tableName,
                dto.toJson()
            );

            // Generate local ID from Roble ID
            const robleId = response._id || response.id;
            const localId = RobleActivityDTO.generateConsistentId(robleId);

            // Save ID mapping
            this.saveMapping(localId, robleId);

            console.log(`✅ [Repository] Actividad creada exitosamente (ID: ${localId})`);
            return localId;
        } catch (e) {
            console.error('❌ [Repository] Error creando actividad:', e);
            throw e;
        }
    }

    // ===================================================================
    // READ
    // ===================================================================

    async getAllActivities(): Promise<Activity[]> {
        try {
            console.log('🔍 [Repository] Obteniendo todas las actividades...');

            const data = await this.dataSource.getAll(ActivityRepositoryRobleImpl.tableName);
            const activities = data.map(json => RobleActivityDTO.fromJson(json).toEntity());

            console.log(`✅ [Repository] ${activities.length} actividades obtenidas`);
            return activities;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades:', e);
            return [];
        }
    }

    async getActivityById(id: number): Promise<Activity | null> {
        try {
            console.log(`🔍 [Repository] Buscando actividad con ID: ${id}`);

            // Try to get original Roble ID
            const robleId = this.getRobleIdOriginal(id);
            if (!robleId) {
                console.warn(`⚠️ [Repository] No se encontró mapeo para ID: ${id}`);
                return null;
            }

            const data = await this.dataSource.getById(
                ActivityRepositoryRobleImpl.tableName,
                robleId
            );

            if (data) {
                const activity = RobleActivityDTO.fromJson(data).toEntity();
                console.log(`✅ [Repository] Actividad encontrada: ${activity.nombre}`);
                return activity;
            }

            console.log(`⚠️ [Repository] Actividad no encontrada`);
            return null;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividad:', e);
            return null;
        }
    }

    async getActivitiesByCategoria(categoryId: number): Promise<Activity[]> {
        try {
            console.log(`🔍 [Repository] Obteniendo actividades de categoría: ${categoryId}`);

            const data = await this.dataSource.getWhere(
                ActivityRepositoryRobleImpl.tableName,
                'categoria_id',
                categoryId
            );

            const activities = data.map(json => RobleActivityDTO.fromJson(json).toEntity());

            console.log(`✅ [Repository] ${activities.length} actividades encontradas`);
            return activities;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades por categoría:', e);
            return [];
        }
    }

    async getActiveActivities(): Promise<Activity[]> {
        try {
            console.log('🔍 [Repository] Obteniendo actividades activas...');

            const data = await this.dataSource.getWhere(
                ActivityRepositoryRobleImpl.tableName,
                'activo',
                true
            );

            const activities = data.map(json => RobleActivityDTO.fromJson(json).toEntity());

            console.log(`✅ [Repository] ${activities.length} actividades activas encontradas`);
            return activities;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades activas:', e);
            return [];
        }
    }

    async getActivitiesInDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
        try {
            console.log('🔍 [Repository] Obteniendo actividades por rango de fechas...');
            console.log(`   - Inicio: ${startDate.toISOString()}`);
            console.log(`   - Fin: ${endDate.toISOString()}`);

            // Get all activities and filter by date range
            const allActivities = await this.getAllActivities();
            const filtered = allActivities.filter((activity: Activity) => {
                const fechaEntrega = activity.fechaEntrega;
                return fechaEntrega >= startDate && fechaEntrega <= endDate;
            });

            console.log(`✅ [Repository] ${filtered.length} actividades en rango encontradas`);
            return filtered;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades por fecha:', e);
            return [];
        }
    }

    async getPendingActivities(currentDate: Date): Promise<Activity[]> {
        try {
            console.log('🔍 [Repository] Obteniendo actividades pendientes...');

            const allActivities = await this.getActiveActivities();
            const pending = allActivities.filter(activity =>
                activity.fechaEntrega >= currentDate
            );

            console.log(`✅ [Repository] ${pending.length} actividades pendientes encontradas`);
            return pending;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades pendientes:', e);
            return [];
        }
    }

    async getOverdueActivities(currentDate: Date): Promise<Activity[]> {
        try {
            console.log('🔍 [Repository] Obteniendo actividades vencidas...');

            const allActivities = await this.getActiveActivities();
            const overdue = allActivities.filter(activity =>
                activity.fechaEntrega < currentDate
            );

            console.log(`✅ [Repository] ${overdue.length} actividades vencidas encontradas`);
            return overdue;
        } catch (e) {
            console.error('❌ [Repository] Error obteniendo actividades vencidas:', e);
            return [];
        }
    }

    // ===================================================================
    // UPDATE
    // ===================================================================

    async updateActivity(activity: Activity): Promise<void> {
        try {
            console.log('📝 [Repository] Actualizando actividad:', activity.nombre);

            const robleId = activity.robleId ?? this.getRobleIdOriginal(activity.id!);
            if (!robleId) {
                throw new Error('No se puede actualizar: ID de Roble no encontrado');
            }

            const dto = RobleActivityDTO.fromEntity(activity);
            await this.dataSource.update(
                ActivityRepositoryRobleImpl.tableName,
                robleId,
                dto.toJson()
            );

            console.log('✅ [Repository] Actividad actualizada exitosamente');
        } catch (e) {
            console.error('❌ [Repository] Error actualizando actividad:', e);
            throw e;
        }
    }

    async updateActivityStatus(id: number, isActive: boolean): Promise<void> {
        try {
            console.log(`📝 [Repository] Cambiando estado de actividad ${id} a: ${isActive}`);

            const robleId = this.getRobleIdOriginal(id);
            if (!robleId) {
                throw new Error('No se puede actualizar: ID de Roble no encontrado');
            }

            await this.dataSource.update(
                ActivityRepositoryRobleImpl.tableName,
                robleId,
                { activo: isActive }
            );

            console.log('✅ [Repository] Estado actualizado exitosamente');
        } catch (e) {
            console.error('❌ [Repository] Error actualizando estado:', e);
            throw e;
        }
    }

    // ===================================================================
    // DELETE
    // ===================================================================

    async deleteActivity(id: number): Promise<void> {
        try {
            console.log(`🗑️ [Repository] Eliminando actividad con ID: ${id}`);

            const robleId = this.getRobleIdOriginal(id);
            if (!robleId) {
                throw new Error('No se puede eliminar: ID de Roble no encontrado');
            }

            await this.dataSource.delete(
                ActivityRepositoryRobleImpl.tableName,
                robleId
            );

            // Remove from mapping
            ActivityRepositoryRobleImpl.localToRoble.delete(id);
            ActivityRepositoryRobleImpl.robleToLocal.delete(robleId);

            console.log('✅ [Repository] Actividad eliminada exitosamente');
        } catch (e) {
            console.error('❌ [Repository] Error eliminando actividad:', e);
            throw e;
        }
    }

    async deactivateActivity(id: number): Promise<void> {
        try {
            console.log(`� [Repository] Desactivando actividad: ${id}`);
            await this.updateActivityStatus(id, false);
            console.log('✅ [Repository] Desactivación exitosa');
        } catch (e) {
            console.error('❌ [Repository] Error desactivando actividad:', e);
            throw e;
        }
    }

    // ===================================================================
    // SEARCH
    // ===================================================================

    async searchActivitiesByName(query: string): Promise<Activity[]> {
        try {
            console.log(`🔍 [Repository] Buscando actividades con nombre: "${query}"`);

            const allActivities = await this.getAllActivities();
            const filtered = allActivities.filter((activity: Activity) =>
                activity.nombre.toLowerCase().includes(query.toLowerCase())
            );

            console.log(`✅ [Repository] ${filtered.length} actividades encontradas`);
            return filtered;
        } catch (e) {
            console.error('❌ [Repository] Error buscando actividades:', e);
            return [];
        }
    }

    async existsActivityInCategory(categoriaId: number, nombre: string): Promise<boolean> {
        try {
            console.log(`🔍 [Repository] Verificando si existe actividad "${nombre}" en categoría ${categoriaId}`);

            const activities = await this.getActivitiesByCategoria(categoriaId);
            const exists = activities.some((activity: Activity) =>
                activity.nombre.toLowerCase() === nombre.toLowerCase()
            );

            console.log(`✅ [Repository] Resultado: ${exists}`);
            return exists;
        } catch (e) {
            console.error('❌ [Repository] Error verificando existencia:', e);
            return false;
        }
    }

    // ===================================================================
    // DELETE BATCH
    // ===================================================================

    async deleteActivitiesByCategoria(categoriaId: number): Promise<void> {
        try {
            console.log(`🗑️ [Repository] Eliminando todas las actividades de categoría: ${categoriaId}`);

            const activities = await this.getActivitiesByCategoria(categoriaId);

            for (const activity of activities) {
                if (activity.id) {
                    await this.deleteActivity(activity.id);
                }
            }

            console.log(`✅ [Repository] ${activities.length} actividades eliminadas`);
        } catch (e) {
            console.error('❌ [Repository] Error eliminando actividades por categoría:', e);
            throw e;
        }
    }

    // ===================================================================
    // COUNT (Optional - Not in interface)
    // ===================================================================

    async countActivitiesByCategory(categoryId: number): Promise<number> {
        try {
            const activities = await this.getActivitiesByCategoria(categoryId);
            return activities.length;
        } catch (e) {
            console.error('❌ [Repository] Error contando actividades:', e);
            return 0;
        }
    }

    async countPendingActivities(): Promise<number> {
        try {
            const pending = await this.getPendingActivities(new Date());
            return pending.length;
        } catch (e) {
            console.error('❌ [Repository] Error contando actividades pendientes:', e);
            return 0;
        }
    }
}

export default ActivityRepositoryRobleImpl;
