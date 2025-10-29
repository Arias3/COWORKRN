/**
 * EquipoActividadRepository Interface
 * 
 * Defines operations for managing team-activity assignments.
 */

import { EquipoActividad } from '../entities/EquipoActividadEntity';

export interface IEquipoActividadRepository {
    getAll(): Promise<EquipoActividad[]>;
    getByEquipoId(equipoId: number): Promise<EquipoActividad[]>;
    getByActividadId(actividadId: string): Promise<EquipoActividad[]>;
    getByEquipoAndActividad(equipoId: number, actividadId: string): Promise<EquipoActividad | null>;
    create(equipoActividad: EquipoActividad): Promise<EquipoActividad>;
    update(equipoActividad: EquipoActividad): Promise<EquipoActividad>;
    delete(id: string): Promise<void>; // String para Roble ObjectId
    deleteByEquipoId(equipoId: number): Promise<void>;
    deleteByActividadId(actividadId: string): Promise<void>;
}

export default IEquipoActividadRepository;
