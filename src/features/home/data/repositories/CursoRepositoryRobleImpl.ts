import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import CursoDomain from '../../domain/entities/CursoEntity';
import CursoRepository from '../../domain/repositories/CursoRepository';
import RobleCursoDto from '../models/RobleCursoDTO';

/**
 * CursoRepositoryRobleImpl
 * 
 * Roble API implementation of CursoRepository.
 * Handles course CRUD operations with Roble cloud database.
 */
export class CursoRepositoryRobleImpl implements CursoRepository {
    private dataSource: RobleApiDataSource;
    private static readonly tableName = 'cursos';

    // Mapa para convertir IDs locales a IDs de Roble
    private static localToRoble: Map<number, string> = new Map();
    private static robleToLocal: Map<string, number> = new Map();

    constructor(dataSource: RobleApiDataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Función para generar ID consistente
     */
    private static generateConsistentId(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) & 0x7FFFFFFF;
        }
        return hash === 0 ? 1 : hash;
    }

    /**
     * Guardar mapeo de IDs
     */
    private guardarMapeo(localId: number, robleId: string): void {
        CursoRepositoryRobleImpl.localToRoble.set(localId, robleId);
        CursoRepositoryRobleImpl.robleToLocal.set(robleId, localId);
    }

    /**
     * Obtener ID original de Roble
     */
    private obtenerRobleIdOriginal(localId: number): string | undefined {
        return CursoRepositoryRobleImpl.localToRoble.get(localId);
    }

    async getCursos(): Promise<CursoDomain[]> {
        try {
            const data = await this.dataSource.getAll(CursoRepositoryRobleImpl.tableName);
            return data.map(json => RobleCursoDto.fromJson(json).toEntity());
        } catch (e) {
            console.log('Error obteniendo cursos de Roble:', e);
            return [];
        }
    }

    async getCursosPorProfesor(profesorId: number): Promise<CursoDomain[]> {
        try {
            const data = await this.dataSource.getWhere(
                CursoRepositoryRobleImpl.tableName,
                'profesor_id',
                profesorId
            );
            return data.map(json => RobleCursoDto.fromJson(json).toEntity());
        } catch (e) {
            console.log('Error obteniendo cursos por profesor de Roble:', e);
            return [];
        }
    }

    async getCursosInscritos(usuarioId: number): Promise<CursoDomain[]> {
        try {
            // Obtener inscripciones del usuario
            const inscripciones = await this.dataSource.getWhere(
                'inscripciones',
                'usuario_id',
                usuarioId
            );

            // Obtener cursos correspondientes
            const cursos: CursoDomain[] = [];
            for (const inscripcion of inscripciones) {
                const cursoData = await this.dataSource.getById(
                    CursoRepositoryRobleImpl.tableName,
                    inscripcion.curso_id
                );
                if (cursoData) {
                    cursos.push(RobleCursoDto.fromJson(cursoData).toEntity());
                }
            }
            return cursos;
        } catch (e) {
            console.log('Error obteniendo cursos inscritos de Roble:', e);
            return [];
        }
    }

    async getCursoById(id: number): Promise<CursoDomain | null> {
        try {
            console.log('[ROBLE] getCursoById buscando curso con ID:', id);

            // Primero intentar obtener el ID original de Roble del mapeo
            const robleIdOriginal = this.obtenerRobleIdOriginal(id);

            // Buscar en todos los cursos y comparar ID generado
            console.log('[ROBLE] Buscando en todos los cursos por ID generado:', id);
            const allCursos = await this.dataSource.getAll(CursoRepositoryRobleImpl.tableName);

            for (const cursoData of allCursos) {
                const robleId = cursoData._id;
                if (robleId != null) {
                    const generatedId = CursoRepositoryRobleImpl.generateConsistentId(robleId.toString());
                    if (generatedId === id) {
                        console.log(`[ROBLE] ✅ Curso encontrado con ID: ${id} (Roble: ${robleId})`);
                        // Guardar mapeo para futuros usos si no existe
                        if (!robleIdOriginal) {
                            this.guardarMapeo(id, robleId.toString());
                        }
                        return RobleCursoDto.fromJson(cursoData).toEntity();
                    }
                }
            }

            console.log('[ROBLE] ❌ No se encontró curso con ID:', id);
            return null;
        } catch (e) {
            console.log('[ROBLE] Error obteniendo curso por ID:', e);
            return null;
        }
    }

    async getCursoByCodigoRegistro(codigo: string): Promise<CursoDomain | null> {
        try {
            console.log(`[ROBLE] Buscando curso con codigo: "${codigo}"`);

            // Buscar usando el código exacto como está almacenado
            const data = await this.dataSource.getWhere(
                CursoRepositoryRobleImpl.tableName,
                'codigo_registro',
                codigo
            );

            console.log('[ROBLE] Resultados encontrados:', data.length);

            if (data.length > 0) {
                const cursoData = data[0];
                console.log('[ROBLE] Curso encontrado en BD:', cursoData);

                const cursoEncontrado = RobleCursoDto.fromJson(cursoData).toEntity();
                console.log(`[ROBLE] Curso encontrado: "${cursoEncontrado.nombre}" (ID: ${cursoEncontrado.id})`);
                return cursoEncontrado;
            } else {
                console.log(`[ROBLE] No se encontro curso con codigo: "${codigo}"`);

                // Intentar búsqueda case-insensitive como fallback
                const allCursos = await this.dataSource.getAll(CursoRepositoryRobleImpl.tableName);
                for (const cursoData of allCursos) {
                    const codigoEnBD = cursoData.codigo_registro?.toString().toLowerCase();
                    if (codigoEnBD === codigo.toLowerCase()) {
                        console.log('[ROBLE] Curso encontrado con busqueda case-insensitive');
                        const cursoEncontrado = RobleCursoDto.fromJson(cursoData).toEntity();
                        return cursoEncontrado;
                    }
                }

                return null;
            }
        } catch (e) {
            console.log('[ROBLE] Error buscando curso:', e);
            return null;
        }
    }

    async createCurso(curso: CursoDomain): Promise<number> {
        try {
            const dto = RobleCursoDto.fromEntity(curso);

            console.log(`[ROBLE] Guardando curso "${curso.nombre}" con codigo: "${curso.codigoRegistro}"`);
            console.log('[ROBLE] DTO JSON:', dto.toJson());

            const response = await this.dataSource.create(
                CursoRepositoryRobleImpl.tableName,
                dto.toJson()
            );
            console.log('[ROBLE] Respuesta completa de creacion:', response);

            // Extraer ID de la respuesta según estructura de Roble API
            let nuevoId: number;
            let robleIdOriginal: string | undefined;

            // La respuesta tiene estructura: {inserted: [{_id: "...", ...}], skipped: []}
            if (response.inserted && Array.isArray(response.inserted) && response.inserted.length > 0) {
                const insertedItem = response.inserted[0];
                robleIdOriginal = insertedItem._id;

                console.log('[ROBLE] ID extraido de inserted[0][_id]:', robleIdOriginal);

                if (robleIdOriginal) {
                    nuevoId = CursoRepositoryRobleImpl.generateConsistentId(robleIdOriginal.toString());
                    // Guardar mapeo para lookup posterior
                    this.guardarMapeo(nuevoId, robleIdOriginal);
                } else {
                    nuevoId = CursoRepositoryRobleImpl.generateConsistentId(curso.codigoRegistro);
                }
            } else {
                // Fallback: generar ID consistente basado en código de registro
                nuevoId = CursoRepositoryRobleImpl.generateConsistentId(curso.codigoRegistro);
                console.log(`[ROBLE] Fallback - ID generado para codigo: ${curso.codigoRegistro}`);
            }

            console.log('[ROBLE] Curso guardado con ID final:', nuevoId);
            console.log(`[ROBLE] Mapeo guardado: Local(${nuevoId}) -> Roble(${robleIdOriginal})`);
            return nuevoId;
        } catch (e) {
            console.log('[ROBLE] ERROR creando curso:', e);
            throw new Error(`No se pudo crear el curso: ${e}`);
        }
    }

    async updateCurso(curso: CursoDomain): Promise<void> {
        try {
            const dto = RobleCursoDto.fromEntity(curso);
            await this.dataSource.update(
                CursoRepositoryRobleImpl.tableName,
                curso.id,
                dto.toJson()
            );
        } catch (e) {
            console.log('Error actualizando curso en Roble:', e);
            throw new Error(`No se pudo actualizar el curso: ${e}`);
        }
    }

    async deleteCurso(id: number): Promise<void> {
        try {
            console.log('[ROBLE] deleteCurso iniciando para ID:', id);

            // Primero obtener el ID original de Roble
            let robleIdOriginal = this.obtenerRobleIdOriginal(id);

            if (!robleIdOriginal) {
                // Fallback: buscar en todos los cursos para encontrar el ID de Roble
                console.log('[ROBLE] ID de Roble no encontrado en mapeo, buscando en todos los cursos...');
                const allCursos = await this.dataSource.getAll(CursoRepositoryRobleImpl.tableName);

                for (const cursoData of allCursos) {
                    const robleId = cursoData._id;
                    if (robleId != null) {
                        const generatedId = CursoRepositoryRobleImpl.generateConsistentId(robleId.toString());
                        if (generatedId === id) {
                            robleIdOriginal = robleId.toString();
                            // Guardar mapeo para futuros usos
                            if (robleIdOriginal) {
                                this.guardarMapeo(id, robleIdOriginal);
                            }
                            break;
                        }
                    }
                }
            }

            if (!robleIdOriginal) {
                console.log('[ROBLE] ❌ No se encontró curso con ID:', id);
                throw new Error(`No se encontró el curso con ID: ${id}`);
            }

            console.log('[ROBLE] Eliminando curso con ID de Roble:', robleIdOriginal);

            // Eliminar inscripciones relacionadas primero
            console.log('[ROBLE] Buscando inscripciones del curso...');
            const inscripciones = await this.dataSource.getWhere(
                'inscripciones',
                'curso_id',
                id
            );

            console.log(`[ROBLE] Encontradas ${inscripciones.length} inscripciones para eliminar`);
            for (const inscripcion of inscripciones) {
                const inscripcionId = inscripcion._id;
                if (inscripcionId) {
                    console.log('[ROBLE] Eliminando inscripción con ID de Roble:', inscripcionId);
                    await this.dataSource.delete('inscripciones', inscripcionId.toString());
                    console.log('[ROBLE] ✅ Inscripción eliminada');
                }
            }

            // Eliminar el curso usando el ID de Roble
            console.log('[ROBLE] Eliminando curso principal...');
            await this.dataSource.delete(CursoRepositoryRobleImpl.tableName, robleIdOriginal);
            console.log('[ROBLE] ✅ Curso eliminado');

            // Limpiar mapeo
            CursoRepositoryRobleImpl.localToRoble.delete(id);
            CursoRepositoryRobleImpl.robleToLocal.delete(robleIdOriginal);

            console.log('[ROBLE] ✅ Curso eliminado exitosamente');
        } catch (e) {
            console.log('[ROBLE] Error eliminando curso:', e);
            throw new Error(`No se pudo eliminar el curso: ${e}`);
        }
    }
}

export default CursoRepositoryRobleImpl;
