/**
 * CategoriaEquipoUseCase
 * 
 * Business logic for category and team management.
 * Handles category CRUD, team generation, and student assignments.
 */

import { Usuario } from '../../../auth/domain/entities/UserEntity';
import { UsuarioRepository } from '../../../auth/domain/repositories/UsuarioRepository';
import { CategoriaEquipo } from '../entities/CategoriaEquipoEntity';
import { Equipo } from '../entities/EquipoEntity';
import { ICategoriaEquipoRepository } from '../repositories/CategoriaEquipoRepository';
import { IEquipoRepository } from '../repositories/EquipoRepository';

export class CategoriaEquipoUseCase {
    private categoriaRepository: ICategoriaEquipoRepository;
    private equipoRepository: IEquipoRepository;
    private usuarioRepository: UsuarioRepository;

    constructor(
        categoriaRepository: ICategoriaEquipoRepository,
        equipoRepository: IEquipoRepository,
        usuarioRepository: UsuarioRepository
    ) {
        this.categoriaRepository = categoriaRepository;
        this.equipoRepository = equipoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ===================== CATEGORÍAS =====================

    async getCategoriasPorCurso(cursoId: number): Promise<CategoriaEquipo[]> {
        return await this.categoriaRepository.getCategoriasPorCurso(cursoId);
    }

    async getCategoriaById(id: number): Promise<CategoriaEquipo | null> {
        return await this.categoriaRepository.getCategoriaById(id);
    }

    async createCategoria(categoria: CategoriaEquipo): Promise<number> {
        if (!categoria.nombre || categoria.nombre.trim().length === 0) {
            throw new Error('El nombre de la categoría es obligatorio');
        }
        return await this.categoriaRepository.createCategoria(categoria);
    }

    async updateCategoria(categoria: CategoriaEquipo): Promise<void> {
        const existing = await this.categoriaRepository.getCategoriaById(categoria.id!);
        if (!existing) {
            throw new Error('Categoría no encontrada');
        }
        await this.categoriaRepository.updateCategoria(categoria);
    }

    async deleteCategoria(id: number): Promise<void> {
        // Delete associated teams first
        await this.equipoRepository.deleteEquiposPorCategoria(id);
        console.log('✅ [CATEGORIA] Equipos asociados eliminados exitosamente');
        await this.categoriaRepository.deleteCategoria(id);
    }

    // ===================== EQUIPOS =====================

    async getEquiposPorCategoria(categoriaId: number): Promise<Equipo[]> {
        return await this.equipoRepository.getEquiposPorCategoria(categoriaId);
    }

    async getEquipoPorEstudiante(estudianteId: number, categoriaId: number): Promise<Equipo | null> {
        return await this.equipoRepository.getEquipoPorEstudiante(estudianteId, categoriaId);
    }

    async getEquipoById(id: number): Promise<Equipo | null> {
        return await this.equipoRepository.getEquipoById(id);
    }

    async getEquipoByStringId(equipoId: string): Promise<Equipo | null> {
        return await this.equipoRepository.getEquipoByStringId(equipoId);
    }

    async createEquipo(equipo: Equipo): Promise<string> {
        return await this.equipoRepository.createEquipo(equipo);
    }

    async updateEquipo(equipo: Equipo): Promise<void> {
        await this.equipoRepository.updateEquipo(equipo);
    }

    async deleteEquipo(id: number): Promise<void> {
        await this.equipoRepository.deleteEquipo(id);
    }

    async deleteEquiposPorCategoria(categoriaId: number): Promise<void> {
        await this.equipoRepository.deleteEquiposPorCategoria(categoriaId);
    }

    // ===================== ESTUDIANTES =====================

    async getEstudiantesDelCurso(cursoId: number): Promise<Usuario[]> {
        // Get all users from the repository
        const todosLosUsuarios = await this.usuarioRepository.getUsuarios();

        // Filter students only (role === 'estudiante')
        // In a real implementation, you might want to add a method to the repository
        // to filter students by course using the Inscripcion entity
        const estudiantes = todosLosUsuarios.filter(u => u.rol === 'estudiante');

        return estudiantes;
    }
}

export default CategoriaEquipoUseCase;
