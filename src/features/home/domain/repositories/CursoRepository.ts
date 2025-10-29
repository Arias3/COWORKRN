import CursoDomain from '../entities/CursoEntity';

/**
 * CursoRepository Interface
 * 
 * Defines operations for course management.
 */
export interface CursoRepository {
    getCursos(): Promise<CursoDomain[]>;
    getCursosPorProfesor(profesorId: number): Promise<CursoDomain[]>;
    getCursosInscritos(usuarioId: number): Promise<CursoDomain[]>;
    getCursoById(id: number): Promise<CursoDomain | null>;
    getCursoByCodigoRegistro(codigo: string): Promise<CursoDomain | null>;
    createCurso(curso: CursoDomain): Promise<number>;
    updateCurso(curso: CursoDomain): Promise<void>;
    deleteCurso(id: number): Promise<void>;
}

export default CursoRepository;
