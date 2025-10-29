import { Usuario } from '../../../auth/domain/entities/UserEntity';
import { UsuarioUseCase } from '../../../auth/domain/use_case/UsuarioUseCase';
import { RobleAuthLoginController } from '../../../auth/presentation/controllers/RobleAuthLoginController';
import CursoDomain from '../../domain/entities/CursoEntity';
import CursoUseCase from '../../domain/usecases/CursoUseCase';

/**
 * HomeController
 * 
 * Main controller for the home screen.
 * Manages course lists (taught and enrolled) and UI state.
 */
export class HomeController {
    private cursoUseCase: CursoUseCase;
    private authController: RobleAuthLoginController;
    private usuarioUseCase: UsuarioUseCase;

    // UI States
    public dictados: CursoDomain[] = [];
    public inscritos: CursoDomain[] = [];
    public isLoadingDictados: boolean = false;
    public isLoadingInscritos: boolean = false;
    public selectedTab: number = 0;

    // Categorías disponibles
    public categorias: string[] = [
        'Matemáticas',
        'Programación',
        'Diseño',
        'Idiomas',
        'Ciencias',
        'Arte',
        'Negocios',
        'Tecnología',
    ];

    private listeners: Set<() => void> = new Set();

    constructor(
        cursoUseCase: CursoUseCase,
        authController: RobleAuthLoginController,
        usuarioUseCase: UsuarioUseCase
    ) {
        this.cursoUseCase = cursoUseCase;
        this.authController = authController;
        this.usuarioUseCase = usuarioUseCase;
    }

    // Observer pattern
    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    public async init(): Promise<void> {
        await this.loadInitialData();
    }

    private async loadInitialData(): Promise<void> {
        await this.refreshData();
    }

    // =============== FUNCIONES PARA CURSOS DICTADOS ===============

    public async eliminarCurso(
        curso: CursoDomain,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            await this.cursoUseCase.deleteCurso(curso.id);
            await this.refreshData();
            onSuccess();
            console.log(`✅ Curso "${curso.nombre}" eliminado correctamente`);
        } catch (e) {
            onError('No se pudo eliminar el curso. Inténtalo de nuevo.');
            console.log('Error al eliminar curso:', e);
        }
    }

    // =============== FUNCIONES PARA CURSOS INSCRITOS ===============

    public async inscribirseEnCurso(
        codigoRegistro: string,
        onSuccess: () => void,
        onError: (message: string) => void
    ): Promise<void> {
        try {
            const userId = this.authController.currentUser?.id;
            if (!userId) {
                onError('Usuario no autenticado');
                return;
            }

            await this.cursoUseCase.inscribirseEnCurso(userId, codigoRegistro);
            await this.refreshData();
            onSuccess();
            console.log('✅ Inscripción exitosa');
        } catch (e) {
            onError('No se pudo completar la inscripción. Verifica el código.');
            console.log('Error en inscripción:', e);
        }
    }

    // =============== UTILIDADES ===============

    public changeTab(index: number): void {
        this.selectedTab = index;
        this.notifyListeners();
    }

    public async refreshData(): Promise<void> {
        try {
            this.isLoadingDictados = true;
            this.isLoadingInscritos = true;
            this.notifyListeners();

            const userId = this.authController.currentUser?.id;
            if (!userId) return;

            // Cargar cursos dictados por el usuario actual
            const cursosProfesor = await this.cursoUseCase.getCursosPorProfesor(userId);
            this.dictados = cursosProfesor;

            // Cargar cursos en los que está inscrito el usuario
            const cursosInscritos = await this.cursoUseCase.getCursosInscritos(userId);
            this.inscritos = cursosInscritos;
        } catch (e) {
            console.log('Error al cargar datos:', e);
        } finally {
            this.isLoadingDictados = false;
            this.isLoadingInscritos = false;
            this.notifyListeners();
        }
    }

    // =============== MÉTODOS PARA ESTUDIANTES REALES ===============

    public async getEstudiantesReales(cursoId: number): Promise<Usuario[]> {
        try {
            console.log('🔍 Obteniendo estudiantes reales del curso', cursoId);

            // Verificar que el ID sea válido
            if (!cursoId || cursoId <= 0) {
                console.log('❌ ID de curso inválido:', cursoId);
                return [];
            }

            // 1. Verificar que el curso existe
            const curso = await this.cursoUseCase.getCursoById(cursoId);
            if (!curso) {
                console.log('❌ No se encontró curso con ID:', cursoId);
                return [];
            }

            console.log(`✅ Curso encontrado: ${curso.nombre} (Código: ${curso.codigoRegistro})`);

            // 2. Obtener inscripciones del curso
            const inscripciones = await this.cursoUseCase.getInscripcionesPorCurso(cursoId);
            console.log('📋 Inscripciones encontradas:', inscripciones.length);

            // Debug: Mostrar detalles de inscripciones
            inscripciones.forEach(inscripcion => {
                console.log(`📝 Inscripción: Usuario ID=${inscripcion.usuarioId}, Curso ID=${inscripcion.cursoId}`);
            });

            if (inscripciones.length === 0) {
                console.log('❌ No hay inscripciones para el curso', cursoId);
                return [];
            }

            // 3. Obtener todos los usuarios del sistema
            const todosUsuarios = await this.usuarioUseCase.getUsuarios();
            console.log('👥 Total usuarios en sistema:', todosUsuarios.length);

            // Debug: Mostrar algunos usuarios disponibles
            console.log('📋 Primeros 5 usuarios del sistema:');
            todosUsuarios.slice(0, 5).forEach(u => {
                console.log(`  - ${u.nombre}: ID=${u.id}, Email=${u.email}`);
            });

            // 4. Filtrar usuarios que están inscritos en este curso
            const estudiantesInscritos = todosUsuarios.filter(usuario => {
                return inscripciones.some(inscripcion => inscripcion.usuarioId === usuario.id);
            });

            console.log('✅ Estudiantes encontrados:', estudiantesInscritos.length);
            estudiantesInscritos.forEach(est => {
                console.log(`  - ${est.nombre} (${est.email})`);
            });

            return estudiantesInscritos;
        } catch (e) {
            console.log('❌ Error obteniendo estudiantes reales:', e);
            return [];
        }
    }
}

export default HomeController;
