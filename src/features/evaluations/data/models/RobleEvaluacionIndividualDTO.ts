/**
 * RobleEvaluacionIndividualDTO
 * 
 * DTO for EvaluacionIndividual in Roble API.
 * Handles JSON serialization and entity conversion, with special handling for calificaciones map.
 */

import { EvaluacionIndividual } from '../../domain/entities/EvaluacionIndividual';

export class RobleEvaluacionIndividualDTO {
  id: string;
  evaluacionPeriodoId: string;
  evaluadorId: string;
  evaluadoId: string;
  equipoId: string;
  calificaciones: Record<string, number>;
  comentarios?: string;
  fechaCreacion: string; // ISO String
  fechaActualizacion?: string; // ISO String
  completada: boolean;

  constructor(params: {
    id: string;
    evaluacionPeriodoId: string;
    evaluadorId: string;
    evaluadoId: string;
    equipoId: string;
    calificaciones: Record<string, number>;
    comentarios?: string;
    fechaCreacion: string;
    fechaActualizacion?: string;
    completada: boolean;
  }) {
    this.id = params.id;
    this.evaluacionPeriodoId = params.evaluacionPeriodoId;
    this.evaluadorId = params.evaluadorId;
    this.evaluadoId = params.evaluadoId;
    this.equipoId = params.equipoId;
    this.calificaciones = params.calificaciones;
    this.comentarios = params.comentarios;
    this.fechaCreacion = params.fechaCreacion;
    this.fechaActualizacion = params.fechaActualizacion;
    this.completada = params.completada;
  }

  static fromJson(json: any): RobleEvaluacionIndividualDTO {
    // Handle calificaciones that can come as String or Map
    let calificacionesMap: Record<string, number> = {};
    const calificacionesRaw = json.calificaciones;

    if (calificacionesRaw != null) {
      if (typeof calificacionesRaw === 'object' && !Array.isArray(calificacionesRaw)) {
        // If it's already an object, convert to Record<string, number> handling int and double
        Object.entries(calificacionesRaw).forEach(([key, value]) => {
          if (typeof value === 'number') {
            calificacionesMap[key] = value;
          }
        });
      } else if (typeof calificacionesRaw === 'string' && calificacionesRaw.length > 0) {
        try {
          // If it's a String, parse it as JSON
          const decoded = JSON.parse(calificacionesRaw);
          if (typeof decoded === 'object' && !Array.isArray(decoded)) {
            Object.entries(decoded).forEach(([key, value]) => {
              if (typeof value === 'number') {
                calificacionesMap[key] = value;
              }
            });
          }
        } catch (e) {
          console.error('Error parsing calificaciones:', e);
          calificacionesMap = {};
        }
      }
    }

    return new RobleEvaluacionIndividualDTO({
      id: json._id || json.id,
      evaluacionPeriodoId: json.evaluacionPeriodoId,
      evaluadorId: json.evaluadorId,
      evaluadoId: json.evaluadoId,
      equipoId: json.equipoId,
      calificaciones: calificacionesMap,
      comentarios: json.comentarios,
      fechaCreacion: json.fechaCreacion,
      fechaActualizacion: json.fechaActualizacion,
      completada: json.completada ?? false,
    });
  }

  toJson(): any {
    return {
      evaluacionPeriodoId: this.evaluacionPeriodoId,
      evaluadorId: this.evaluadorId,
      evaluadoId: this.evaluadoId,
      equipoId: this.equipoId,
      calificaciones: this.calificaciones,
      comentarios: this.comentarios,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      completada: this.completada,
    };
  }

  static fromEntity(entity: EvaluacionIndividual): RobleEvaluacionIndividualDTO {
    return new RobleEvaluacionIndividualDTO({
      id: entity.id,
      evaluacionPeriodoId: entity.evaluacionPeriodoId,
      evaluadorId: entity.evaluadorId,
      evaluadoId: entity.evaluadoId,
      equipoId: entity.equipoId,
      calificaciones: { ...entity.calificaciones },
      comentarios: entity.comentarios,
      fechaCreacion: entity.fechaCreacion.toISOString(),
      fechaActualizacion: entity.fechaActualizacion?.toISOString(),
      completada: entity.completada,
    });
  }

  toEntity(): EvaluacionIndividual {
    return new EvaluacionIndividual({
      id: this.id,
      evaluacionPeriodoId: this.evaluacionPeriodoId,
      evaluadorId: this.evaluadorId,
      evaluadoId: this.evaluadoId,
      equipoId: this.equipoId,
      calificaciones: { ...this.calificaciones },
      comentarios: this.comentarios,
      fechaCreacion: new Date(this.fechaCreacion),
      fechaActualizacion: this.fechaActualizacion ? new Date(this.fechaActualizacion) : undefined,
      completada: this.completada,
    });
  }
}

export default RobleEvaluacionIndividualDTO;
