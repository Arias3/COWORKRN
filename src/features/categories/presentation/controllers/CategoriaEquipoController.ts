/**
 * CategoriaEquipoController
 * 
 * Main controller for managing team categories and teams.
 * Handles CRUD operations, team generation, and student management.
 */

import CursoDomain from '../../../home/domain/entities/CursoEntity';
import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { Equipo } from '../../domain/entities/EquipoEntity';
import { TipoAsignacion } from '../../domain/entities/TipoAsignacion';
import { ICategoriaEquipoRepository } from '../../domain/repositories/CategoriaEquipoRepository';
import { IEquipoRepository } from '../../domain/repositories/EquipoRepository';

export class CategoriaEquipoController {
  private categoriaRepository: ICategoriaEquipoRepository;
  private equipoRepository: IEquipoRepository;

  // UI States
  public categorias: CategoriaEquipo[] = [];
  public equipos: Equipo[] = [];
  public equiposDisponibles: Equipo[] = [];
  public miEquipo: Equipo | null = null;
  public isLoading: boolean = false;
  public isLoadingEquipos: boolean = false;
  public isRemovingStudent: boolean = false;
  public error: string | null = null;

  // Current data
  public cursoActual: CursoDomain | null = null;
  public categoriaSeleccionada: CategoriaEquipo | null = null;
  public currentUserId: number | null = null;

  // Form data
  public nombreCategoria: string = '';
  public nombreEquipo: string = '';
  public tipoAsignacionSeleccionado: TipoAsignacion = TipoAsignacion.MANUAL;
  public maxEstudiantesPorEquipo: number = 4;
  public selectedTab: number = 0;

  // Cache for optimization
  private categoriasCache: Map<string, CategoriaEquipo[]> = new Map();
  private equiposCache: Map<number, Equipo[]> = new Map();
  private lastCacheUpdate: Date | null = null;

  private listeners: Set<() => void> = new Set();

  constructor(
    categoriaRepository: ICategoriaEquipoRepository,
    equipoRepository: IEquipoRepository,
    currentUserId: number
  ) {
    this.categoriaRepository = categoriaRepository;
    this.equipoRepository = equipoRepository;
    this.currentUserId = currentUserId;
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
  // CACHE MANAGEMENT
  // ===================================================================

  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) return false;
    const now = new Date();
    const timeDifference = (now.getTime() - this.lastCacheUpdate.getTime()) / 1000 / 60;
    return timeDifference < 5; // Cache valid for 5 minutes
  }

  private updateCacheTimestamp(): void {
    this.lastCacheUpdate = new Date();
  }

  private clearCache(): void {
    this.categoriasCache.clear();
    this.equiposCache.clear();
    this.lastCacheUpdate = null;
  }

  public async refreshData(): Promise<void> {
    this.clearCache();
    if (this.cursoActual) {
      await this.loadCategoriasPorCurso(this.cursoActual);
    }
  }

  // ===================================================================
  // PERMISSIONS
  // ===================================================================

  public esProfesorDelCurso(curso: CursoDomain): boolean {
    if (!this.currentUserId) return false;
    return this.currentUserId === curso.profesorId;
  }

  public get esProfesorDelCursoActual(): boolean {
    if (!this.cursoActual) return false;
    return this.esProfesorDelCurso(this.cursoActual);
  }

  // ===================================================================
  // CATEGORIA MANAGEMENT
  // ===================================================================

  public async loadCategoriasPorCurso(curso: CursoDomain): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.cursoActual = curso;
      this.notifyListeners();

      // Check cache first
      const cacheKey = curso.id.toString();
      if (this.isCacheValid() && this.categoriasCache.has(cacheKey)) {
        console.log(`📦 Usando categorías desde caché para curso: ${curso.nombre}`);
        this.categorias = this.categoriasCache.get(cacheKey)!;

        if (this.categorias.length > 0) {
          if (this.categoriaSeleccionada) {
            const categoriaExistente = this.categorias.find(
              cat => cat.id === this.categoriaSeleccionada!.id
            );
            if (categoriaExistente) {
              await this.selectCategoria(categoriaExistente);
              return;
            }
          }
          await this.selectCategoria(this.categorias[0]);
        }
        this.isLoading = false;
        this.notifyListeners();
        return;
      }

      // Load from API if no valid cache
      console.log(`🌐 Cargando categorías desde API para curso: ${curso.nombre}`);
      const categoriasList = await this.categoriaRepository.getCategoriasPorCurso(curso.id);

      // Update cache
      this.categoriasCache.set(cacheKey, categoriasList);
      this.updateCacheTimestamp();

      this.categorias = categoriasList;

      if (categoriasList.length > 0) {
        await this.selectCategoria(categoriasList[0]);
      }

      this.isLoading = false;
      this.notifyListeners();
    } catch (e) {
      this.isLoading = false;
      this.error = `Error al cargar categorías: ${e}`;
      this.notifyListeners();
      console.error('❌ Error cargando categorías:', e);
    }
  }

  public async selectCategoria(categoria: CategoriaEquipo): Promise<void> {
    try {
      this.categoriaSeleccionada = categoria;
      this.notifyListeners();
      await this.loadEquiposPorCategoria(categoria.id!);
    } catch (e) {
      this.error = `Error al seleccionar categoría: ${e}`;
      this.notifyListeners();
      console.error('❌ Error seleccionando categoría:', e);
    }
  }

  public async createCategoria(
    nombre: string,
    descripcion: string,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      if (!this.cursoActual) {
        onError('No hay curso seleccionado');
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.notifyListeners();

      const nuevaCategoria = new CategoriaEquipo({
        nombre,
        cursoId: this.cursoActual.id,
        tipoAsignacion: this.tipoAsignacionSeleccionado,
        maxEstudiantesPorEquipo: this.maxEstudiantesPorEquipo,
        descripcion,
      });

      await this.categoriaRepository.createCategoria(nuevaCategoria);
      await this.refreshData();

      this.isLoading = false;
      this.notifyListeners();
      onSuccess();
      console.log('✅ Categoría creada exitosamente');
    } catch (e) {
      this.isLoading = false;
      this.error = 'No se pudo crear la categoría';
      this.notifyListeners();
      onError(this.error);
      console.error('❌ Error creando categoría:', e);
    }
  }

  public async deleteCategoria(
    id: number,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.notifyListeners();

      await this.categoriaRepository.deleteCategoria(id);
      await this.refreshData();

      this.isLoading = false;
      this.notifyListeners();
      onSuccess();
      console.log('✅ Categoría eliminada exitosamente');
    } catch (e) {
      this.isLoading = false;
      this.error = 'No se pudo eliminar la categoría';
      this.notifyListeners();
      onError(this.error);
      console.error('❌ Error eliminando categoría:', e);
    }
  }

  // ===================================================================
  // EQUIPO MANAGEMENT
  // ===================================================================

  public async loadEquiposPorCategoria(categoriaId: number): Promise<void> {
    try {
      this.isLoadingEquipos = true;
      this.error = null;
      this.notifyListeners();

      // Check cache
      if (this.isCacheValid() && this.equiposCache.has(categoriaId)) {
        console.log(`📦 Usando equipos desde caché para categoría: ${categoriaId}`);
        this.equipos = this.equiposCache.get(categoriaId)!;
        this.updateEquiposDisponibles();
        this.isLoadingEquipos = false;
        this.notifyListeners();
        return;
      }

      // Load from API
      const equiposList = await this.equipoRepository.getEquiposPorCategoria(categoriaId);

      // Update cache
      this.equiposCache.set(categoriaId, equiposList);
      this.updateCacheTimestamp();

      this.equipos = equiposList;
      this.updateEquiposDisponibles();

      this.isLoadingEquipos = false;
      this.notifyListeners();
    } catch (e) {
      this.isLoadingEquipos = false;
      this.error = `Error al cargar equipos: ${e}`;
      this.notifyListeners();
      console.error('❌ Error cargando equipos:', e);
    }
  }

  private updateEquiposDisponibles(): void {
    if (!this.currentUserId) {
      this.equiposDisponibles = this.equipos;
      return;
    }

    // Find user's team
    this.miEquipo = this.equipos.find(equipo =>
      equipo.estudiantesIds.includes(this.currentUserId!)
    ) || null;

    // Available teams are those that aren't full
    if (this.categoriaSeleccionada) {
      this.equiposDisponibles = this.equipos.filter(equipo =>
        equipo.estudiantesIds.length < this.categoriaSeleccionada!.maxEstudiantesPorEquipo
      );
    }
  }

  public async createEquipo(
    nombre: string,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      if (!this.categoriaSeleccionada) {
        onError('No hay categoría seleccionada');
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.notifyListeners();

      const nuevoEquipo = new Equipo({
        nombre,
        categoriaId: this.categoriaSeleccionada.id!,
      });

      await this.equipoRepository.createEquipo(nuevoEquipo);
      await this.loadEquiposPorCategoria(this.categoriaSeleccionada.id!);

      this.isLoading = false;
      this.notifyListeners();
      onSuccess();
      console.log('✅ Equipo creado exitosamente');
    } catch (e) {
      this.isLoading = false;
      this.error = 'No se pudo crear el equipo';
      this.notifyListeners();
      onError(this.error);
      console.error('❌ Error creando equipo:', e);
    }
  }

  public async deleteEquipo(
    id: number,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.notifyListeners();

      await this.equipoRepository.deleteEquipo(id);

      if (this.categoriaSeleccionada) {
        await this.loadEquiposPorCategoria(this.categoriaSeleccionada.id!);
      }

      this.isLoading = false;
      this.notifyListeners();
      onSuccess();
      console.log('✅ Equipo eliminado exitosamente');
    } catch (e) {
      this.isLoading = false;
      this.error = 'No se pudo eliminar el equipo';
      this.notifyListeners();
      onError(this.error);
      console.error('❌ Error eliminando equipo:', e);
    }
  }

  // ===================================================================
  // STUDENT MANAGEMENT
  // ===================================================================

  public async addStudentToTeam(
    equipoId: number,
    estudianteId: number,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      const equipo = this.equipos.find(e => e.id === equipoId);
      if (!equipo) {
        onError('Equipo no encontrado');
        return;
      }

      // Check if team is full
      if (this.categoriaSeleccionada &&
        equipo.estudiantesIds.length >= this.categoriaSeleccionada.maxEstudiantesPorEquipo) {
        onError('El equipo está lleno');
        return;
      }

      // Add student
      const updatedEquipo = equipo.copyWith({
        estudiantesIds: [...equipo.estudiantesIds, estudianteId],
      });

      await this.equipoRepository.updateEquipo(updatedEquipo);

      if (this.categoriaSeleccionada) {
        await this.loadEquiposPorCategoria(this.categoriaSeleccionada.id!);
      }

      onSuccess();
      console.log('✅ Estudiante agregado al equipo');
    } catch (e) {
      onError('No se pudo agregar el estudiante');
      console.error('❌ Error agregando estudiante:', e);
    }
  }

  public async removeStudentFromTeam(
    equipoId: number,
    estudianteId: number,
    onSuccess: () => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      this.isRemovingStudent = true;
      this.notifyListeners();

      const equipo = this.equipos.find(e => e.id === equipoId);
      if (!equipo) {
        onError('Equipo no encontrado');
        return;
      }

      // Remove student
      const updatedEquipo = equipo.copyWith({
        estudiantesIds: equipo.estudiantesIds.filter(id => id !== estudianteId),
      });

      await this.equipoRepository.updateEquipo(updatedEquipo);

      if (this.categoriaSeleccionada) {
        await this.loadEquiposPorCategoria(this.categoriaSeleccionada.id!);
      }

      this.isRemovingStudent = false;
      this.notifyListeners();
      onSuccess();
      console.log('✅ Estudiante removido del equipo');
    } catch (e) {
      this.isRemovingStudent = false;
      this.notifyListeners();
      onError('No se pudo remover el estudiante');
      console.error('❌ Error removiendo estudiante:', e);
    }
  }

  // ===================================================================
  // UTILITIES
  // ===================================================================

  public changeTab(index: number): void {
    this.selectedTab = index;
    this.notifyListeners();
  }

  public clearError(): void {
    this.error = null;
    this.notifyListeners();
  }

  public resetForm(): void {
    this.nombreCategoria = '';
    this.nombreEquipo = '';
    this.tipoAsignacionSeleccionado = TipoAsignacion.MANUAL;
    this.maxEstudiantesPorEquipo = 4;
    this.notifyListeners();
  }
}

export default CategoriaEquipoController;
