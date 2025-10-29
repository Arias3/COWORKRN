import CursoDomain from '../entities/CursoEntity';
import Inscripcion from '../entities/InscripcionEntity';
import CursoRepository from '../repositories/CursoRepository';
import InscripcionRepository from '../repositories/InscripcionRepository';

/**
 * CursoUseCase
 * 
 * Business logic for course management.
 * Handles course CRUD operations and enrollment.
 */
export class CursoUseCase {
    constructor(
        private cursoRepository: CursoRepository,
        private inscripcionRepository: InscripcionRepository
    ) { }

    async getCursos(): Promise<CursoDomain[]> {
        return this.cursoRepository.getCursos();
    }

    async getCursosPorProfesor(profesorId: number): Promise<CursoDomain[]> {
        return this.cursoRepository.getCursosPorProfesor(profesorId);
    }

    async getCursosInscritos(usuarioId: number): Promise<CursoDomain[]> {
        const inscripciones = await this.inscripcionRepository.getInscripcionesPorUsuario(usuarioId);

        const cursos: CursoDomain[] = [];
        for (const inscripcion of inscripciones) {
            const curso = await this.getCursoById(inscripcion.cursoId);
            if (curso) {
                cursos.push(curso);
            } else {
                console.log(`⚠️ No se encontró curso para ID ${inscripcion.cursoId}`);
            }
        }
        return cursos;
    }

    async getCursoById(id: number): Promise<CursoDomain | null> {
        return this.cursoRepository.getCursoById(id);
    }

    async getCursoByCodigoRegistro(codigo: string): Promise<CursoDomain | null> {
        return this.cursoRepository.getCursoByCodigoRegistro(codigo);
    }

    async createCurso(params: {
        nombre: string;
        descripcion: string;
        profesorId: number;
        codigoRegistro: string;
        imagen?: string;
        categorias?: string[];
        estudiantesNombres?: string[];
    }): Promise<number> {
        // Validaciones básicas
        if (params.nombre.trim() === '') {
            throw new Error('El nombre del curso es obligatorio');
        }
        if (params.descripcion.trim() === '') {
            throw new Error('La descripción es obligatoria');
        }
        if (params.codigoRegistro.trim() === '') {
            throw new Error('El código de registro es obligatorio');
        }

        // ✅ VALIDACIÓN CRÍTICA: Verificar que el código no exista
        const cursoExistente = await this.cursoRepository.getCursoByCodigoRegistro(
            params.codigoRegistro.trim()
        );
        if (cursoExistente) {
            throw new Error(`Ya existe un curso con el código "${params.codigoRegistro}"`);
        }

        // ✅ CORRECCIÓN: Usar el código que recibimos como parámetro
        const curso = new CursoDomain({
            nombre: params.nombre.trim(),
            descripcion: params.descripcion.trim(),
            profesorId: params.profesorId,
            codigoRegistro: params.codigoRegistro.trim(), // ← Usamos el código recibido
            imagen: params.imagen ?? 'assets/images/default_course.png',
            categorias: params.categorias ?? [],
            estudiantesNombres: params.estudiantesNombres ?? [],
        });

        return await this.cursoRepository.createCurso(curso);
    }

    async updateCurso(curso: CursoDomain): Promise<void> {
        return this.cursoRepository.updateCurso(curso);
    }

    async deleteCurso(id: number): Promise<void> {
        return this.cursoRepository.deleteCurso(id);
    }

    async inscribirseEnCurso(usuarioId: number, codigoRegistro: string): Promise<void> {
        console.log(`🔍 Buscando curso con código: "${codigoRegistro}"`);

        const curso = await this.cursoRepository.getCursoByCodigoRegistro(
            codigoRegistro.trim()
        );
        if (!curso) {
            console.log(`❌ No se encontró curso con código: "${codigoRegistro}"`);
            throw new Error('Código de curso no válido');
        }

        console.log(`✅ Curso encontrado: ${curso.nombre} (ID: ${curso.id})`);

        const yaInscrito = await this.inscripcionRepository.estaInscrito(
            usuarioId,
            curso.id
        );
        if (yaInscrito) {
            throw new Error('Ya estás inscrito en este curso');
        }

        const inscripcion = new Inscripcion({
            usuarioId: usuarioId,
            cursoId: curso.id,
        });

        await this.inscripcionRepository.createInscripcion(inscripcion);
        console.log(`✅ Usuario ${usuarioId} inscrito en curso ${curso.id}`);
    }

    /**
     * Método auxiliar para generar códigos automáticos si es necesario
     */
    generateCourseCode(nombre: string): string {
        const timestamp = Date.now().toString().substring(7);
        const nameCode = nombre.replace(/\s/g, '').toUpperCase().substring(0, 3);
        return `${nameCode}${timestamp}`;
    }

    /**
     * Método para validar disponibilidad de código
     */
    async isCodigoDisponible(codigo: string): Promise<boolean> {
        const curso = await this.cursoRepository.getCursoByCodigoRegistro(codigo);
        return curso === null;
    }

    async getInscripcionesPorCurso(cursoId: number): Promise<Inscripcion[]> {
        return await this.inscripcionRepository.getInscripcionesPorCurso(cursoId);
    }
}

export default CursoUseCase;
