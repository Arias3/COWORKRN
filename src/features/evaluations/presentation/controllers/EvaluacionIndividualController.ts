/**
 * EvaluacionIndividualController
 * 
 * Controller for managing individual evaluations with Observer pattern.
 */

import { EvaluacionIndividual } from '../../domain/entities/EvaluacionIndividual';
import { IEvaluacionIndividualRepository } from '../../domain/repositories/EvaluacionIndividualRepository';

type Observer = () => void;

export class EvaluacionIndividualController {
  private repository: IEvaluacionIndividualRepository;
  private observers: Observer[] = [];

  // State
  private _isLoading: boolean = false;
  private _isSaving: boolean = false;
  private _evaluacionesPorPeriodo: Map<string, EvaluacionIndividual[]> = new Map();
  private _evaluacionesPorEvaluador: Map<string, EvaluacionIndividual[]> = new Map();
  private _evaluacionesPorEvaluado: Map<string, EvaluacionIndividual[]> = new Map();
  private _evaluacionActual: EvaluacionIndividual | null = null;
  private _calificacionesTemporales: Record<string, number> = {};
  private _comentariosTemporales: string = '';

  constructor(repository: IEvaluacionIndividualRepository) {
    this.repository = repository;
  }

  // Observer pattern
  subscribe(observer: Observer): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  private notify(): void {
    this.observers.forEach((observer) => observer());
  }

  // Getters
  get isLoading(): boolean {
    return this._isLoading;
  }

  get isSaving(): boolean {
    return this._isSaving;
  }

  get evaluacionesPorPeriodo(): Map<string, EvaluacionIndividual[]> {
    return this._evaluacionesPorPeriodo;
  }

  get evaluacionesPorEvaluador(): Map<string, EvaluacionIndividual[]> {
    return this._evaluacionesPorEvaluador;
  }

  get evaluacionesPorEvaluado(): Map<string, EvaluacionIndividual[]> {
    return this._evaluacionesPorEvaluado;
  }

  get evaluacionActual(): EvaluacionIndividual | null {
    return this._evaluacionActual;
  }

  get calificacionesTemporales(): Record<string, number> {
    return this._calificacionesTemporales;
  }

  get comentariosTemporales(): string {
    return this._comentariosTemporales;
  }

  // Load methods
  async cargarEvaluacionesPorPeriodo(evaluacionPeriodoId: string): Promise<void> {
    try {
      this._isLoading = true;
      this.notify();

      const evaluaciones = await this.repository.getEvaluacionesPorPeriodo(evaluacionPeriodoId);
      this._evaluacionesPorPeriodo.set(evaluacionPeriodoId, evaluaciones);
    } catch (e) {
      console.error('Error cargando evaluaciones del período:', e);
      throw e;
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  async cargarEvaluacionesPorEvaluador(evaluadorId: string): Promise<void> {
    try {
      this._isLoading = true;
      this.notify();

      const evaluaciones = await this.repository.getEvaluacionesPorEvaluador(evaluadorId);
      this._evaluacionesPorEvaluador.set(evaluadorId, evaluaciones);
    } catch (e) {
      console.error('Error cargando evaluaciones del evaluador:', e);
      throw e;
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  async cargarEvaluacionesPorEvaluado(evaluadoId: string): Promise<void> {
    try {
      this._isLoading = true;
      this.notify();

      const evaluaciones = await this.repository.getEvaluacionesPorEvaluado(evaluadoId);
      this._evaluacionesPorEvaluado.set(evaluadoId, evaluaciones);
    } catch (e) {
      console.error('Error cargando evaluaciones del evaluado:', e);
      throw e;
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  async cargarEvaluacionEspecifica(
    evaluacionPeriodoId: string,
    evaluadorId: string,
    evaluadoId: string
  ): Promise<void> {
    try {
      this._isLoading = true;
      this.notify();

      const evaluacion = await this.repository.getEvaluacionEspecifica(
        evaluacionPeriodoId,
        evaluadorId,
        evaluadoId
      );
      this._evaluacionActual = evaluacion;

      // Load temporary ratings if evaluation exists
      if (evaluacion) {
        this._calificacionesTemporales = { ...evaluacion.calificaciones };
        this._comentariosTemporales = evaluacion.comentarios || '';
      } else {
        // Only clear if no temporary ratings already set
        if (Object.keys(this._calificacionesTemporales).length === 0) {
          this.limpiarCalificacionesTemporales();
        }
      }
    } catch (e) {
      console.error('Error cargando evaluación:', e);
      throw e;
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  // Evaluation methods
  async crearOActualizarEvaluacion(params: {
    evaluacionPeriodoId: string;
    evaluadorId: string;
    evaluadoId: string;
    equipoId: string;
    completar?: boolean;
  }): Promise<boolean> {
    try {
      console.log('🔄 [EVAL-CONTROLLER] Iniciando crearOActualizarEvaluacion');
      console.log('🔄 [EVAL-CONTROLLER] Parámetros:', params);

      this._isSaving = true;
      this.notify();

      let evaluacion: EvaluacionIndividual;

      console.log(`🔍 [EVAL-CONTROLLER] Evaluación actual: ${this._evaluacionActual?.id || 'null'}`);

      if (!this._evaluacionActual) {
        console.log('🔄 [EVAL-CONTROLLER] Creando nueva evaluación...');
        console.log(`🔍 [EVAL-CONTROLLER] Calificaciones temporales: ${JSON.stringify(this._calificacionesTemporales)}`);

        // Create new evaluation
        evaluacion = new EvaluacionIndividual({
          id: '', // Will be generated by repository
          evaluacionPeriodoId: params.evaluacionPeriodoId,
          evaluadorId: params.evaluadorId,
          evaluadoId: params.evaluadoId,
          equipoId: params.equipoId,
          calificaciones: { ...this._calificacionesTemporales },
          comentarios: this._comentariosTemporales || undefined,
          fechaCreacion: new Date(),
          completada: params.completar ?? false,
        });

        evaluacion = await this.repository.crearEvaluacion(evaluacion);
        console.log(`✅ [EVAL-CONTROLLER] Nueva evaluación creada: ${evaluacion.id}`);
      } else {
        console.log('🔄 [EVAL-CONTROLLER] Actualizando evaluación existente...');

        // Update existing evaluation
        evaluacion = this._evaluacionActual.copyWith({
          calificaciones: { ...this._calificacionesTemporales },
          comentarios: this._comentariosTemporales || undefined,
          completada: params.completar ?? this._evaluacionActual.completada,
          fechaActualizacion: new Date(),
        });

        evaluacion = await this.repository.actualizarEvaluacion(evaluacion);
        console.log(`✅ [EVAL-CONTROLLER] Evaluación actualizada: ${evaluacion.id}`);
      }

      this._evaluacionActual = evaluacion;

      // Reload lists
      await this.cargarEvaluacionesPorPeriodo(params.evaluacionPeriodoId);
      await this.cargarEvaluacionesPorEvaluador(params.evaluadorId);

      return true;
    } catch (e) {
      console.error('❌ [EVAL-CONTROLLER] Error en crearOActualizarEvaluacion:', e);
      return false;
    } finally {
      this._isSaving = false;
      this.notify();
    }
  }

  async eliminarEvaluacion(id: string): Promise<boolean> {
    try {
      this._isLoading = true;
      this.notify();

      const result = await this.repository.eliminarEvaluacion(id);
      if (result && this._evaluacionActual?.id === id) {
        this._evaluacionActual = null;
      }

      return result;
    } catch (e) {
      console.error('Error eliminando evaluación:', e);
      return false;
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  async getEvaluacionesCompletadas(evaluacionPeriodoId: string): Promise<EvaluacionIndividual[]> {
    try {
      return await this.repository.getEvaluacionesCompletadas(evaluacionPeriodoId);
    } catch (e) {
      console.error('Error obteniendo evaluaciones completadas:', e);
      return [];
    }
  }

  async getEvaluacionesPendientes(
    evaluadorId: string,
    evaluacionPeriodoId: string
  ): Promise<EvaluacionIndividual[]> {
    try {
      return await this.repository.getEvaluacionesPendientes(evaluadorId, evaluacionPeriodoId);
    } catch (e) {
      console.error('Error obteniendo evaluaciones pendientes:', e);
      return [];
    }
  }

  async getPromedioEvaluaciones(
    evaluadoId: string,
    evaluacionPeriodoId: string
  ): Promise<Record<string, number>> {
    try {
      return await this.repository.getPromedioEvaluacionesPorUsuario(evaluadoId, evaluacionPeriodoId);
    } catch (e) {
      console.error('Error calculando promedios:', e);
      return {};
    }
  }

  // Temporary state management
  setCalificacion(criterio: string, calificacion: number): void {
    this._calificacionesTemporales[criterio] = calificacion;
    this.notify();
  }

  setComentarios(comentarios: string): void {
    this._comentariosTemporales = comentarios;
    this.notify();
  }

  limpiarCalificacionesTemporales(): void {
    this._calificacionesTemporales = {};
    this._comentariosTemporales = '';
    this.notify();
  }

  limpiarEvaluacionActual(): void {
    this._evaluacionActual = null;
    this.limpiarCalificacionesTemporales();
    this.notify();
  }
}

export default EvaluacionIndividualController;
