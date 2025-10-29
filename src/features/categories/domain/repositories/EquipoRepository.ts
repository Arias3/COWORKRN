/**
 * EquipoRepository Interface
 * 
 * Defines operations for managing teams.
 */

import { Equipo } from '../entities/EquipoEntity';

export interface IEquipoRepository {
    getEquiposPorCategoria(categoriaId: number): Promise<Equipo[]>;
    getEquipoById(id: number): Promise<Equipo | null>;
    getEquipoPorEstudiante(estudianteId: number, categoriaId: number): Promise<Equipo | null>;
    createEquipo(equipo: Equipo): Promise<string>; // Returns Roble string ID
    updateEquipo(equipo: Equipo): Promise<void>;
    deleteEquipo(id: number): Promise<void>;
    deleteEquiposPorCategoria(categoriaId: number): Promise<void>;
    getEquipoByStringId(equipoId: string): Promise<Equipo | null>;
}

export default IEquipoRepository;
