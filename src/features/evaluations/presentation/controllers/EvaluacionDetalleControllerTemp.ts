/**
 * EvaluacionDetalleControllerTemp
 * 
 * Controlador temporal para funcionalidades de detalle de evaluación.
 * Combina las capacidades de análisis y estadísticas detalladas.
 * Proporciona estadísticas generales, por estudiante, por equipo y por criterio.
 */

import { EvaluacionIndividual } from '../../domain/entities/EvaluacionIndividual';
import { IEvaluacionIndividualRepository } from '../../domain/repositories/EvaluacionIndividualRepository';

type Observer = () => void;

interface EstadisticasGenerales {
    total: number;
    completadas: number;
    pendientes: number;
    porcentajeCompletado: number;
    promedioGeneral: number;
}

interface EstadisticasEstudiante {
    promedio: number;
    totalEvaluaciones: number;
    evaluacionesRecibidas: number;
    porCriterio: Record<string, number>;
}

interface EstadisticasEquipo {
    promedio: number;
    totalEvaluaciones: number;
    miembrosEvaluados: Set<string>;
    porCriterio: Record<string, number>;
}

interface RankingItem {
    id: string;
    promedio: number;
    estadisticas: any;
}

export class EvaluacionDetalleControllerTemp {
    private repository: IEvaluacionIndividualRepository;
    private observers: Observer[] = [];

    // State
    private _isLoadingStats: boolean = false;
    private _estadisticas: EstadisticasGenerales | null = null;
    private _promediosEstudiantes: Map<string, number> = new Map();
    private _promediosEquipos: Map<string, number> = new Map();
    private _evaluacionesPorEstudiante: Map<string, EvaluacionIndividual[]> = new Map();
    private _evaluacionesPorEquipo: Map<string, EvaluacionIndividual[]> = new Map();
    private _promediosPorCriterio: Map<string, number> = new Map();

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
    get isLoadingStats(): boolean {
        return this._isLoadingStats;
    }

    get estadisticas(): EstadisticasGenerales | null {
        return this._estadisticas;
    }

    get promediosEstudiantes(): Map<string, number> {
        return new Map(this._promediosEstudiantes);
    }

    get promediosEquipos(): Map<string, number> {
        return new Map(this._promediosEquipos);
    }

    get evaluacionesPorEstudiante(): Map<string, EvaluacionIndividual[]> {
        return new Map(this._evaluacionesPorEstudiante);
    }

    get evaluacionesPorEquipo(): Map<string, EvaluacionIndividual[]> {
        return new Map(this._evaluacionesPorEquipo);
    }

    get promediosPorCriterio(): Map<string, number> {
        return new Map(this._promediosPorCriterio);
    }

    // ===================================================================
    // MÉTODOS PRINCIPALES
    // ===================================================================

    /**
     * Carga todas las estadísticas para un período específico
     */
    async cargarEstadisticasCompletas(periodoId: string): Promise<void> {
        try {
            this._isLoadingStats = true;
            this.notify();

            console.log('📊 [STATS] Cargando estadísticas para período:', periodoId);

            // Cargar evaluaciones individuales del período
            const evaluaciones = await this.repository.getEvaluacionesPorPeriodo(periodoId);
            console.log(`📊 [STATS] Evaluaciones encontradas: ${evaluaciones.length}`);

            // Calcular estadísticas generales
            await this.calcularEstadisticasGenerales(evaluaciones);

            // Calcular promedios por estudiante
            await this.calcularPromediosPorEstudiante(evaluaciones);

            // Calcular promedios por equipo
            await this.calcularPromediosPorEquipo(evaluaciones);

            // Calcular promedios por criterio
            await this.calcularPromediosPorCriterio(evaluaciones);

            console.log('✅ [STATS] Estadísticas cargadas correctamente');
        } catch (e) {
            console.error('❌ [STATS] Error cargando estadísticas:', e);
            throw e;
        } finally {
            this._isLoadingStats = false;
            this.notify();
        }
    }

    /**
     * Calcula estadísticas generales de la evaluación
     */
    private async calcularEstadisticasGenerales(
        evaluaciones: EvaluacionIndividual[]
    ): Promise<void> {
        const total = evaluaciones.length;
        const completadas = evaluaciones.filter((e) => e.completada).length;
        const pendientes = total - completadas;
        const porcentajeCompletado = total > 0 ? (completadas / total) * 100 : 0.0;

        // Calcular promedio general
        const evaluacionesCompletadas = evaluaciones.filter((e) => e.completada);
        let promedioGeneral = 0.0;

        if (evaluacionesCompletadas.length > 0) {
            const sumatoriaPromedios = evaluacionesCompletadas
                .map((e) => this.calcularPromedioEvaluacion(e))
                .reduce((a, b) => a + b, 0);
            promedioGeneral = sumatoriaPromedios / evaluacionesCompletadas.length;
        }

        this._estadisticas = {
            total,
            completadas,
            pendientes,
            porcentajeCompletado,
            promedioGeneral,
        };

        console.log('📊 [STATS] Estadísticas generales:', this._estadisticas);
    }

    /**
     * Calcula promedios individuales por estudiante (como evaluado)
     */
    async calcularPromediosPorEstudiante(
        evaluaciones: EvaluacionIndividual[]
    ): Promise<void> {
        const calificacionesPorEstudiante = new Map<string, number[]>();

        // Agrupar calificaciones por estudiante evaluado
        for (const evaluacion of evaluaciones.filter((e) => e.completada)) {
            const evaluadoId = evaluacion.evaluadoId;
            const promedio = this.calcularPromedioEvaluacion(evaluacion);

            if (!calificacionesPorEstudiante.has(evaluadoId)) {
                calificacionesPorEstudiante.set(evaluadoId, []);
            }
            calificacionesPorEstudiante.get(evaluadoId)!.push(promedio);

            // También guardar las evaluaciones por estudiante
            if (!this._evaluacionesPorEstudiante.has(evaluadoId)) {
                this._evaluacionesPorEstudiante.set(evaluadoId, []);
            }
            this._evaluacionesPorEstudiante.get(evaluadoId)!.push(evaluacion);
        }

        // Calcular promedio final por estudiante
        this._promediosEstudiantes.clear();
        calificacionesPorEstudiante.forEach((calificaciones, estudianteId) => {
            if (calificaciones.length > 0) {
                const promedio =
                    calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
                this._promediosEstudiantes.set(estudianteId, promedio);
            }
        });

        console.log(
            `📊 [STATS] Promedios por estudiante: ${this._promediosEstudiantes.size} estudiantes`
        );
    }

    /**
     * Calcula promedios por equipo
     */
    async calcularPromediosPorEquipo(
        evaluaciones: EvaluacionIndividual[]
    ): Promise<void> {
        const calificacionesPorEquipo = new Map<string, number[]>();

        // Agrupar calificaciones por equipo
        for (const evaluacion of evaluaciones.filter((e) => e.completada)) {
            const equipoId = evaluacion.equipoId;
            const promedio = this.calcularPromedioEvaluacion(evaluacion);

            if (!calificacionesPorEquipo.has(equipoId)) {
                calificacionesPorEquipo.set(equipoId, []);
            }
            calificacionesPorEquipo.get(equipoId)!.push(promedio);

            // También guardar las evaluaciones por equipo
            if (!this._evaluacionesPorEquipo.has(equipoId)) {
                this._evaluacionesPorEquipo.set(equipoId, []);
            }
            this._evaluacionesPorEquipo.get(equipoId)!.push(evaluacion);
        }

        // Calcular promedio final por equipo
        this._promediosEquipos.clear();
        calificacionesPorEquipo.forEach((calificaciones, equipoId) => {
            if (calificaciones.length > 0) {
                const promedio =
                    calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
                this._promediosEquipos.set(equipoId, promedio);
            }
        });

        console.log(
            `📊 [STATS] Promedios por equipo: ${this._promediosEquipos.size} equipos`
        );
    }

    /**
     * Calcula promedios por criterio de evaluación
     */
    async calcularPromediosPorCriterio(
        evaluaciones: EvaluacionIndividual[]
    ): Promise<void> {
        const calificacionesPorCriterio = new Map<string, number[]>();

        // Agrupar calificaciones por criterio
        for (const evaluacion of evaluaciones.filter((e) => e.completada)) {
            Object.entries(evaluacion.calificaciones).forEach(([criterioKey, calificacion]) => {
                if (!calificacionesPorCriterio.has(criterioKey)) {
                    calificacionesPorCriterio.set(criterioKey, []);
                }
                calificacionesPorCriterio.get(criterioKey)!.push(calificacion);
            });
        }

        // Calcular promedio final por criterio
        this._promediosPorCriterio.clear();
        calificacionesPorCriterio.forEach((calificaciones, criterio) => {
            if (calificaciones.length > 0) {
                const promedio =
                    calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
                this._promediosPorCriterio.set(criterio, promedio);
            }
        });

        console.log('📊 [STATS] Promedios por criterio:', Object.fromEntries(this._promediosPorCriterio));
    }

    /**
     * Calcula el promedio de una evaluación individual
     */
    private calcularPromedioEvaluacion(evaluacion: EvaluacionIndividual): number {
        const calificaciones = Object.values(evaluacion.calificaciones);

        if (calificaciones.length === 0) return 0.0;

        const suma = calificaciones.reduce((a, b) => a + b, 0);
        return suma / calificaciones.length;
    }

    // ===================================================================
    // MÉTODOS DE CONSULTA DETALLADA
    // ===================================================================

    /**
     * Obtiene estadísticas detalladas de un estudiante específico
     */
    getEstadisticasEstudiante(estudianteId: string): EstadisticasEstudiante {
        const evaluaciones = this._evaluacionesPorEstudiante.get(estudianteId) || [];
        const promedio = this._promediosEstudiantes.get(estudianteId) || 0.0;

        if (evaluaciones.length === 0) {
            return {
                promedio: 0.0,
                totalEvaluaciones: 0,
                evaluacionesRecibidas: 0,
                porCriterio: {},
            };
        }

        // Calcular promedios por criterio para este estudiante
        const calificacionesPorCriterio = new Map<string, number[]>();
        for (const evaluacion of evaluaciones) {
            Object.entries(evaluacion.calificaciones).forEach(([criterio, calificacion]) => {
                if (!calificacionesPorCriterio.has(criterio)) {
                    calificacionesPorCriterio.set(criterio, []);
                }
                calificacionesPorCriterio.get(criterio)!.push(calificacion);
            });
        }

        const promediosPorCriterio: Record<string, number> = {};
        calificacionesPorCriterio.forEach((calificaciones, criterio) => {
            const promedioCriterio =
                calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
            promediosPorCriterio[criterio] = promedioCriterio;
        });

        return {
            promedio,
            totalEvaluaciones: evaluaciones.length,
            evaluacionesRecibidas: evaluaciones.length,
            porCriterio: promediosPorCriterio,
        };
    }

    /**
     * Obtiene estadísticas detalladas de un equipo específico
     */
    getEstadisticasEquipo(equipoId: string): EstadisticasEquipo {
        const evaluaciones = this._evaluacionesPorEquipo.get(equipoId) || [];
        const promedio = this._promediosEquipos.get(equipoId) || 0.0;

        if (evaluaciones.length === 0) {
            return {
                promedio: 0.0,
                totalEvaluaciones: 0,
                miembrosEvaluados: new Set(),
                porCriterio: {},
            };
        }

        // Obtener miembros únicos evaluados en este equipo
        const miembrosEvaluados = new Set(evaluaciones.map((e) => e.evaluadoId));

        // Calcular promedios por criterio para este equipo
        const calificacionesPorCriterio = new Map<string, number[]>();
        for (const evaluacion of evaluaciones) {
            Object.entries(evaluacion.calificaciones).forEach(([criterio, calificacion]) => {
                if (!calificacionesPorCriterio.has(criterio)) {
                    calificacionesPorCriterio.set(criterio, []);
                }
                calificacionesPorCriterio.get(criterio)!.push(calificacion);
            });
        }

        const promediosPorCriterio: Record<string, number> = {};
        calificacionesPorCriterio.forEach((calificaciones, criterio) => {
            const promedioCriterio =
                calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
            promediosPorCriterio[criterio] = promedioCriterio;
        });

        return {
            promedio,
            totalEvaluaciones: evaluaciones.length,
            miembrosEvaluados,
            porCriterio: promediosPorCriterio,
        };
    }

    /**
     * Obtiene el top de estudiantes por promedio
     */
    getTopEstudiantes(limite: number = 10): RankingItem[] {
        const estudiantesOrdenados = Array.from(this._promediosEstudiantes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limite);

        return estudiantesOrdenados.map(([estudianteId, promedio]) => {
            const estadisticas = this.getEstadisticasEstudiante(estudianteId);
            return {
                id: estudianteId,
                promedio,
                estadisticas,
            };
        });
    }

    /**
     * Obtiene el ranking de equipos por promedio
     */
    getRankingEquipos(): RankingItem[] {
        const equiposOrdenados = Array.from(this._promediosEquipos.entries())
            .sort((a, b) => b[1] - a[1]);

        return equiposOrdenados.map(([equipoId, promedio]) => {
            const estadisticas = this.getEstadisticasEquipo(equipoId);
            return {
                id: equipoId,
                promedio,
                estadisticas,
            };
        });
    }

    // ===================================================================
    // UTILIDADES
    // ===================================================================

    /**
     * Formatea un promedio a 2 decimales
     */
    formatearPromedio(promedio: number): string {
        return promedio.toFixed(2);
    }

    /**
     * Obtiene el nivel según el promedio
     */
    obtenerNivelPorPromedio(promedio: number): string {
        if (promedio >= 4.5) return 'Excelente';
        if (promedio >= 3.5) return 'Bueno';
        if (promedio >= 2.5) return 'Adecuado';
        return 'Necesita Mejorar';
    }

    /**
     * Limpia todos los datos cargados
     */
    limpiarDatos(): void {
        this._estadisticas = null;
        this._promediosEstudiantes.clear();
        this._promediosEquipos.clear();
        this._evaluacionesPorEstudiante.clear();
        this._evaluacionesPorEquipo.clear();
        this._promediosPorCriterio.clear();
        this.notify();
    }
}

export default EvaluacionDetalleControllerTemp;
