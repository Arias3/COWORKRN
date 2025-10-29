/**
 * EvaluacionIndividual Entity
 * 
 * Represents an individual evaluation from one user to another.
 * Contains ratings for each criterion and optional comments.
 */

export class EvaluacionIndividual {
  id: string;
  evaluacionPeriodoId: string; // Evaluation period ID
  evaluadorId: string; // User who evaluates
  evaluadoId: string; // User being evaluated
  equipoId: string; // Team they belong to
  calificaciones: Record<string, number>; // criterion -> rating
  comentarios?: string;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  completada: boolean;

  constructor(params: {
    id: string;
    evaluacionPeriodoId: string;
    evaluadorId: string;
    evaluadoId: string;
    equipoId: string;
    calificaciones: Record<string, number>;
    comentarios?: string;
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    completada?: boolean;
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
    this.completada = params.completada ?? false;
  }

  copyWith(params: Partial<{
    id: string;
    evaluacionPeriodoId: string;
    evaluadorId: string;
    evaluadoId: string;
    equipoId: string;
    calificaciones: Record<string, number>;
    comentarios: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    completada: boolean;
  }>): EvaluacionIndividual {
    return new EvaluacionIndividual({
      id: params.id ?? this.id,
      evaluacionPeriodoId: params.evaluacionPeriodoId ?? this.evaluacionPeriodoId,
      evaluadorId: params.evaluadorId ?? this.evaluadorId,
      evaluadoId: params.evaluadoId ?? this.evaluadoId,
      equipoId: params.equipoId ?? this.equipoId,
      calificaciones: params.calificaciones ?? { ...this.calificaciones },
      comentarios: params.comentarios ?? this.comentarios,
      fechaCreacion: params.fechaCreacion ?? this.fechaCreacion,
      fechaActualizacion: params.fechaActualizacion ?? this.fechaActualizacion,
      completada: params.completada ?? this.completada,
    });
  }

  toJson(): Record<string, any> {
    return {
      id: this.id,
      evaluacionPeriodoId: this.evaluacionPeriodoId,
      evaluadorId: this.evaluadorId,
      evaluadoId: this.evaluadoId,
      equipoId: this.equipoId,
      calificaciones: this.calificaciones,
      comentarios: this.comentarios,
      fechaCreacion: this.fechaCreacion.toISOString(),
      fechaActualizacion: this.fechaActualizacion?.toISOString(),
      completada: this.completada,
    };
  }

  static fromJson(json: Record<string, any>): EvaluacionIndividual {
    return new EvaluacionIndividual({
      id: json.id?.toString() ?? '',
      evaluacionPeriodoId: json.evaluacionPeriodoId?.toString() ?? '',
      evaluadorId: json.evaluadorId?.toString() ?? '',
      evaluadoId: json.evaluadoId?.toString() ?? '',
      equipoId: json.equipoId?.toString() ?? '',
      calificaciones: json.calificaciones ? { ...json.calificaciones } : {},
      comentarios: json.comentarios?.toString(),
      fechaCreacion: json.fechaCreacion ? new Date(json.fechaCreacion) : new Date(),
      fechaActualizacion: json.fechaActualizacion ? new Date(json.fechaActualizacion) : undefined,
      completada: json.completada === true,
    });
  }

  /**
   * Calculate average rating across all criteria
   */
  promedioCalificacion(): number {
    const valores = Object.values(this.calificaciones);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return suma / valores.length;
  }

  toString(): string {
    return `EvaluacionIndividual(id: ${this.id}, evaluador: ${this.evaluadorId}, evaluado: ${this.evaluadoId})`;
  }
}

export default EvaluacionIndividual;
