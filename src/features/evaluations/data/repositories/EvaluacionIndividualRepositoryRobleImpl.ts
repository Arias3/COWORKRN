/**
 * EvaluacionIndividualRepositoryRobleImpl
 * 
 * Implementation of IEvaluacionIndividualRepository using Roble API.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { EvaluacionIndividual } from '../../domain/entities/EvaluacionIndividual';
import { IEvaluacionIndividualRepository } from '../../domain/repositories/EvaluacionIndividualRepository';
import { RobleEvaluacionIndividualDTO } from '../models/RobleEvaluacionIndividualDTO';

export class EvaluacionIndividualRepositoryRobleImpl implements IEvaluacionIndividualRepository {
  private dataSource: RobleApiDataSource;

  constructor(dataSource: RobleApiDataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Generate a valid Roble ID (exactly 12 alphanumeric characters)
   */
  private generateRobleId(seed: string): string {
    const timestamp = Date.now().toString();
    const microsecond = (performance.now() * 1000).toString();

    // Combine and take only alphanumeric characters
    const combined = timestamp + microsecond + seed;
    const alphanumeric = combined.replace(/[^a-zA-Z0-9]/g, '');

    // Ensure exactly 12 characters
    if (alphanumeric.length >= 12) {
      return alphanumeric.substring(0, 12);
    } else {
      // Pad with default characters if necessary
      return alphanumeric.padEnd(12, '0');
    }
  }

  async getEvaluacionesPorPeriodo(evaluacionPeriodoId: string): Promise<EvaluacionIndividual[]> {
    try {
      console.log(`🔍 [EVAL-REPO] Buscando evaluaciones para periodo: ${evaluacionPeriodoId}`);

      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluacionPeriodoId,
      });

      console.log(`📊 [EVAL-REPO] Respuesta recibida: ${response.length} registros`);

      if (response.length === 0) {
        console.log('📝 [EVAL-REPO] No se encontraron evaluaciones para el periodo');
        return [];
      }

      const evaluaciones: EvaluacionIndividual[] = [];

      for (let i = 0; i < response.length; i++) {
        try {
          const item = response[i];
          console.log(`🔍 [EVAL-REPO] Procesando registro ${i}`);

          const dto = RobleEvaluacionIndividualDTO.fromJson(item);
          evaluaciones.push(dto.toEntity());
          console.log(`✅ [EVAL-REPO] Evaluación ${i} procesada correctamente`);
        } catch (e) {
          console.error(`❌ [EVAL-REPO] Error procesando registro ${i}:`, e);
          console.log(`🔍 [EVAL-REPO] Datos del registro problemático:`, response[i]);
        }
      }

      console.log(`✅ [EVAL-REPO] Total evaluaciones procesadas: ${evaluaciones.length}`);
      return evaluaciones;
    } catch (e) {
      console.error('❌ [EVAL-REPO] Error al obtener evaluaciones por período:', e);
      return [];
    }
  }

  async getEvaluacionesPorEvaluador(evaluadorId: string): Promise<EvaluacionIndividual[]> {
    try {
      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluadorId,
      });

      return response.map((json: any) =>
        RobleEvaluacionIndividualDTO.fromJson(json).toEntity()
      );
    } catch (e) {
      console.error('Error al obtener evaluaciones por evaluador:', e);
      return [];
    }
  }

  async getEvaluacionesPorEvaluado(evaluadoId: string): Promise<EvaluacionIndividual[]> {
    try {
      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluadoId,
      });

      return response.map((json: any) =>
        RobleEvaluacionIndividualDTO.fromJson(json).toEntity()
      );
    } catch (e) {
      console.error('Error al obtener evaluaciones por evaluado:', e);
      return [];
    }
  }

  async getEvaluacionesPorEquipo(equipoId: string): Promise<EvaluacionIndividual[]> {
    try {
      const response = await this.dataSource.read('EvaluacionIndividual', {
        equipoId,
      });

      return response.map((json: any) =>
        RobleEvaluacionIndividualDTO.fromJson(json).toEntity()
      );
    } catch (e) {
      console.error('Error al obtener evaluaciones por equipo:', e);
      return [];
    }
  }

  async getEvaluacionById(id: string): Promise<EvaluacionIndividual | null> {
    try {
      const response = await this.dataSource.getById('EvaluacionIndividual', id);

      if (response != null) {
        return RobleEvaluacionIndividualDTO.fromJson(response).toEntity();
      }
      return null;
    } catch (e) {
      console.error('Error al obtener evaluación por ID:', e);
      return null;
    }
  }

  async getEvaluacionEspecifica(
    evaluacionPeriodoId: string,
    evaluadorId: string,
    evaluadoId: string
  ): Promise<EvaluacionIndividual | null> {
    try {
      console.log('🔍 [EVAL-REPO] Buscando evaluación específica:');
      console.log(`  - Periodo: ${evaluacionPeriodoId}`);
      console.log(`  - Evaluador: ${evaluadorId}`);
      console.log(`  - Evaluado: ${evaluadoId}`);

      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluacionPeriodoId,
        evaluadorId,
        evaluadoId,
      });

      console.log(`📊 [EVAL-REPO] Respuesta evaluación específica: ${response.length} registros`);

      if (response.length > 0) {
        try {
          const item = response[0];
          console.log(`🔍 [EVAL-REPO] Contenido del registro:`, item);

          const dto = RobleEvaluacionIndividualDTO.fromJson(item);
          console.log('✅ [EVAL-REPO] Evaluación específica encontrada');
          return dto.toEntity();
        } catch (e) {
          console.error('❌ [EVAL-REPO] Error procesando evaluación específica:', e);
          console.log('🔍 [EVAL-REPO] Datos problemáticos:', response[0]);
          return null;
        }
      }

      console.log('📝 [EVAL-REPO] No se encontró evaluación específica');
      return null;
    } catch (e) {
      console.error('❌ [EVAL-REPO] Error al obtener evaluación específica:', e);
      return null;
    }
  }

  async crearEvaluacion(evaluacion: EvaluacionIndividual): Promise<EvaluacionIndividual> {
    try {
      console.log('🔄 [EVAL-REPO] Creando evaluación...');
      console.log(`🔄 [EVAL-REPO] Periodo: ${evaluacion.evaluacionPeriodoId}`);
      console.log(`🔄 [EVAL-REPO] Evaluador: ${evaluacion.evaluadorId}`);
      console.log(`🔄 [EVAL-REPO] Evaluado: ${evaluacion.evaluadoId}`);

      const dto = RobleEvaluacionIndividualDTO.fromEntity(evaluacion);
      const data = dto.toJson();

      // Generate unique valid ID for Roble (12 alphanumeric characters)
      const timestamp = Date.now();
      const id = this.generateRobleId(timestamp.toString());

      data._id = id;

      console.log(`🆔 [EVAL-REPO] ID generado: ${id} (longitud: ${id.length})`);
      console.log('📦 [EVAL-REPO] Datos a enviar:', data);

      const response = await this.dataSource.create('EvaluacionIndividual', data);

      console.log('✅ [EVAL-REPO] Respuesta recibida:', response);

      return RobleEvaluacionIndividualDTO.fromJson(response).toEntity();
    } catch (e) {
      console.error('❌ [EVAL-REPO] Error al crear evaluación individual:', e);
      throw e;
    }
  }

  async actualizarEvaluacion(evaluacion: EvaluacionIndividual): Promise<EvaluacionIndividual> {
    try {
      const dto = RobleEvaluacionIndividualDTO.fromEntity(
        evaluacion.copyWith({ fechaActualizacion: new Date() })
      );
      const data = dto.toJson();

      await this.dataSource.update('EvaluacionIndividual', evaluacion.id, data);

      // Get updated record
      const updatedRecord = await this.dataSource.getById(
        'EvaluacionIndividual',
        evaluacion.id
      );
      if (updatedRecord != null) {
        return RobleEvaluacionIndividualDTO.fromJson(updatedRecord).toEntity();
      }

      throw new Error('No se pudo actualizar la evaluación individual');
    } catch (e) {
      console.error('Error al actualizar evaluación individual:', e);
      throw e;
    }
  }

  async eliminarEvaluacion(id: string): Promise<boolean> {
    try {
      await this.dataSource.delete('EvaluacionIndividual', id);
      return true;
    } catch (e) {
      console.error('Error al eliminar evaluación individual:', e);
      return false;
    }
  }

  async getEvaluacionesCompletadas(evaluacionPeriodoId: string): Promise<EvaluacionIndividual[]> {
    try {
      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluacionPeriodoId,
        completada: true,
      });

      return response.map((json: any) =>
        RobleEvaluacionIndividualDTO.fromJson(json).toEntity()
      );
    } catch (e) {
      console.error('Error al obtener evaluaciones completadas:', e);
      return [];
    }
  }

  async getEvaluacionesPendientes(
    evaluadorId: string,
    evaluacionPeriodoId: string
  ): Promise<EvaluacionIndividual[]> {
    try {
      const response = await this.dataSource.read('EvaluacionIndividual', {
        evaluadorId,
        evaluacionPeriodoId,
        completada: false,
      });

      return response.map((json: any) =>
        RobleEvaluacionIndividualDTO.fromJson(json).toEntity()
      );
    } catch (e) {
      console.error('Error al obtener evaluaciones pendientes:', e);
      return [];
    }
  }

  async getPromedioEvaluacionesPorUsuario(
    evaluadoId: string,
    evaluacionPeriodoId: string
  ): Promise<Record<string, number>> {
    try {
      const evaluaciones = await this.getEvaluacionesPorPeriodo(evaluacionPeriodoId);
      const evaluacionesDelUsuario = evaluaciones.filter(
        (evaluacion) => evaluacion.evaluadoId === evaluadoId && evaluacion.completada
      );

      if (evaluacionesDelUsuario.length === 0) {
        return {};
      }

      const calificacionesPorCriterio: Record<string, number[]> = {};

      for (const evaluacion of evaluacionesDelUsuario) {
        Object.entries(evaluacion.calificaciones).forEach(([criterio, calificacion]) => {
          if (!calificacionesPorCriterio[criterio]) {
            calificacionesPorCriterio[criterio] = [];
          }
          calificacionesPorCriterio[criterio].push(calificacion);
        });
      }

      const promedios: Record<string, number> = {};
      Object.entries(calificacionesPorCriterio).forEach(([criterio, calificaciones]) => {
        const promedio = calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;
        promedios[criterio] = promedio;
      });

      return promedios;
    } catch (e) {
      console.error('Error al calcular promedios:', e);
      return {};
    }
  }
}

export default EvaluacionIndividualRepositoryRobleImpl;
