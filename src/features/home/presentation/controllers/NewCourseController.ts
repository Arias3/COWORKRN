import { Usuario } from '../../../auth/domain/entities/UserEntity';
import { UsuarioUseCase } from '../../../auth/domain/usecases/UsuarioUseCase';
import { RobleAuthLoginController } from '../../../auth/presentation/controllers/RobleAuthLoginController';
import CursoUseCase from '../../domain/usecases/CursoUseCase';

/**
 * NewCourseController
 * 
 * Controller for creating new courses.
 * Manages course data, student selection, and categories.
 */
export class NewCourseController {
    private cursoUseCase: CursoUseCase;
    private authController: RobleAuthLoginController;
    private usuarioUseCase: UsuarioUseCase;

    // Variables existentes
    public nombreCurso: string = '';
    public descripcion: string = '';
    public selectedCategorias: string[] = [];
    public isLoading: boolean = false;

    // Variables para manejo de usuarios
    public todosLosEstudiantes: Usuario[] = [];
    public estudiantesDisponibles: Usuario[] = [];
    public estudiantesSeleccionados: Usuario[] = [];
    public searchQuery: string = '';
    public isLoadingStudents: boolean = false;
    public codigoRegistro: string = '';

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
        console.log('🚀 NewCourseController iniciado');

        // Debug del estado inicial de autenticación
        console.log('🔐 Estado inicial de autenticación:');
        console.log('currentUser:', this.authController.currentUser?.nombre);
        if (this.authController.currentUser) {
            console.log('User ID:', this.authController.currentUser.id);
            console.log('User Role:', this.authController.currentUser.rol);
        }

        await this.cargarEstudiantes();
    }

    // ========================================================================
    // MÉTODOS PARA CARGAR Y FILTRAR ESTUDIANTES
    // ========================================================================

    public async cargarEstudiantes(): Promise<void> {
        try {
            this.isLoadingStudents = true;
            this.notifyListeners();
            console.log('🔄 Cargando estudiantes desde BD...');

            const usuarios = await this.usuarioUseCase.getUsuarios();
            console.log('👥 Total usuarios:', usuarios.length);

            // Obtener el usuario actual
            const usuarioActual = this.authController.currentUser;
            console.log(`👤 Usuario actual: ${usuarioActual?.nombre} (ID: ${usuarioActual?.id})`);

            // Filtrar solo estudiantes (excluir profesores Y al usuario actual)
            this.todosLosEstudiantes = usuarios.filter(
                usuario =>
                    usuario.rol === 'estudiante' &&
                    usuario.id !== usuarioActual?.id // Excluir al usuario actual
            );

            console.log(`🎓 Estudiantes encontrados (sin incluir usuario actual): ${this.todosLosEstudiantes.length}`);

            // Inicialmente todos están disponibles
            this.estudiantesDisponibles = [...this.todosLosEstudiantes];
        } catch (e) {
            console.log('❌ Error cargando estudiantes:', e);
        } finally {
            this.isLoadingStudents = false;
            this.notifyListeners();
        }
    }

    public filtrarEstudiantes(): void {
        if (this.searchQuery.trim() === '') {
            // Sin búsqueda, mostrar todos los disponibles
            this.estudiantesDisponibles = this.todosLosEstudiantes.filter(
                estudiante => !this.estudiantesSeleccionados.some(
                    selected => selected.id === estudiante.id
                )
            );
        } else {
            // Filtrar por nombre o email
            const query = this.searchQuery.toLowerCase();
            const resultados: Usuario[] = [];

            for (const estudiante of this.todosLosEstudiantes) {
                const yaSeleccionado = this.estudiantesSeleccionados.some(
                    selected => selected.id === estudiante.id
                );

                if (!yaSeleccionado) {
                    const coincideNombre = estudiante.nombre.toLowerCase().includes(query);
                    const coincideEmail = estudiante.email.toLowerCase().includes(query);

                    if (coincideNombre || coincideEmail) {
                        resultados.push(estudiante);
                    }
                }
            }

            this.estudiantesDisponibles = resultados;
        }

        this.notifyListeners();
    }

    // ========================================================================
    // MÉTODOS PARA MANEJAR SELECCIÓN DE ESTUDIANTES
    // ========================================================================

    public agregarEstudiante(estudiante: Usuario): void {
        if (!this.estudiantesSeleccionados.some(e => e.id === estudiante.id)) {
            this.estudiantesSeleccionados.push(estudiante);
            this.filtrarEstudiantes();
            console.log(`✅ Estudiante "${estudiante.nombre}" agregado al curso`);
        }
    }

    public eliminarEstudiante(estudiante: Usuario): void {
        this.estudiantesSeleccionados = this.estudiantesSeleccionados.filter(
            e => e.id !== estudiante.id
        );
        this.filtrarEstudiantes();
        console.log(`✅ Estudiante "${estudiante.nombre}" eliminado del curso`);
    }

    public limpiarSeleccion(): void {
        this.estudiantesSeleccionados = [];
        this.filtrarEstudiantes();
        console.log('✅ Se eliminaron todos los estudiantes seleccionados');
    }

    // ========================================================================
    // MÉTODOS PARA CATEGORÍAS
    // ========================================================================

    public toggleCategoria(categoria: string): void {
        const index = this.selectedCategorias.indexOf(categoria);
        if (index > -1) {
            this.selectedCategorias.splice(index, 1);
        } else {
            this.selectedCategorias.push(categoria);
        }
        this.notifyListeners();
    }

    // ========================================================================
    // MÉTODO PRINCIPAL PARA CREAR CURSO
    // ========================================================================

    public async crearCurso(
        onSuccess: (message: string) => void,
        onError: (message: string) => void
    ): Promise<boolean> {
        console.log('🔐 === INICIANDO CREACIÓN DE CURSO ===');

        try {
            this.isLoading = true;
            this.notifyListeners();

            // Validaciones
            if (!this.nombreCurso.trim()) {
                onError('El nombre del curso es obligatorio');
                return false;
            }

            if (!this.descripcion.trim()) {
                onError('La descripción es obligatoria');
                return false;
            }

            if (!this.codigoRegistro.trim()) {
                onError('El código de registro es obligatorio');
                return false;
            }

            const currentUser = this.authController.currentUser;
            if (!currentUser?.id) {
                onError('Usuario no autenticado');
                return false;
            }

            console.log('📝 Datos del curso:');
            console.log('  - Nombre:', this.nombreCurso);
            console.log('  - Código:', this.codigoRegistro);
            console.log('  - Profesor ID:', currentUser.id);
            console.log('  - Estudiantes seleccionados:', this.estudiantesSeleccionados.length);

            // Crear curso
            const estudiantesNombres = this.estudiantesSeleccionados.map(e => e.nombre);

            const cursoId = await this.cursoUseCase.createCurso({
                nombre: this.nombreCurso.trim(),
                descripcion: this.descripcion.trim(),
                profesorId: currentUser.id,
                codigoRegistro: this.codigoRegistro.trim(),
                categorias: this.selectedCategorias,
                estudiantesNombres: estudiantesNombres,
            });

            console.log('✅ Curso creado con ID:', cursoId);

            // Limpiar formulario
            this.nombreCurso = '';
            this.descripcion = '';
            this.codigoRegistro = '';
            this.selectedCategorias = [];
            this.estudiantesSeleccionados = [];
            this.notifyListeners();

            onSuccess('Curso creado exitosamente');
            return true;
        } catch (e) {
            console.log('❌ Error creando curso:', e);
            onError(String(e));
            return false;
        } finally {
            this.isLoading = false;
            this.notifyListeners();
        }
    }

    // Método para generar código aleatorio
    public generarCodigoAleatorio(): string {
        const timestamp = Date.now().toString().substring(7);
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `CURSO${timestamp}${randomPart}`;
    }
}

export default NewCourseController;
