import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import Inscripcion from '../../domain/entities/InscripcionEntity';
import InscripcionRepository from '../../domain/repositories/InscripcionRepository';
import RobleInscripcionDto from '../models/RobleInscripcionDTO';

/**
 * InscripcionRepositoryRobleImpl
 * 
 * Roble API implementation of InscripcionRepository.
 * Handles enrollment CRUD operations with Roble cloud database.
 */
export class InscripcionRepositoryRobleImpl implements InscripcionRepository {
    private dataSource: RobleApiDataSource;
    private static readonly tableName = 'inscripciones';

    constructor(dataSource: RobleApiDataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Función determinística para IDs consistentes cross-platform
     */
    private static generateConsistentId(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) & 0x7FFFFFFF;
        }
        return hash === 0 ? 1 : hash; // Evitar 0
    }

    async getInscripciones(): Promise<Inscripcion[]> {
        try {
            const data = await this.dataSource.getAll(InscripcionRepositoryRobleImpl.tableName);
            return data.map(json => RobleInscripcionDto.fromJson(json).toEntity());
        } catch (e) {
            console.log('Error obteniendo inscripciones de Roble:', e);
            return [];
        }
    }

    async getInscripcionesPorUsuario(usuarioId: number): Promise<Inscripcion[]> {
        try {
            const data = await this.dataSource.getWhere(
                InscripcionRepositoryRobleImpl.tableName,
                'usuario_id',
                usuarioId
            );
            return data.map(json => RobleInscripcionDto.fromJson(json).toEntity());
        } catch (e) {
            console.log('Error obteniendo inscripciones por usuario de Roble:', e);
            return [];
        }
    }

    async getInscripcionesPorCurso(cursoId: number): Promise<Inscripcion[]> {
        try {
            const data = await this.dataSource.getWhere(
                InscripcionRepositoryRobleImpl.tableName,
                'curso_id',
                cursoId
            );
            return data.map(json => RobleInscripcionDto.fromJson(json).toEntity());
        } catch (e) {
            console.log('Error obteniendo inscripciones por curso de Roble:', e);
            return [];
        }
    }

    async getInscripcion(usuarioId: number, cursoId: number): Promise<Inscripcion | null> {
        try {
            const data = await this.dataSource.getAll(InscripcionRepositoryRobleImpl.tableName);
            const inscripciones = data.filter(
                item => item.usuario_id === usuarioId && item.curso_id === cursoId
            );

            return inscripciones.length > 0
                ? RobleInscripcionDto.fromJson(inscripciones[0]).toEntity()
                : null;
        } catch (e) {
            console.log('Error obteniendo inscripción específica de Roble:', e);
            return null;
        }
    }

    async createInscripcion(inscripcion: Inscripcion): Promise<number> {
        try {
            const dto = RobleInscripcionDto.fromEntity(inscripcion);

            console.log('[ROBLE] Creando inscripcion:');
            console.log('  - Usuario ID:', inscripcion.usuarioId);
            console.log('  - Curso ID:', inscripcion.cursoId);
            console.log('  - Fecha:', inscripcion.fechaInscripcion);
            console.log('  - DTO JSON:', dto.toJson());

            const response = await this.dataSource.create(
                InscripcionRepositoryRobleImpl.tableName,
                dto.toJson()
            );
            console.log('[ROBLE] Respuesta de la API:', response);
            console.log('[ROBLE] Tipo de respuesta:', typeof response);

            // Extraer ID de la respuesta según la estructura de Roble
            const idValue = response.id ?? response._id ?? response.insertedId;
            let nuevoId: number;

            if (idValue != null) {
                if (typeof idValue === 'number') {
                    nuevoId = idValue;
                } else {
                    const parsedId = parseInt(idValue.toString(), 10);
                    nuevoId = isNaN(parsedId)
                        ? InscripcionRepositoryRobleImpl.generateConsistentId(idValue.toString())
                        : parsedId;
                }
            } else {
                // Si no hay ID explícito, generar uno consistente basado en los datos
                const dataForId = `${inscripcion.usuarioId}_${inscripcion.cursoId}_${Date.now()}`;
                nuevoId = InscripcionRepositoryRobleImpl.generateConsistentId(dataForId);
                console.log(`[ROBLE] ID generado automaticamente: ${nuevoId} para datos: ${dataForId}`);
            }

            console.log('[ROBLE] Inscripcion creada con ID:', nuevoId);
            return nuevoId;
        } catch (e) {
            console.log('[ROBLE] ERROR creando inscripcion:', e);
            throw new Error(`No se pudo crear la inscripcion: ${e}`);
        }
    }

    async deleteInscripcion(usuarioId: number, cursoId: number): Promise<void> {
        try {
            const inscripcion = await this.getInscripcion(usuarioId, cursoId);
            if (inscripcion?.id != null) {
                await this.dataSource.delete(InscripcionRepositoryRobleImpl.tableName, inscripcion.id);
            }
        } catch (e) {
            console.log('Error eliminando inscripción de Roble:', e);
            throw new Error(`No se pudo eliminar la inscripción: ${e}`);
        }
    }

    async estaInscrito(usuarioId: number, cursoId: number): Promise<boolean> {
        try {
            const inscripcion = await this.getInscripcion(usuarioId, cursoId);
            return inscripcion !== null;
        } catch (e) {
            console.log('Error verificando inscripción en Roble:', e);
            return false;
        }
    }
}

export default InscripcionRepositoryRobleImpl;
