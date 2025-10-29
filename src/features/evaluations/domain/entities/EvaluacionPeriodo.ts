/**
 * EvaluacionPeriodo Entity
 * 
 * Represents an evaluation period for an activity.
 * Allows peer and self-evaluation with customizable criteria.
 */

export enum EstadoEvaluacionPeriodo {
  PENDIENTE = 'pendiente',
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
}

export class EvaluacionPeriodo {
  id: string;
  actividadId: string; // Associated activity
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  fechaCreacion: Date;
  profesorId: string; // Professor who created the evaluation
  evaluacionEntrePares: boolean;
  permitirAutoEvaluacion: boolean; // Allow self-evaluation
  criteriosEvaluacion: string[]; // List of selected criteria
  estado: EstadoEvaluacionPeriodo;
  habilitarComentarios: boolean;
  puntuacionMaxima: number;
  fechaActualizacion?: Date;

  constructor(params: {
    id: string;
    actividadId: string;
    titulo: string;
    descripcion?: string;
    fechaInicio: Date;
    fechaFin?: Date;
    fechaCreacion: Date;
    profesorId: string;
    evaluacionEntrePares?: boolean;
    permitirAutoEvaluacion?: boolean;
    criteriosEvaluacion: string[];
    estado?: EstadoEvaluacionPeriodo;
    habilitarComentarios?: boolean;
    puntuacionMaxima?: number;
    fechaActualizacion?: Date;
  }) {
    this.id = params.id;
    this.actividadId = params.actividadId;
    this.titulo = params.titulo;
    this.descripcion = params.descripcion;
    this.fechaInicio = params.fechaInicio;
    this.fechaFin = params.fechaFin;
    this.fechaCreacion = params.fechaCreacion;
    this.profesorId = params.profesorId;
    this.evaluacionEntrePares = params.evaluacionEntrePares ?? true;
    this.permitirAutoEvaluacion = params.permitirAutoEvaluacion ?? false;
    this.criteriosEvaluacion = params.criteriosEvaluacion;
    this.estado = params.estado ?? EstadoEvaluacionPeriodo.PENDIENTE;
    this.habilitarComentarios = params.habilitarComentarios ?? true;
    this.puntuacionMaxima = params.puntuacionMaxima ?? 5.0;
    this.fechaActualizacion = params.fechaActualizacion;
  }

  copyWith(params: Partial<{
    id: string;
    actividadId: string;
    titulo: string;
    descripcion: string;
    fechaInicio: Date;
    fechaFin: Date;
    fechaCreacion: Date;
    profesorId: string;
    evaluacionEntrePares: boolean;
    permitirAutoEvaluacion: boolean;
    criteriosEvaluacion: string[];
    estado: EstadoEvaluacionPeriodo;
    habilitarComentarios: boolean;
    puntuacionMaxima: number;
    fechaActualizacion: Date;
  }>): EvaluacionPeriodo {
    return new EvaluacionPeriodo({
      id: params.id ?? this.id,
      actividadId: params.actividadId ?? this.actividadId,
      titulo: params.titulo ?? this.titulo,
      descripcion: params.descripcion ?? this.descripcion,
      fechaInicio: params.fechaInicio ?? this.fechaInicio,
      fechaFin: params.fechaFin ?? this.fechaFin,
      fechaCreacion: params.fechaCreacion ?? this.fechaCreacion,
      profesorId: params.profesorId ?? this.profesorId,
      evaluacionEntrePares: params.evaluacionEntrePares ?? this.evaluacionEntrePares,
      permitirAutoEvaluacion: params.permitirAutoEvaluacion ?? this.permitirAutoEvaluacion,
      criteriosEvaluacion: params.criteriosEvaluacion ?? this.criteriosEvaluacion,
      estado: params.estado ?? this.estado,
      habilitarComentarios: params.habilitarComentarios ?? this.habilitarComentarios,
      puntuacionMaxima: params.puntuacionMaxima ?? this.puntuacionMaxima,
      fechaActualizacion: params.fechaActualizacion ?? this.fechaActualizacion,
    });
  }

  toJson(): Record<string, any> {
    return {
      id: this.id,
      actividadId: this.actividadId,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fechaInicio: this.fechaInicio.toISOString(),
      fechaFin: this.fechaFin?.toISOString(),
      fechaCreacion: this.fechaCreacion.toISOString(),
      profesorId: this.profesorId,
      evaluacionEntrePares: this.evaluacionEntrePares,
      permitirAutoEvaluacion: this.permitirAutoEvaluacion,
      criteriosEvaluacion: this.criteriosEvaluacion,
      estado: this.estado,
      habilitarComentarios: this.habilitarComentarios,
      puntuacionMaxima: this.puntuacionMaxima,
      fechaActualizacion: this.fechaActualizacion?.toISOString(),
    };
  }

  static fromJson(json: Record<string, any>): EvaluacionPeriodo {
    return new EvaluacionPeriodo({
      id: json.id?.toString() ?? '',
      actividadId: json.actividadId?.toString() ?? '',
      titulo: json.titulo?.toString() ?? '',
      descripcion: json.descripcion?.toString(),
      fechaInicio: json.fechaInicio ? new Date(json.fechaInicio) : new Date(),
      fechaFin: json.fechaFin ? new Date(json.fechaFin) : undefined,
      fechaCreacion: json.fechaCreacion ? new Date(json.fechaCreacion) : new Date(),
      profesorId: json.profesorId?.toString() ?? '',
      evaluacionEntrePares: json.evaluacionEntrePares === true,
      permitirAutoEvaluacion: json.permitirAutoEvaluacion === true,
      criteriosEvaluacion: Array.isArray(json.criteriosEvaluacion)
        ? json.criteriosEvaluacion.map((c: any) => c.toString())
        : [],
      estado: json.estado as EstadoEvaluacionPeriodo ?? EstadoEvaluacionPeriodo.PENDIENTE,
      habilitarComentarios: json.habilitarComentarios !== false,
      puntuacionMaxima: json.puntuacionMaxima ? parseFloat(json.puntuacionMaxima) : 5.0,
      fechaActualizacion: json.fechaActualizacion ? new Date(json.fechaActualizacion) : undefined,
    });
  }

  toString(): string {
    return `EvaluacionPeriodo(id: ${this.id}, titulo: ${this.titulo}, estado: ${this.estado})`;
  }
}

export default EvaluacionPeriodo;
