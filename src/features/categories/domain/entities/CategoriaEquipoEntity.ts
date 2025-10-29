/**
 * CategoriaEquipo Entity
 * 
 * Represents a team category within a course.
 * Used to organize students into teams for activities.
 */

import { TipoAsignacion } from './TipoAsignacion';

export class CategoriaEquipo {
    id?: number; // ID local convertido del String de Roble
    robleId?: string; // ID original de Roble (String)
    nombre: string;
    cursoId: number;
    tipoAsignacion: TipoAsignacion;
    maxEstudiantesPorEquipo: number;
    equiposIds: number[];
    creadoEn: Date;
    equiposGenerados: boolean;
    descripcion?: string;

    constructor(params: {
        id?: number;
        robleId?: string;
        nombre: string;
        cursoId: number;
        tipoAsignacion: TipoAsignacion;
        maxEstudiantesPorEquipo?: number;
        equiposIds?: number[];
        creadoEn?: Date;
        equiposGenerados?: boolean;
        descripcion?: string;
    }) {
        this.id = params.id;
        this.robleId = params.robleId;
        this.nombre = params.nombre;
        this.cursoId = params.cursoId;
        this.tipoAsignacion = params.tipoAsignacion;
        this.maxEstudiantesPorEquipo = params.maxEstudiantesPorEquipo ?? 4;
        this.equiposIds = params.equiposIds ?? [];
        this.creadoEn = params.creadoEn ?? new Date();
        this.equiposGenerados = params.equiposGenerados ?? false;
        this.descripcion = params.descripcion;
    }

    copyWith(params: Partial<{
        id: number;
        robleId: string;
        nombre: string;
        cursoId: number;
        tipoAsignacion: TipoAsignacion;
        maxEstudiantesPorEquipo: number;
        equiposIds: number[];
        creadoEn: Date;
        equiposGenerados: boolean;
        descripcion: string;
    }>): CategoriaEquipo {
        return new CategoriaEquipo({
            id: params.id ?? this.id,
            robleId: params.robleId ?? this.robleId,
            nombre: params.nombre ?? this.nombre,
            cursoId: params.cursoId ?? this.cursoId,
            tipoAsignacion: params.tipoAsignacion ?? this.tipoAsignacion,
            maxEstudiantesPorEquipo: params.maxEstudiantesPorEquipo ?? this.maxEstudiantesPorEquipo,
            equiposIds: params.equiposIds ?? this.equiposIds,
            creadoEn: params.creadoEn ?? this.creadoEn,
            equiposGenerados: params.equiposGenerados ?? this.equiposGenerados,
            descripcion: params.descripcion ?? this.descripcion,
        });
    }

    toJson(): Record<string, any> {
        return {
            id: this.robleId,
            nombre: this.nombre,
            cursoId: this.cursoId,
            tipoAsignacion: this.tipoAsignacion,
            maxEstudiantesPorEquipo: this.maxEstudiantesPorEquipo,
            equiposIds: this.equiposIds,
            creadoEn: this.creadoEn.toISOString(),
            equiposGenerados: this.equiposGenerados,
            descripcion: this.descripcion,
        };
    }

    static fromJson(json: Record<string, any>): CategoriaEquipo {
        return new CategoriaEquipo({
            robleId: json._id?.toString() ?? json.id?.toString(),
            nombre: json.nombre?.toString() ?? '',
            cursoId: typeof json.cursoId === 'string'
                ? parseInt(json.cursoId, 10) || 0
                : json.cursoId ?? 0,
            tipoAsignacion: json.tipoAsignacion === 'aleatoria'
                ? TipoAsignacion.ALEATORIA
                : TipoAsignacion.MANUAL,
            maxEstudiantesPorEquipo: json.maxEstudiantesPorEquipo ?? 4,
            equiposIds: Array.isArray(json.equiposIds)
                ? json.equiposIds.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
                : [],
            creadoEn: json.creadoEn ? new Date(json.creadoEn) : new Date(),
            equiposGenerados: json.equiposGenerados === true,
            descripcion: json.descripcion?.toString(),
        });
    }

    toString(): string {
        return `CategoriaEquipo(id: ${this.id}, nombre: ${this.nombre}, cursoId: ${this.cursoId})`;
    }
}

export default CategoriaEquipo;
