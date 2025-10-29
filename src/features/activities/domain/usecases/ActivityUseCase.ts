/**
 * ActivityUseCase
 * 
 * Business logic for activity management.
 * Handles validation, filtering, and orchestration of activity operations.
 */

import { Activity } from '../entities/Activity';
import { IActivityRepository } from '../repositories/IActivityRepository';

export class ActivityUseCase {
    private repository: IActivityRepository;

    constructor(repository: IActivityRepository) {
        this.repository = repository;
    }

    // ===================== BASIC OPERATIONS =====================

    async getAllActivities(): Promise<Activity[]> {
        try {
            return await this.repository.getAllActivities();
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo todas las actividades:', e);
            return [];
        }
    }

    async getActivityById(id: number): Promise<Activity | null> {
        try {
            return await this.repository.getActivityById(id);
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividad por ID:', e);
            return null;
        }
    }

    async getActivitiesByCategoria(categoriaId: number): Promise<Activity[]> {
        try {
            return await this.repository.getActivitiesByCategoria(categoriaId);
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividades por categoría:', e);
            return [];
        }
    }

    async createActivity(params: {
        categoriaId: number;
        nombre: string;
        descripcion: string;
        fechaEntrega: Date;
        archivoAdjunto?: string;
    }): Promise<number> {
        try {
            // Basic validations
            if (!params.nombre || params.nombre.trim().length === 0) {
                throw new Error('El nombre de la actividad es obligatorio');
            }

            if (!params.descripcion || params.descripcion.trim().length === 0) {
                throw new Error('La descripción de la actividad es obligatoria');
            }

            if (params.fechaEntrega < new Date()) {
                throw new Error('La fecha de entrega debe ser futura');
            }

            // Check if activity with same name exists in category
            const exists = await this.repository.existsActivityInCategory(
                params.categoriaId,
                params.nombre.trim()
            );

            if (exists) {
                throw new Error('Ya existe una actividad con ese nombre en esta categoría');
            }

            const activity = new Activity({
                categoriaId: params.categoriaId,
                nombre: params.nombre.trim(),
                descripcion: params.descripcion.trim(),
                fechaEntrega: params.fechaEntrega,
                archivoAdjunto: params.archivoAdjunto?.trim(),
                activo: true,
            });

            return await this.repository.createActivity(activity);
        } catch (e) {
            console.error('❌ [USECASE] Error creando actividad:', e);
            throw e;
        }
    }

    async updateActivity(params: {
        id: number;
        nombre?: string;
        descripcion?: string;
        fechaEntrega?: Date;
        archivoAdjunto?: string;
    }): Promise<void> {
        try {
            const currentActivity = await this.repository.getActivityById(params.id);
            if (!currentActivity) {
                throw new Error('Actividad no encontrada');
            }

            // Validations if updating
            if (params.nombre !== undefined && params.nombre.trim().length === 0) {
                throw new Error('El nombre de la actividad no puede estar vacío');
            }

            if (params.descripcion !== undefined && params.descripcion.trim().length === 0) {
                throw new Error('La descripción de la actividad no puede estar vacía');
            }

            if (params.fechaEntrega !== undefined && params.fechaEntrega < new Date()) {
                throw new Error('La fecha de entrega debe ser futura');
            }

            // Check duplicate name if changing name
            if (params.nombre !== undefined && params.nombre.trim() !== currentActivity.nombre) {
                const exists = await this.repository.existsActivityInCategory(
                    currentActivity.categoriaId,
                    params.nombre.trim()
                );

                if (exists) {
                    throw new Error('Ya existe una actividad con ese nombre en esta categoría');
                }
            }

            const updatedActivity = currentActivity.copyWith({
                nombre: params.nombre?.trim(),
                descripcion: params.descripcion?.trim(),
                fechaEntrega: params.fechaEntrega,
                archivoAdjunto: params.archivoAdjunto?.trim(),
            });

            await this.repository.updateActivity(updatedActivity);
        } catch (e) {
            console.error('❌ [USECASE] Error actualizando actividad:', e);
            throw e;
        }
    }

    async deleteActivity(id: number): Promise<void> {
        try {
            await this.repository.deleteActivity(id);
        } catch (e) {
            console.error('❌ [USECASE] Error eliminando actividad:', e);
            throw e;
        }
    }

    // ===================== SPECIFIC OPERATIONS =====================

    async getActiveActivities(): Promise<Activity[]> {
        try {
            return await this.repository.getActiveActivities();
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividades activas:', e);
            return [];
        }
    }

    async getActivitiesInDateRange(inicio: Date, fin: Date): Promise<Activity[]> {
        try {
            if (inicio > fin) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }

            return await this.repository.getActivitiesInDateRange(inicio, fin);
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividades por rango de fechas:', e);
            return [];
        }
    }

    async deactivateActivity(id: number): Promise<void> {
        try {
            await this.repository.deactivateActivity(id);
        } catch (e) {
            console.error('❌ [USECASE] Error desactivando actividad:', e);
            throw e;
        }
    }

    async deleteActivitiesByCategoria(categoriaId: number): Promise<void> {
        try {
            await this.repository.deleteActivitiesByCategoria(categoriaId);
        } catch (e) {
            console.error('❌ [USECASE] Error eliminando actividades por categoría:', e);
            throw e;
        }
    }

    // ===================== SEARCHES =====================

    async searchActivitiesByName(query: string): Promise<Activity[]> {
        try {
            if (!query || query.trim().length === 0) {
                return await this.getAllActivities();
            }

            return await this.repository.searchActivitiesByName(query.trim());
        } catch (e) {
            console.error('❌ [USECASE] Error buscando actividades por nombre:', e);
            return [];
        }
    }

    async getUpcomingActivities(days: number = 7): Promise<Activity[]> {
        try {
            const now = new Date();
            const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

            return await this.repository.getActivitiesInDateRange(now, limit);
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividades próximas:', e);
            return [];
        }
    }

    async getOverdueActivities(): Promise<Activity[]> {
        try {
            const allActivities = await this.repository.getActiveActivities();
            const now = new Date();

            return allActivities.filter(activity => activity.fechaEntrega < now);
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo actividades vencidas:', e);
            return [];
        }
    }

    // ===================== VALIDATIONS =====================

    async canDeleteActivity(id: number): Promise<boolean> {
        try {
            const activity = await this.repository.getActivityById(id);
            if (!activity) return false;

            // Logic: cannot delete if deadline has passed
            const now = new Date();
            return activity.fechaEntrega > now;
        } catch (e) {
            console.error('❌ [USECASE] Error validando eliminación de actividad:', e);
            return false;
        }
    }

    async isActivityNameAvailable(categoriaId: number, nombre: string): Promise<boolean> {
        try {
            const exists = await this.repository.existsActivityInCategory(categoriaId, nombre);
            return !exists;
        } catch (e) {
            console.error('❌ [USECASE] Error verificando disponibilidad de nombre:', e);
            return false;
        }
    }

    // ===================== STATISTICS =====================

    async getActivityStats(): Promise<{
        total: number;
        activas: number;
        vencidas: number;
        proximas: number;
    }> {
        try {
            const allActivities = await this.repository.getAllActivities();
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const activas = allActivities.filter(a => a.activo).length;
            const vencidas = allActivities.filter(
                a => a.activo && a.fechaEntrega < now
            ).length;
            const proximas = allActivities.filter(
                a => a.activo && a.fechaEntrega > now && a.fechaEntrega < weekFromNow
            ).length;

            return {
                total: allActivities.length,
                activas,
                vencidas,
                proximas,
            };
        } catch (e) {
            console.error('❌ [USECASE] Error obteniendo estadísticas:', e);
            return { total: 0, activas: 0, vencidas: 0, proximas: 0 };
        }
    }
}

export default ActivityUseCase;
