/**
 * EquipoActividadUseCase
 * 
 * Business logic for team-activity assignments.
 * Handles assignment CRUD and activity assignment to teams.
 */

import { EquipoActividad } from '../entities/EquipoActividadEntity';
import { IEquipoActividadRepository } from '../repositories/EquipoActividadRepository';

export class EquipoActividadUseCase {
    private repository: IEquipoActividadRepository;

    constructor(repository: IEquipoActividadRepository) {
        this.repository = repository;
    }

    async getAllAsignaciones(): Promise<EquipoActividad[]> {
        return await this.repository.getAll();
    }

    async getAsignacionesByEquipo(equipoId: number): Promise<EquipoActividad[]> {
        return await this.repository.getByEquipoId(equipoId);
    }

    async getAsignacionesByActividad(actividadId: string): Promise<EquipoActividad[]> {
        return await this.repository.getByActividadId(actividadId);
    }

    async getAsignacion(equipoId: number, actividadId: string): Promise<EquipoActividad | null> {
        return await this.repository.getByEquipoAndActividad(equipoId, actividadId);
    }

    async asignarActividadAEquipos(
        actividadId: string,
        equipoIds: number[],
        fechaEntrega?: Date
    ): Promise<void> {
        try {
            for (const equipoId of equipoIds) {
                // Check if assignment already exists
                const existente = await this.repository.getByEquipoAndActividad(equipoId, actividadId);

                if (!existente) {
                    const asignacion = new EquipoActividad({
                        equipoId,
                        actividadId,
                        asignadoEn: new Date(),
                        fechaEntrega: fechaEntrega || undefined,
                        estado: 'pendiente',
                    });
                    await this.repository.create(asignacion);
                    console.log(`✅ Actividad ${actividadId} asignada al equipo ${equipoId}`);
                } else {
                    console.log(`ℹ️ Equipo ${equipoId} ya tiene asignada la actividad ${actividadId}`);
                }
            }
        } catch (e) {
            console.error('❌ Error asignando actividad a equipos:', e);
            throw new Error(`Error al asignar actividad: ${e}`);
        }
    }

    async removerAsignacion(equipoId: number, actividadId: string): Promise<void> {
        try {
            const asignacion = await this.repository.getByEquipoAndActividad(equipoId, actividadId);
            if (asignacion?.id) {
                await this.repository.delete(asignacion.id);
                console.log(`✅ Asignación removida: equipo ${equipoId} - actividad ${actividadId}`);
            }
        } catch (e) {
            console.error('❌ Error removiendo asignación:', e);
            throw new Error(`Error al remover asignación: ${e}`);
        }
    }

    async eliminarAsignacionesPorActividad(actividadId: string): Promise<void> {
        try {
            await this.repository.deleteByActividadId(actividadId);
            console.log(`✅ Eliminadas todas las asignaciones de la actividad ${actividadId}`);
        } catch (e) {
            console.error('❌ Error eliminando asignaciones por actividad:', e);
            throw new Error(`Error al eliminar asignaciones: ${e}`);
        }
    }

    async eliminarAsignacionesPorEquipo(equipoId: number): Promise<void> {
        try {
            await this.repository.deleteByEquipoId(equipoId);
            console.log(`✅ Eliminadas todas las asignaciones del equipo ${equipoId}`);
        } catch (e) {
            console.error('❌ Error eliminando asignaciones por equipo:', e);
            throw new Error(`Error al eliminar asignaciones: ${e}`);
        }
    }
}

export default EquipoActividadUseCase;
