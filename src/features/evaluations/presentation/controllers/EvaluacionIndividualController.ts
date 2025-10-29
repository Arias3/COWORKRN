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

  // ===================================================================
  // MÉTODOS ADICIONALES (de Flutter)
  // ===================================================================

  /**
   * Verifica si un evaluador puede evaluar a un evaluado en un periodo específico
   * Incluye validación de auto-evaluación según configuración del periodo
   */
  async puedeEvaluar(
    evaluadorId: string,
    evaluadoId: string,
    evaluacionPeriodoId: string
  ): Promise<boolean> {
    try {
      console.log('🔍 [EVAL-CONTROLLER] Verificando si puede evaluar...');
      console.log(`   - Evaluador: ${evaluadorId}`);
      console.log(`   - Evaluado: ${evaluadoId}`);
      console.log(`   - Periodo: ${evaluacionPeriodoId}`);

      // Verificar si el repository tiene este método
      if (typeof (this.repository as any).puedeEvaluar === 'function') {
        return await (this.repository as any).puedeEvaluar(
          evaluadorId,
          evaluadoId,
          evaluacionPeriodoId
        );
      }

      // Fallback: verificar básicamente
      // No permitir auto-evaluación por defecto (esto debería venir del periodo)
      if (evaluadorId === evaluadoId) {
        console.log('⚠️ [EVAL-CONTROLLER] Auto-evaluación no permitida por defecto');
        return false;
      }

      // Verificar si ya existe evaluación completada
      const evaluacionExistente = await this.repository.getEvaluacionEspecifica(
        evaluacionPeriodoId,
        evaluadorId,
        evaluadoId
      );

      if (evaluacionExistente && evaluacionExistente.completada) {
        console.log('⚠️ [EVAL-CONTROLLER] Ya existe evaluación completada');
        return false;
      }

      console.log('✅ [EVAL-CONTROLLER] Puede evaluar');
      return true;
    } catch (e) {
      console.error('❌ Error verificando si puede evaluar:', e);
      return false;
    }
  }

  /**
   * Obtiene las evaluaciones realizadas por un evaluador
   */
  async getEvaluacionesRealizadas(
    evaluadorId: string,
    evaluacionPeriodoId?: string
  ): Promise<EvaluacionIndividual[]> {
    try {
      const evaluaciones = await this.repository.getEvaluacionesPorEvaluador(evaluadorId);

      if (evaluacionPeriodoId) {
        return evaluaciones.filter(e => e.evaluacionPeriodoId === evaluacionPeriodoId);
      }

      return evaluaciones;
    } catch (e) {
      console.error('Error obteniendo evaluaciones realizadas:', e);
      return [];
    }
  }

  /**
   * Obtiene las evaluaciones recibidas por un evaluado
   */
  async getEvaluacionesRecibidas(
    evaluadoId: string,
    evaluacionPeriodoId?: string
  ): Promise<EvaluacionIndividual[]> {
    try {
      const evaluaciones = await this.repository.getEvaluacionesPorEvaluado(evaluadoId);

      if (evaluacionPeriodoId) {
        return evaluaciones.filter(e => e.evaluacionPeriodoId === evaluacionPeriodoId);
      }

      return evaluaciones;
    } catch (e) {
      console.error('Error obteniendo evaluaciones recibidas:', e);
      return [];
    }
  }

  /**
   * Obtiene las estadísticas generales de evaluaciones para un periodo
   */
  async getEstadisticasEvaluaciones(
    evaluacionPeriodoId: string
  ): Promise<Record<string, any> | null> {
    try {
      // Verificar si el repository tiene este método
      if (typeof (this.repository as any).getEstadisticasEvaluaciones === 'function') {
        return await (this.repository as any).getEstadisticasEvaluaciones(evaluacionPeriodoId);
      }

      // Fallback: calcular estadísticas básicas
      const evaluaciones = await this.repository.getEvaluacionesPorPeriodo(evaluacionPeriodoId);

      const completadas = evaluaciones.filter(e => e.completada).length;
      const pendientes = evaluaciones.length - completadas;

      // Calcular promedios generales
      let sumaTotal = 0;
      let contadorTotal = 0;

      evaluaciones.forEach(e => {
        if (e.completada && e.calificaciones) {
          Object.values(e.calificaciones).forEach(cal => {
            sumaTotal += cal;
            contadorTotal++;
          });
        }
      });

      const promedioGeneral = contadorTotal > 0 ? sumaTotal / contadorTotal : 0;

      return {
        total: evaluaciones.length,
        completadas,
        pendientes,
        promedioGeneral: parseFloat(promedioGeneral.toFixed(2)),
      };
    } catch (e) {
      console.error('Error obteniendo estadísticas:', e);
      return null;
    }
  }

  /**
   * Obtiene el promedio de evaluaciones de un usuario
   */
  async getPromedioUsuario(
    evaluadoId: string,
    evaluacionPeriodoId: string
  ): Promise<Record<string, number> | null> {
    try {
      return await this.repository.getPromedioEvaluacionesPorUsuario(
        evaluadoId,
        evaluacionPeriodoId
      );
    } catch (e) {
      console.error('Error obteniendo promedio del usuario:', e);
      return null;
    }
  }

  /**
   * Obtiene la lista de usuarios que un evaluador aún no ha evaluado
   */
  async getUsuariosPendientesPorEvaluar(
    evaluadorId: string,
    evaluacionPeriodoId: string,
    posiblesEvaluados: string[]
  ): Promise<string[]> {
    try {
      // Obtener evaluaciones realizadas por el evaluador en este periodo
      const evaluacionesRealizadas = await this.getEvaluacionesRealizadas(
        evaluadorId,
        evaluacionPeriodoId
      );

      // Filtrar solo las completadas
      const evaluadosCompletados = evaluacionesRealizadas
        .filter(e => e.completada)
        .map(e => e.evaluadoId);

      // Retornar los que no han sido evaluados
      return posiblesEvaluados.filter(id => !evaluadosCompletados.includes(id));
    } catch (e) {
      console.error('Error obteniendo usuarios pendientes:', e);
      return [];
    }
  }

  /**
   * Genera evaluaciones automáticamente para un periodo y equipo
   */
  async generarEvaluacionesParaPeriodo(params: {
    evaluacionPeriodoId: string;
    equipoId: string;
    miembrosEquipo: string[];
  }): Promise<EvaluacionIndividual[]> {
    try {
      this._isLoading = true;
      this.notify();

      console.log('🔄 [EVAL-CONTROLLER] Iniciando generación de evaluaciones');
      console.log(`   - Periodo: ${params.evaluacionPeriodoId}`);
      console.log(`   - Equipo: ${params.equipoId}`);
      console.log(`   - Miembros: ${params.miembrosEquipo.length}`);

      const evaluacionesGeneradas: EvaluacionIndividual[] = [];

      // Generar evaluaciones para cada par de evaluador-evaluado
      for (const evaluadorId of params.miembrosEquipo) {
        for (const evaluadoId of params.miembrosEquipo) {
          // Verificar si puede evaluar (esto incluye auto-evaluación)
          const puede = await this.puedeEvaluar(
            evaluadorId,
            evaluadoId,
            params.evaluacionPeriodoId
          );

          if (puede) {
            // Verificar si ya existe
            const existe = await this.repository.getEvaluacionEspecifica(
              params.evaluacionPeriodoId,
              evaluadorId,
              evaluadoId
            );

            if (!existe) {
              // Crear evaluación en blanco
              const nuevaEvaluacion = new EvaluacionIndividual({
                id: '', // Será generado por el repository
                evaluacionPeriodoId: params.evaluacionPeriodoId,
                evaluadorId,
                evaluadoId,
                equipoId: params.equipoId,
                calificaciones: {},
                completada: false,
                fechaCreacion: new Date(),
              });

              const creada = await this.repository.crearEvaluacion(nuevaEvaluacion);
              evaluacionesGeneradas.push(creada);
            }
          }
        }
      }

      // Actualizar cache local
      if (evaluacionesGeneradas.length > 0) {
        const evaluacionesExistentes =
          this._evaluacionesPorPeriodo.get(params.evaluacionPeriodoId) || [];
        this._evaluacionesPorPeriodo.set(params.evaluacionPeriodoId, [
          ...evaluacionesExistentes,
          ...evaluacionesGeneradas,
        ]);
      }

      console.log(`✅ [EVAL-CONTROLLER] Generadas ${evaluacionesGeneradas.length} evaluaciones`);
      return evaluacionesGeneradas;
    } catch (e) {
      console.error('❌ Error generando evaluaciones:', e);
      return [];
    } finally {
      this._isLoading = false;
      this.notify();
    }
  }

  /**
   * Limpia todo el cache del controller
   */
  limpiarCache(): void {
    this._evaluacionesPorPeriodo.clear();
    this._evaluacionesPorEvaluador.clear();
    this._evaluacionesPorEvaluado.clear();
    this._evaluacionActual = null;
    this.limpiarCalificacionesTemporales();
    this.notify();
  }

  /**
   * Getters de conveniencia para acceso local
   */
  getEvaluacionesPorPeriodoLocal(evaluacionPeriodoId: string): EvaluacionIndividual[] {
    return this._evaluacionesPorPeriodo.get(evaluacionPeriodoId) || [];
  }

  getEvaluacionesPorEvaluadorLocal(evaluadorId: string): EvaluacionIndividual[] {
    return this._evaluacionesPorEvaluador.get(evaluadorId) || [];
  }

  getEvaluacionesPorEvaluadoLocal(evaluadoId: string): EvaluacionIndividual[] {
    return this._evaluacionesPorEvaluado.get(evaluadoId) || [];
  }

  getCalificacionTemporal(criterio: string): number | undefined {
    return this._calificacionesTemporales[criterio];
  }

  get tieneCalificacionesTemporales(): boolean {
    return Object.keys(this._calificacionesTemporales).length > 0;
  }

  get puedeCompletar(): boolean {
    return this.tieneCalificacionesTemporales;
  }
}

export default EvaluacionIndividualController;
