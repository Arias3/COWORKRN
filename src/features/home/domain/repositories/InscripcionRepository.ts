import Inscripcion from '../entities/InscripcionEntity';

/**
 * InscripcionRepository Interface
 * 
 * Defines operations for enrollment management.
 */
export interface InscripcionRepository {
    getInscripciones(): Promise<Inscripcion[]>;
    getInscripcionesPorUsuario(usuarioId: number): Promise<Inscripcion[]>;
    getInscripcionesPorCurso(cursoId: number): Promise<Inscripcion[]>;
    getInscripcion(usuarioId: number, cursoId: number): Promise<Inscripcion | null>;
    createInscripcion(inscripcion: Inscripcion): Promise<number>;
    deleteInscripcion(usuarioId: number, cursoId: number): Promise<void>;
    estaInscrito(usuarioId: number, cursoId: number): Promise<boolean>;
}

export default InscripcionRepository;
