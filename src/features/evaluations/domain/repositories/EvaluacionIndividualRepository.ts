/**
 * EvaluacionIndividualRepository Interface
 * 
 * Defines operations for managing individual evaluations.
 */

import { EvaluacionIndividual } from '../entities/EvaluacionIndividual';

export interface IEvaluacionIndividualRepository {
  getEvaluacionesPorPeriodo(evaluacionPeriodoId: string): Promise<EvaluacionIndividual[]>;
  getEvaluacionesPorEvaluador(evaluadorId: string): Promise<EvaluacionIndividual[]>;
  getEvaluacionesPorEvaluado(evaluadoId: string): Promise<EvaluacionIndividual[]>;
  getEvaluacionesPorEquipo(equipoId: string): Promise<EvaluacionIndividual[]>;
  getEvaluacionById(id: string): Promise<EvaluacionIndividual | null>;
  getEvaluacionEspecifica(
    evaluacionPeriodoId: string,
    evaluadorId: string,
    evaluadoId: string
  ): Promise<EvaluacionIndividual | null>;
  crearEvaluacion(evaluacion: EvaluacionIndividual): Promise<EvaluacionIndividual>;
  actualizarEvaluacion(evaluacion: EvaluacionIndividual): Promise<EvaluacionIndividual>;
  eliminarEvaluacion(id: string): Promise<boolean>;
  getEvaluacionesCompletadas(evaluacionPeriodoId: string): Promise<EvaluacionIndividual[]>;
  getEvaluacionesPendientes(
    evaluadorId: string,
    evaluacionPeriodoId: string
  ): Promise<EvaluacionIndividual[]>;
  getPromedioEvaluacionesPorUsuario(
    evaluadoId: string,
    evaluacionPeriodoId: string
  ): Promise<Record<string, number>>;
}

export default IEvaluacionIndividualRepository;
