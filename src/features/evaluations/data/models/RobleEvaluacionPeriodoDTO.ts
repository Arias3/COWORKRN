/**
 * RobleEvaluacionPeriodoDTO
 * 
 * DTO for EvaluacionPeriodo in Roble API.
 * Handles JSON serialization and entity conversion.
 */

import { EstadoEvaluacionPeriodo, EvaluacionPeriodo } from '../../domain/entities/EvaluacionPeriodo';

export class RobleEvaluacionPeriodoDTO {
  id: string;
  actividadId: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string; // ISO String
  fechaFin?: string; // ISO String
  fechaCreacion: string; // ISO String
  profesorId: string;
  evaluacionEntrePares: boolean;
  permitirAutoEvaluacion: boolean;
  criteriosEvaluacion: string[];
  estado: string;
  habilitarComentarios: boolean;
  puntuacionMaxima: number;
  fechaActualizacion?: string; // ISO String

  constructor(params: {
    id: string;
    actividadId: string;
    titulo: string;
    descripcion?: string;
    fechaInicio: string;
    fechaFin?: string;
    fechaCreacion: string;
    profesorId: string;
    evaluacionEntrePares: boolean;
    permitirAutoEvaluacion: boolean;
    criteriosEvaluacion: string[];
    estado: string;
    habilitarComentarios: boolean;
    puntuacionMaxima: number;
    fechaActualizacion?: string;
  }) {
    this.id = params.id;
    this.actividadId = params.actividadId;
    this.titulo = params.titulo;
    this.descripcion = params.descripcion;
    this.fechaInicio = params.fechaInicio;
    this.fechaFin = params.fechaFin;
    this.fechaCreacion = params.fechaCreacion;
    this.profesorId = params.profesorId;
    this.evaluacionEntrePares = params.evaluacionEntrePares;
    this.permitirAutoEvaluacion = params.permitirAutoEvaluacion;
    this.criteriosEvaluacion = params.criteriosEvaluacion;
    this.estado = params.estado;
    this.habilitarComentarios = params.habilitarComentarios;
    this.puntuacionMaxima = params.puntuacionMaxima;
    this.fechaActualizacion = params.fechaActualizacion;
  }

  static fromJson(json: any): RobleEvaluacionPeriodoDTO {
    // Handle criteriosEvaluacion that can come as String or Array
    let criterios: string[] = [];
    if (json.criteriosEvaluacion != null) {
      if (typeof json.criteriosEvaluacion === 'string') {
        // If it's a String, try to parse it
        let criteriosStr = json.criteriosEvaluacion;
        if (criteriosStr.startsWith('{') && criteriosStr.endsWith('}')) {
          // PostgreSQL array format: {"item1","item2","item3"}
          criteriosStr = criteriosStr.substring(1, criteriosStr.length - 1);
          criterios = criteriosStr
            .split(',')
            .map((e: string) => e.trim().replace(/"/g, ''));
        } else {
          // Fallback: use the string as a single criterion
          criterios = [criteriosStr];
        }
      } else if (Array.isArray(json.criteriosEvaluacion)) {
        criterios = json.criteriosEvaluacion.map((c: any) => String(c));
      }
    }

    return new RobleEvaluacionPeriodoDTO({
      id: json._id || json.id,
      actividadId: json.actividadId,
      titulo: json.titulo,
      descripcion: json.descripcion,
      fechaInicio: json.fechaInicio,
      fechaFin: json.fechaFin,
      fechaCreacion: json.fechaCreacion,
      profesorId: json.profesorId,
      evaluacionEntrePares: json.evaluacionEntrePares ?? true,
      permitirAutoEvaluacion: json.permitirAutoEvaluacion ?? false,
      criteriosEvaluacion: criterios,
      estado: json.estado || 'pendiente',
      habilitarComentarios: json.habilitarComentarios ?? true,
      puntuacionMaxima: typeof json.puntuacionMaxima === 'number' ? json.puntuacionMaxima : 5.0,
      fechaActualizacion: json.fechaActualizacion,
    });
  }

  toJson(): any {
    return {
      actividadId: this.actividadId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      fechaCreacion: this.fechaCreacion,
      profesorId: this.profesorId,
      evaluacionEntrePares: this.evaluacionEntrePares,
      permitirAutoEvaluacion: this.permitirAutoEvaluacion,
      criteriosEvaluacion: this.criteriosEvaluacion,
      estado: this.estado,
      habilitarComentarios: this.habilitarComentarios,
      puntuacionMaxima: this.puntuacionMaxima,
      fechaActualizacion: this.fechaActualizacion,
    };
  }

  static fromEntity(entity: EvaluacionPeriodo): RobleEvaluacionPeriodoDTO {
    return new RobleEvaluacionPeriodoDTO({
      id: entity.id,
      actividadId: entity.actividadId,
      titulo: entity.titulo,
      descripcion: entity.descripcion,
      fechaInicio: entity.fechaInicio.toISOString(),
      fechaFin: entity.fechaFin?.toISOString(),
      fechaCreacion: entity.fechaCreacion.toISOString(),
      profesorId: entity.profesorId,
      evaluacionEntrePares: entity.evaluacionEntrePares,
      permitirAutoEvaluacion: entity.permitirAutoEvaluacion,
      criteriosEvaluacion: entity.criteriosEvaluacion,
      estado: entity.estado,
      habilitarComentarios: entity.habilitarComentarios,
      puntuacionMaxima: entity.puntuacionMaxima,
      fechaActualizacion: entity.fechaActualizacion?.toISOString(),
    });
  }

  toEntity(): EvaluacionPeriodo {
    // Find matching estado enum value
    let estadoEnum = EstadoEvaluacionPeriodo.PENDIENTE;
    if (this.estado === 'activo' || this.estado === 'ACTIVO') {
      estadoEnum = EstadoEvaluacionPeriodo.ACTIVO;
    } else if (this.estado === 'finalizado' || this.estado === 'FINALIZADO') {
      estadoEnum = EstadoEvaluacionPeriodo.FINALIZADO;
    }

    return new EvaluacionPeriodo({
      id: this.id,
      actividadId: this.actividadId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fechaInicio: new Date(this.fechaInicio),
      fechaFin: this.fechaFin ? new Date(this.fechaFin) : undefined,
      fechaCreacion: new Date(this.fechaCreacion),
      profesorId: this.profesorId,
      evaluacionEntrePares: this.evaluacionEntrePares,
      permitirAutoEvaluacion: this.permitirAutoEvaluacion,
      criteriosEvaluacion: this.criteriosEvaluacion,
      estado: estadoEnum,
      habilitarComentarios: this.habilitarComentarios,
      puntuacionMaxima: this.puntuacionMaxima,
      fechaActualizacion: this.fechaActualizacion ? new Date(this.fechaActualizacion) : undefined,
    });
  }
}

export default RobleEvaluacionPeriodoDTO;
