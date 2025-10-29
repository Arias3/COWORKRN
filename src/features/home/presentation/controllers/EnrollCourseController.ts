import { RobleAuthLoginController } from '../../../auth/presentation/controllers/RobleAuthLoginController';
import CursoDomain from '../../domain/entities/CursoEntity';
import CursoUseCase from '../../domain/usecases/CursoUseCase';

/**
 * EnrollCourseController
 * 
 * Controller for enrolling in courses.
 * Manages course list and enrollment actions.
 */
export class EnrollCourseController {
    private cursoUseCase: CursoUseCase;
    private authController: RobleAuthLoginController;

    public cursos: CursoDomain[] = [];
    public isLoading: boolean = false;
    public seleccionado: number = -1;

    private listeners: Set<() => void> = new Set();

    constructor(
        cursoUseCase: CursoUseCase,
        authController: RobleAuthLoginController
    ) {
        this.cursoUseCase = cursoUseCase;
        this.authController = authController;
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
        await this.loadCursos();
    }

    public async loadCursos(): Promise<void> {
        try {
            this.isLoading = true;
            this.notifyListeners();

            const todosCursos = await this.cursoUseCase.getCursos();
            this.cursos = todosCursos;
        } catch (e) {
            console.log('❌ Error cargando cursos:', e);
        } finally {
            this.isLoading = false;
            this.notifyListeners();
        }
    }

    public seleccionar(index: number): void {
        this.seleccionado = index;
        this.notifyListeners();
    }

    public async inscribirseEnCursoSeleccionado(
        onSuccess: (message: string) => void,
        onError: (message: string) => void
    ): Promise<void> {
        if (this.seleccionado >= 0 && this.seleccionado < this.cursos.length) {
            const curso = this.cursos[this.seleccionado];

            try {
                const userId = this.authController.currentUser?.id;
                if (!userId) {
                    onError('Debes iniciar sesión para inscribirte');
                    return;
                }

                await this.cursoUseCase.inscribirseEnCurso(userId, curso.codigoRegistro);

                onSuccess(`Te has inscrito a "${curso.nombre}" exitosamente`);
            } catch (e) {
                onError('No se pudo completar la inscripción al curso');
                console.log('Error en inscripción:', e);
            }
        }
    }
}

export default EnrollCourseController;
