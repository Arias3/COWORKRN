/**
 * EvaluacionPeriodoRepositoryRobleImpl
 * 
 * Implementation of IEvaluacionPeriodoRepository using Roble API.
 */

import RobleApiDataSource from '../../../../core/data/datasources/RobleApiDataSource';
import { EstadoEvaluacionPeriodo, EvaluacionPeriodo } from '../../domain/entities/EvaluacionPeriodo';
import { IEvaluacionPeriodoRepository } from '../../domain/repositories/EvaluacionPeriodoRepository';
import { RobleEvaluacionPeriodoDTO } from '../models/RobleEvaluacionPeriodoDTO';

export class EvaluacionPeriodoRepositoryRobleImpl implements IEvaluacionPeriodoRepository {
  private dataSource: RobleApiDataSource;

  constructor(dataSource: RobleApiDataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Generate consistent ID from evaluation data
   */
  private generateConsistentId(data: any): string {
    const baseString = `${data.actividadId}_${data.titulo}_${data.fechaCreacion}`;
    const bytes = new TextEncoder().encode(baseString);
    const sum = bytes.reduce((prev, element) => prev + element, 0);
    return sum.toString().padStart(12, '0');
  }

  async getEvaluacionesPorActividad(actividadId: string): Promise<EvaluacionPeriodo[]> {
    try {
      const response = await this.dataSource.read('EvaluacionPeriodo', {
        actividadId,
      });

      return response.map((json: any) => RobleEvaluacionPeriodoDTO.fromJson(json).toEntity());
    } catch (e) {
      console.error('Error al obtener evaluaciones por actividad:', e);
      return [];
    }
  }

  async getEvaluacionesPorProfesor(profesorId: string): Promise<EvaluacionPeriodo[]> {
    try {
      const response = await this.dataSource.read('EvaluacionPeriodo', {
        profesorId,
      });

      return response.map((json: any) => RobleEvaluacionPeriodoDTO.fromJson(json).toEntity());
    } catch (e) {
      console.error('Error al obtener evaluaciones por profesor:', e);
      return [];
    }
  }

  async getEvaluacionPeriodoById(id: string): Promise<EvaluacionPeriodo | null> {
    try {
      const response = await this.dataSource.getById('EvaluacionPeriodo', id);

      if (response != null) {
        return RobleEvaluacionPeriodoDTO.fromJson(response).toEntity();
      }
      return null;
    } catch (e) {
      console.error('Error al obtener evaluación por ID:', e);
      return null;
    }
  }

  async crearEvaluacionPeriodo(evaluacion: EvaluacionPeriodo): Promise<EvaluacionPeriodo> {
    try {
      const dto = RobleEvaluacionPeriodoDTO.fromEntity(evaluacion);
      const data = dto.toJson();

      // Generate consistent ID if not exists
      if (evaluacion.id.length === 0) {
        data._id = this.generateConsistentId(data);
      } else {
        data._id = evaluacion.id;
      }

      const response = await this.dataSource.create('EvaluacionPeriodo', data);
      return RobleEvaluacionPeriodoDTO.fromJson(response).toEntity();
    } catch (e) {
      console.error('Error al crear evaluación periodo:', e);
      throw e;
    }
  }

  async actualizarEvaluacionPeriodo(evaluacion: EvaluacionPeriodo): Promise<EvaluacionPeriodo> {
    try {
      const dto = RobleEvaluacionPeriodoDTO.fromEntity(
        evaluacion.copyWith({ fechaActualizacion: new Date() })
      );
      const data = dto.toJson();

      await this.dataSource.update('EvaluacionPeriodo', evaluacion.id, data);

      // Get updated record
      const updatedRecord = await this.dataSource.getById('EvaluacionPeriodo', evaluacion.id);
      if (updatedRecord != null) {
        return RobleEvaluacionPeriodoDTO.fromJson(updatedRecord).toEntity();
      }

      throw new Error('No se pudo actualizar la evaluación periodo');
    } catch (e) {
      console.error('Error al actualizar evaluación periodo:', e);
      throw e;
    }
  }

  async eliminarEvaluacionPeriodo(id: string): Promise<boolean> {
    try {
      await this.dataSource.delete('EvaluacionPeriodo', id);
      return true;
    } catch (e) {
      console.error('Error al eliminar evaluación periodo:', e);
      return false;
    }
  }

  async getEvaluacionesActivas(): Promise<EvaluacionPeriodo[]> {
    try {
      const response = await this.dataSource.read('EvaluacionPeriodo', {
        estado: 'activo',
      });

      return response.map((json: any) => RobleEvaluacionPeriodoDTO.fromJson(json).toEntity());
    } catch (e) {
      console.error('Error al obtener evaluaciones activas:', e);
      return [];
    }
  }

  async getEvaluacionesPorEstado(estado: EstadoEvaluacionPeriodo): Promise<EvaluacionPeriodo[]> {
    try {
      // Convert enum to lowercase string for API
      const estadoStr = estado.toLowerCase();

      const response = await this.dataSource.read('EvaluacionPeriodo', {
        estado: estadoStr,
      });

      return response.map((json: any) => RobleEvaluacionPeriodoDTO.fromJson(json).toEntity());
    } catch (e) {
      console.error('Error al obtener evaluaciones por estado:', e);
      return [];
    }
  }
}

export default EvaluacionPeriodoRepositoryRobleImpl;
