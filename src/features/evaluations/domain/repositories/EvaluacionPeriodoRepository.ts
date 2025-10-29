/**
 * EvaluacionPeriodoRepository Interface
 * 
 * Defines operations for managing evaluation periods.
 */

import { EstadoEvaluacionPeriodo, EvaluacionPeriodo } from '../entities/EvaluacionPeriodo';

export interface IEvaluacionPeriodoRepository {
  getEvaluacionesPorActividad(actividadId: string): Promise<EvaluacionPeriodo[]>;
  getEvaluacionesPorProfesor(profesorId: string): Promise<EvaluacionPeriodo[]>;
  getEvaluacionPeriodoById(id: string): Promise<EvaluacionPeriodo | null>;
  crearEvaluacionPeriodo(evaluacion: EvaluacionPeriodo): Promise<EvaluacionPeriodo>;
  actualizarEvaluacionPeriodo(evaluacion: EvaluacionPeriodo): Promise<EvaluacionPeriodo>;
  eliminarEvaluacionPeriodo(id: string): Promise<boolean>;
  getEvaluacionesActivas(): Promise<EvaluacionPeriodo[]>;
  getEvaluacionesPorEstado(estado: EstadoEvaluacionPeriodo): Promise<EvaluacionPeriodo[]>;
}

export default IEvaluacionPeriodoRepository;
