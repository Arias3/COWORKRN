/**
 * EquipoActividad Entity
 * 
 * Represents an activity assignment to a team.
 * Tracks status, grades, and completion dates.
 */

export class EquipoActividad {
    id?: string; // String para Roble (ObjectId)
    equipoId: number;
    actividadId: string; // String para mantener consistencia con Activity
    asignadoEn: Date;
    fechaEntrega?: Date;
    estado: string; // 'pendiente', 'en_progreso', 'completada', 'vencida'
    comentarioProfesor?: string;
    calificacion?: number;
    fechaCompletada?: Date;

    constructor(params: {
        id?: string;
        equipoId: number;
        actividadId: string;
        asignadoEn?: Date;
        fechaEntrega?: Date;
        estado?: string;
        comentarioProfesor?: string;
        calificacion?: number;
        fechaCompletada?: Date;
    }) {
        this.id = params.id;
        this.equipoId = params.equipoId;
        this.actividadId = params.actividadId;
        this.asignadoEn = params.asignadoEn ?? new Date();
        this.fechaEntrega = params.fechaEntrega;
        this.estado = params.estado ?? 'pendiente';
        this.comentarioProfesor = params.comentarioProfesor;
        this.calificacion = params.calificacion;
        this.fechaCompletada = params.fechaCompletada;
    }

    copyWith(params: Partial<{
        id: string;
        equipoId: number;
        actividadId: string;
        asignadoEn: Date;
        fechaEntrega: Date;
        estado: string;
        comentarioProfesor: string;
        calificacion: number;
        fechaCompletada: Date;
    }>): EquipoActividad {
        return new EquipoActividad({
            id: params.id ?? this.id,
            equipoId: params.equipoId ?? this.equipoId,
            actividadId: params.actividadId ?? this.actividadId,
            asignadoEn: params.asignadoEn ?? this.asignadoEn,
            fechaEntrega: params.fechaEntrega ?? this.fechaEntrega,
            estado: params.estado ?? this.estado,
            comentarioProfesor: params.comentarioProfesor ?? this.comentarioProfesor,
            calificacion: params.calificacion ?? this.calificacion,
            fechaCompletada: params.fechaCompletada ?? this.fechaCompletada,
        });
    }

    toJson(): Record<string, any> {
        return {
            id: this.id,
            equipoId: this.equipoId,
            actividadId: this.actividadId,
            asignadoEn: this.asignadoEn.toISOString(),
            fechaEntrega: this.fechaEntrega?.toISOString(),
            estado: this.estado,
            comentarioProfesor: this.comentarioProfesor,
            calificacion: this.calificacion,
            fechaCompletada: this.fechaCompletada?.toISOString(),
        };
    }

    static fromJson(json: Record<string, any>): EquipoActividad {
        return new EquipoActividad({
            id: json._id?.toString() ?? json.id?.toString(),
            equipoId: typeof json.equipoId === 'string'
                ? parseInt(json.equipoId, 10) || 0
                : json.equipoId ?? 0,
            actividadId: json.actividadId?.toString() ?? '',
            asignadoEn: json.asignadoEn ? new Date(json.asignadoEn) : new Date(),
            fechaEntrega: json.fechaEntrega ? new Date(json.fechaEntrega) : undefined,
            estado: json.estado?.toString() ?? 'pendiente',
            comentarioProfesor: json.comentarioProfesor?.toString(),
            calificacion: json.calificacion ? parseFloat(json.calificacion) : undefined,
            fechaCompletada: json.fechaCompletada ? new Date(json.fechaCompletada) : undefined,
        });
    }

    toString(): string {
        return `EquipoActividad(id: ${this.id}, equipoId: ${this.equipoId}, actividadId: ${this.actividadId})`;
    }
}

export default EquipoActividad;
