/**
 * RobleEquipoDTO
 * 
 * Data Transfer Object for Equipo from Roble API.
 */

import { Equipo } from '../../domain/entities/EquipoEntity';

export class RobleEquipoDTO {
    id?: string;
    nombre: string;
    categoriaId: number;
    estudiantesIds: number[];
    creadoEn: string;
    descripcion?: string;
    color?: string;

    constructor(params: {
        id?: string;
        nombre: string;
        categoriaId: number;
        estudiantesIds: number[];
        creadoEn: string;
        descripcion?: string;
        color?: string;
    }) {
        this.id = params.id;
        this.nombre = params.nombre;
        this.categoriaId = params.categoriaId;
        this.estudiantesIds = params.estudiantesIds;
        this.creadoEn = params.creadoEn;
        this.descripcion = params.descripcion;
        this.color = params.color;
    }

    static fromJson(json: Record<string, any>): RobleEquipoDTO {
        const rawId = json._id ?? json.id;

        let categoriaId = 0;
        if (typeof json.categoria_id === 'number') {
            categoriaId = json.categoria_id;
        } else if (typeof json.categoria_id === 'string') {
            categoriaId = parseInt(json.categoria_id, 10) || 0;
        }

        let estudiantesIds: number[] = [];
        if (typeof json.estudiantes_ids === 'string' && json.estudiantes_ids.length > 0) {
            estudiantesIds = json.estudiantes_ids
                .split(',')
                .map((e: string) => parseInt(e.trim(), 10))
                .filter((id: number) => !isNaN(id) && id > 0);
        }

        return new RobleEquipoDTO({
            id: rawId?.toString(),
            nombre: json.nombre?.toString() ?? '',
            categoriaId,
            estudiantesIds,
            creadoEn: json.creado_en?.toString() ?? new Date().toISOString(),
            descripcion: json.descripcion?.toString(),
            color: json.color?.toString(),
        });
    }

    static fromEntity(equipo: Equipo): RobleEquipoDTO {
        return new RobleEquipoDTO({
            id: equipo.robleId,
            nombre: equipo.nombre,
            categoriaId: equipo.categoriaId,
            estudiantesIds: equipo.estudiantesIds,
            creadoEn: equipo.creadoEn.toISOString(),
            descripcion: equipo.descripcion,
            color: equipo.color,
        });
    }

    toEntity(): Equipo {
        let localId: number | undefined;
        if (this.id && this.id.length > 0) {
            localId = RobleEquipoDTO.generateConsistentId(this.id);
        }

        return new Equipo({
            id: localId,
            robleId: this.id,
            nombre: this.nombre,
            categoriaId: this.categoriaId,
            estudiantesIds: this.estudiantesIds,
            creadoEn: this.creadoEn ? new Date(this.creadoEn) : new Date(),
            descripcion: this.descripcion,
            color: this.color,
        });
    }

    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            nombre: this.nombre,
            categoria_id: this.categoriaId,
            estudiantes_ids: this.estudiantesIds.join(','),
            creado_en: this.creadoEn,
            descripcion: this.descripcion ?? '',
            color: this.color ?? '',
        };

        if (this.id) {
            json._id = this.id;
        }

        return json;
    }

    static generateConsistentId(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) & 0x7FFFFFFF;
        }
        return hash === 0 ? 1 : hash;
    }
}

export default RobleEquipoDTO;
