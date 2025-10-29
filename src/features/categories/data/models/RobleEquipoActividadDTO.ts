/**
 * RobleEquipoActividadDTO
 * 
 * Data Transfer Object for EquipoActividad from Roble API.
 */

import { EquipoActividad } from '../../domain/entities/EquipoActividadEntity';

export class RobleEquipoActividadDTO {
    id?: string;
    equipoId: number;
    actividadId: string;
    asignadoEn: string;
    fechaEntrega?: string;
    estado: string;
    comentarioProfesor?: string;
    calificacion?: number;
    fechaCompletada?: string;

    constructor(params: {
        id?: string;
        equipoId: number;
        actividadId: string;
        asignadoEn: string;
        fechaEntrega?: string;
        estado: string;
        comentarioProfesor?: string;
        calificacion?: number;
        fechaCompletada?: string;
    }) {
        this.id = params.id;
        this.equipoId = params.equipoId;
        this.actividadId = params.actividadId;
        this.asignadoEn = params.asignadoEn;
        this.fechaEntrega = params.fechaEntrega;
        this.estado = params.estado;
        this.comentarioProfesor = params.comentarioProfesor;
        this.calificacion = params.calificacion;
        this.fechaCompletada = params.fechaCompletada;
    }

    static fromJson(json: Record<string, any>): RobleEquipoActividadDTO {
        const rawId = json._id ?? json.id;

        let equipoId = 0;
        if (typeof json.equipo_id === 'number') {
            equipoId = json.equipo_id;
        } else if (typeof json.equipo_id === 'string') {
            equipoId = parseInt(json.equipo_id, 10) || 0;
        }

        let calificacion: number | undefined;
        if (json.calificacion !== null && json.calificacion !== undefined) {
            calificacion = parseFloat(json.calificacion.toString());
        }

        return new RobleEquipoActividadDTO({
            id: rawId?.toString(),
            equipoId,
            actividadId: json.actividad_id?.toString() ?? '',
            asignadoEn: json.asignado_en?.toString() ?? new Date().toISOString(),
            fechaEntrega: json.fecha_entrega?.toString(),
            estado: json.estado?.toString() ?? 'pendiente',
            comentarioProfesor: json.comentario_profesor?.toString(),
            calificacion,
            fechaCompletada: json.fecha_completada?.toString(),
        });
    }

    static fromEntity(equipoActividad: EquipoActividad): RobleEquipoActividadDTO {
        return new RobleEquipoActividadDTO({
            id: equipoActividad.id,
            equipoId: equipoActividad.equipoId,
            actividadId: equipoActividad.actividadId,
            asignadoEn: equipoActividad.asignadoEn.toISOString(),
            fechaEntrega: equipoActividad.fechaEntrega?.toISOString(),
            estado: equipoActividad.estado,
            comentarioProfesor: equipoActividad.comentarioProfesor,
            calificacion: equipoActividad.calificacion,
            fechaCompletada: equipoActividad.fechaCompletada?.toISOString(),
        });
    }

    toEntity(): EquipoActividad {
        return new EquipoActividad({
            id: this.id,
            equipoId: this.equipoId,
            actividadId: this.actividadId,
            asignadoEn: this.asignadoEn ? new Date(this.asignadoEn) : new Date(),
            fechaEntrega: this.fechaEntrega ? new Date(this.fechaEntrega) : undefined,
            estado: this.estado,
            comentarioProfesor: this.comentarioProfesor,
            calificacion: this.calificacion,
            fechaCompletada: this.fechaCompletada ? new Date(this.fechaCompletada) : undefined,
        });
    }

    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            equipo_id: this.equipoId,
            actividad_id: this.actividadId,
            asignado_en: this.asignadoEn,
            estado: this.estado,
        };

        if (this.id) json._id = this.id;
        if (this.fechaEntrega) json.fecha_entrega = this.fechaEntrega;
        if (this.comentarioProfesor) json.comentario_profesor = this.comentarioProfesor;
        if (this.calificacion !== undefined) json.calificacion = this.calificacion;
        if (this.fechaCompletada) json.fecha_completada = this.fechaCompletada;

        return json;
    }
}

export default RobleEquipoActividadDTO;
