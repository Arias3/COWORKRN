/**
 * EditarEstudiantesCategoriaController
 * 
 * Controller for editing team student assignments.
 * Handles student management, team composition, and change tracking.
 */

import { Usuario } from '../../../auth/domain/entities/UserEntity';
import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { Equipo } from '../../domain/entities/EquipoEntity';
import { CategoriaEquipoUseCase } from '../../domain/usecases/CategoriaEquipoUseCase';

export class EditarEstudiantesCategoriaController {
    private categoriaEquipoUseCase: CategoriaEquipoUseCase;

    // Observable States
    public categoria: CategoriaEquipo | null = null;
    public equipos: Equipo[] = [];
    public todosLosEstudiantes: Usuario[] = [];
    public estudiantesSinEquipo: Usuario[] = [];
    public estudiantesPorEquipo: Map<string, Usuario[]> = new Map();

    public isLoading: boolean = false;
    public isGuardando: boolean = false;
    public hayChangiosPendientes: boolean = false;

    // UI update counter for forcing React re-renders
    public uiUpdateCounter: number = 0;

    // Change tracking
    private cambiosPendientes: Map<string, string[]> = new Map();
    private equiposAEliminar: string[] = [];

    private listeners: Set<() => void> = new Set();

    constructor(categoriaEquipoUseCase: CategoriaEquipoUseCase) {
        this.categoriaEquipoUseCase = categoriaEquipoUseCase;
    }

    // ===================================================================
    // OBSERVER PATTERN
    // ===================================================================

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    // ===================================================================
    // COMPUTED PROPERTIES
    // ===================================================================

    public get totalEstudiantes(): number {
        return this.todosLosEstudiantes.length;
    }

    // ===================================================================
    // INITIALIZATION
    // ===================================================================

    public async inicializar(categoria: CategoriaEquipo): Promise<void> {
        try {
            console.log('📝 [EditarEstudiantesController] Inicializando con categoría:', categoria.nombre);
            this.isLoading = true;
            this.notifyListeners();

            this.categoria = categoria;
            await this.cargarDatos();
        } catch (e) {
            console.error('❌ [EditarEstudiantesController] Error al cargar datos:', e);
            throw e;
        } finally {
            this.isLoading = false;
            this.notifyListeners();
        }
    }

    private async cargarDatos(): Promise<void> {
        if (!this.categoria) return;

        console.log('🔍 [EditarEstudiantesController] Cargando equipos y estudiantes...');

        // Load teams from category
        this.equipos = await this.categoriaEquipoUseCase.getEquiposPorCategoria(this.categoria.id!);
        console.log(`✅ [EditarEstudiantesController] ${this.equipos.length} equipos cargados`);

        // Load all students from course
        this.todosLosEstudiantes = await this.categoriaEquipoUseCase.getEstudiantesDelCurso(this.categoria.cursoId);
        console.log(`✅ [EditarEstudiantesController] ${this.todosLosEstudiantes.length} estudiantes cargados`);

        // Organize students by team
        await this.organizarEstudiantesPorEquipo();
    }

    private async organizarEstudiantesPorEquipo(): Promise<void> {
        console.log('🔄 [EditarEstudiantesController] Organizando estudiantes por equipo...');

        this.estudiantesPorEquipo.clear();
        this.estudiantesSinEquipo = [];

        // Initialize empty lists for each team
        for (const equipo of this.equipos) {
            this.estudiantesPorEquipo.set(equipo.id!.toString(), []);
        }

        // Temporary list for students without team
        let sinEquipo = [...this.todosLosEstudiantes];

        // Assign students to their teams
        for (const equipo of this.equipos) {
            for (const estudianteId of equipo.estudiantesIds) {
                const estudiante = this.todosLosEstudiantes.find(
                    est => est.id === estudianteId
                );
                if (estudiante) {
                    this.estudiantesPorEquipo.get(equipo.id!.toString())?.push(estudiante);
                    sinEquipo = sinEquipo.filter(est => est.id !== estudianteId);
                }
            }
        }

        this.estudiantesSinEquipo = sinEquipo;

        console.log(`✅ [EditarEstudiantesController] ${this.estudiantesSinEquipo.length} estudiantes sin equipo`);
        this.forceUIUpdate();
    }

    public async recargarDatos(): Promise<void> {
        if (this.categoria) {
            await this.cargarDatos();
        }
    }

    // ===================================================================
    // STUDENT MANAGEMENT
    // ===================================================================

    public agregarEstudianteAEquipo(estudiante: Usuario, equipo: Equipo): void {
        console.log(`➕ [EditarEstudiantesController] Agregando ${estudiante.nombre} a ${equipo.nombre}`);

        // Verify limit
        const currentCount = this.estudiantesPorEquipo.get(equipo.id!.toString())?.length ?? 0;
        if (currentCount >= this.categoria!.maxEstudiantesPorEquipo) {
            throw new Error('Este equipo ya tiene el máximo de estudiantes');
        }

        // Verify student is not already in team
        if (this.estaEnEquipo(estudiante.id!, equipo.id!.toString())) {
            throw new Error('El estudiante ya está en este equipo');
        }

        // Add to team
        const equipoEstudiantes = this.estudiantesPorEquipo.get(equipo.id!.toString()) ?? [];
        this.estudiantesPorEquipo.set(equipo.id!.toString(), [...equipoEstudiantes, estudiante]);

        // Remove from students without team
        this.estudiantesSinEquipo = this.estudiantesSinEquipo.filter(est => est.id !== estudiante.id);

        // Force UI update
        this.forceUIUpdate();

        // Register change
        this.registrarCambio(equipo.id!.toString(), estudiante.id!);
        this.hayChangiosPendientes = true;
        this.notifyListeners();

        console.log(`✅ [EditarEstudiantesController] ${estudiante.nombre} agregado a ${equipo.nombre}`);
    }

    public moverEstudianteEntreEquipos(
        estudiante: Usuario,
        equipoOrigen: Equipo,
        equipoDestino: Equipo
    ): void {
        console.log(`🔄 [EditarEstudiantesController] Moviendo ${estudiante.nombre} de ${equipoOrigen.nombre} a ${equipoDestino.nombre}`);

        // Verify destination team limit
        const currentCount = this.estudiantesPorEquipo.get(equipoDestino.id!.toString())?.length ?? 0;
        if (currentCount >= this.categoria!.maxEstudiantesPorEquipo) {
            throw new Error('El equipo destino ya tiene el máximo de estudiantes');
        }

        // Remove from origin team
        const origenEstudiantes = this.estudiantesPorEquipo.get(equipoOrigen.id!.toString()) ?? [];
        this.estudiantesPorEquipo.set(
            equipoOrigen.id!.toString(),
            origenEstudiantes.filter(est => est.id !== estudiante.id)
        );

        // Add to destination team
        const destinoEstudiantes = this.estudiantesPorEquipo.get(equipoDestino.id!.toString()) ?? [];
        this.estudiantesPorEquipo.set(equipoDestino.id!.toString(), [...destinoEstudiantes, estudiante]);

        // Force UI update
        this.forceUIUpdate();

        // Register changes
        this.registrarCambio(equipoOrigen.id!.toString(), null); // Remove from origin
        this.registrarCambio(equipoDestino.id!.toString(), estudiante.id!); // Add to destination
        this.hayChangiosPendientes = true;
        this.notifyListeners();

        console.log(`✅ [EditarEstudiantesController] Estudiante movido exitosamente`);
    }

    public eliminarEstudianteDeEquipo(estudiante: Usuario, equipo: Equipo): void {
        console.log(`➖ [EditarEstudiantesController] Eliminando ${estudiante.nombre} de ${equipo.nombre}`);

        // Remove from team
        const equipoEstudiantes = this.estudiantesPorEquipo.get(equipo.id!.toString()) ?? [];
        this.estudiantesPorEquipo.set(
            equipo.id!.toString(),
            equipoEstudiantes.filter(est => est.id !== estudiante.id)
        );

        // Add to students without team
        this.estudiantesSinEquipo = [...this.estudiantesSinEquipo, estudiante];

        // Force UI update
        this.forceUIUpdate();

        // Register change
        this.registrarCambio(equipo.id!.toString(), null); // null indicates recalculate entire team
        this.hayChangiosPendientes = true;
        this.notifyListeners();

        console.log(`✅ [EditarEstudiantesController] ${estudiante.nombre} removido de ${equipo.nombre}`);
    }

    public eliminarEquipo(equipo: Equipo): void {
        console.log(`🗑️ [EditarEstudiantesController] Eliminando equipo ${equipo.nombre}`);

        // Move students to list without team
        const estudiantesDelEquipo = this.estudiantesPorEquipo.get(equipo.id!.toString()) ?? [];
        for (const estudiante of estudiantesDelEquipo) {
            if (!this.estudiantesSinEquipo.find(est => est.id === estudiante.id)) {
                this.estudiantesSinEquipo.push(estudiante);
            }
        }

        // Remove team locally
        this.equipos = this.equipos.filter(eq => eq.id !== equipo.id);
        this.estudiantesPorEquipo.delete(equipo.id!.toString());

        // Force observable update
        this.forceUIUpdate();

        // Register team for deletion
        this.equiposAEliminar.push(equipo.id!.toString());
        this.hayChangiosPendientes = true;
        this.notifyListeners();

        console.log(`✅ [EditarEstudiantesController] Equipo "${equipo.nombre}" marcado para eliminación`);
    }

    // ===================================================================
    // SAVE / DISCARD CHANGES
    // ===================================================================

    public async guardarCambios(): Promise<void> {
        if (!this.hayChangiosPendientes) return;

        try {
            console.log('💾 [EditarEstudiantesController] Guardando cambios...');
            this.isGuardando = true;
            this.notifyListeners();

            // Delete teams marked for deletion
            for (const equipoId of this.equiposAEliminar) {
                await this.categoriaEquipoUseCase.deleteEquipo(parseInt(equipoId));
                console.log(`✅ Equipo ${equipoId} eliminado`);
            }

            // Update teams with new students
            for (const [equipoId, _] of this.cambiosPendientes) {
                if (!this.equiposAEliminar.includes(equipoId)) {
                    const equipo = this.equipos.find(eq => eq.id!.toString() === equipoId);
                    if (equipo) {
                        const estudiantesIds = (this.estudiantesPorEquipo.get(equipoId) ?? [])
                            .map(est => est.id!);

                        // Update team with new student IDs
                        const equipoActualizado = equipo.copyWith({ estudiantesIds });
                        await this.categoriaEquipoUseCase.updateEquipo(equipoActualizado);
                        console.log(`✅ Equipo ${equipoId} actualizado con ${estudiantesIds.length} estudiantes`);
                    }
                }
            }

            // Clear pending changes
            this.cambiosPendientes.clear();
            this.equiposAEliminar = [];
            this.hayChangiosPendientes = false;

            console.log('✅ [EditarEstudiantesController] Todos los cambios guardados exitosamente');

            // Reload data to ensure consistency
            await this.recargarDatos();

            this.notifyListeners();
        } catch (e) {
            console.error('❌ [EditarEstudiantesController] Error al guardar:', e);
            throw e;
        } finally {
            this.isGuardando = false;
            this.notifyListeners();
        }
    }

    public async descartarCambios(): Promise<void> {
        console.log('🔙 [EditarEstudiantesController] Descartando cambios...');

        // Reload original data
        await this.recargarDatos();

        // Clear pending changes
        this.cambiosPendientes.clear();
        this.equiposAEliminar = [];
        this.hayChangiosPendientes = false;

        this.notifyListeners();

        console.log('✅ [EditarEstudiantesController] Cambios descartados, datos restaurados');
    }

    // ===================================================================
    // HELPERS
    // ===================================================================

    public estaEnEquipo(estudianteId: number, equipoId: string): boolean {
        const estudiantes = this.estudiantesPorEquipo.get(equipoId) ?? [];
        return estudiantes.some(est => est.id === estudianteId);
    }

    private registrarCambio(equipoId: string, estudianteId: number | null): void {
        if (!this.cambiosPendientes.has(equipoId)) {
            this.cambiosPendientes.set(equipoId, []);
        }

        if (estudianteId !== null) {
            const cambios = this.cambiosPendientes.get(equipoId)!;
            const estudianteIdStr = estudianteId.toString();
            if (!cambios.includes(estudianteIdStr)) {
                cambios.push(estudianteIdStr);
            }
        } else {
            // If estudianteId is null, recalculate entire team
            const estudiantesIds = (this.estudiantesPorEquipo.get(equipoId) ?? [])
                .map(est => est.id!.toString());
            this.cambiosPendientes.set(equipoId, estudiantesIds);
        }
    }

    public forceUIUpdate(): void {
        this.uiUpdateCounter++;
        this.notifyListeners();
    }
}

export default EditarEstudiantesCategoriaController;
