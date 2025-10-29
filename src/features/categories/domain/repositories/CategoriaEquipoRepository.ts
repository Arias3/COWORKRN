/**
 * CategoriaEquipoRepository Interface
 * 
 * Defines operations for managing team categories.
 */

import { CategoriaEquipo } from '../entities/CategoriaEquipoEntity';

export interface ICategoriaEquipoRepository {
    getCategoriasPorCurso(cursoId: number): Promise<CategoriaEquipo[]>;
    getCategoriaById(id: number): Promise<CategoriaEquipo | null>;
    createCategoria(categoria: CategoriaEquipo): Promise<number>;
    updateCategoria(categoria: CategoriaEquipo): Promise<void>;
    deleteCategoria(id: number): Promise<void>;
}

export default ICategoriaEquipoRepository;
