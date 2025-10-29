/**
 * RobleCategoriaEquipoDTO
 * 
 * Data Transfer Object for CategoriaEquipo from Roble API.
 */

import { CategoriaEquipo } from '../../domain/entities/CategoriaEquipoEntity';
import { TipoAsignacion } from '../../domain/entities/TipoAsignacion';

export class RobleCategoriaEquipoDTO {
    id?: string;
    nombre: string;
    cursoId: number;
    tipoAsignacion: string;
    maxEstudiantesPorEquipo: number;
    equiposIds: number[];
    creadoEn: string;
    equiposGenerados: boolean;
    descripcion?: string;

    constructor(params: {
        id?: string;
        nombre: string;
        cursoId: number;
        tipoAsignacion: string;
        maxEstudiantesPorEquipo: number;
        equiposIds: number[];
        creadoEn: string;
        equiposGenerados: boolean;
        descripcion?: string;
    }) {
        this.id = params.id;
        this.nombre = params.nombre;
        this.cursoId = params.cursoId;
        this.tipoAsignacion = params.tipoAsignacion;
        this.maxEstudiantesPorEquipo = params.maxEstudiantesPorEquipo;
        this.equiposIds = params.equiposIds;
        this.creadoEn = params.creadoEn;
        this.equiposGenerados = params.equiposGenerados;
        this.descripcion = params.descripcion;
    }

    static fromJson(json: Record<string, any>): RobleCategoriaEquipoDTO {
        console.log('🔍 [DTO] Parseando categoría desde JSON:', json);

        try {
            const rawId = json._id ?? json.id;
            const idString = rawId?.toString();

            // Manejo seguro de curso_id
            let cursoId = 0;
            if (typeof json.curso_id === 'number') {
                cursoId = json.curso_id;
            } else if (typeof json.curso_id === 'string') {
                cursoId = parseInt(json.curso_id, 10) || 0;
            }

            // Manejo seguro de max_estudiantes_por_equipo
            let maxEstudiantes = 4;
            if (typeof json.max_estudiantes_por_equipo === 'number') {
                maxEstudiantes = json.max_estudiantes_por_equipo;
            } else if (typeof json.max_estudiantes_por_equipo === 'string') {
                maxEstudiantes = parseInt(json.max_estudiantes_por_equipo, 10) || 4;
            }

            // Manejo seguro de equipos_ids
            let equiposIds: number[] = [];
            if (typeof json.equipos_ids === 'string' && json.equipos_ids.length > 0) {
                try {
                    equiposIds = json.equipos_ids
                        .split(',')
                        .map((e: string) => parseInt(e.trim(), 10))
                        .filter((id: number) => !isNaN(id) && id > 0);
                } catch (e) {
                    console.warn('⚠️ [DTO] Error parseando equipos_ids:', e);
                    equiposIds = [];
                }
            }

            // Manejo seguro de equipos_generados
            let equiposGenerados = false;
            if (typeof json.equipos_generados === 'boolean') {
                equiposGenerados = json.equipos_generados;
            } else if (typeof json.equipos_generados === 'string') {
                equiposGenerados = json.equipos_generados.toLowerCase() === 'true';
            } else if (typeof json.equipos_generados === 'number') {
                equiposGenerados = json.equipos_generados === 1;
            }

            const dto = new RobleCategoriaEquipoDTO({
                id: idString,
                nombre: json.nombre?.toString() ?? '',
                cursoId,
                tipoAsignacion: json.tipo_asignacion?.toString() ?? 'manual',
                maxEstudiantesPorEquipo: maxEstudiantes,
                equiposIds,
                creadoEn: json.creado_en?.toString() ?? new Date().toISOString(),
                equiposGenerados,
                descripcion: json.descripcion?.toString(),
            });

            console.log(`✅ [DTO] Categoría parseada: ${dto.nombre}`);
            return dto;
        } catch (e) {
            console.error('❌ [DTO] Error parseando categoría:', e);
            throw e;
        }
    }

    static fromEntity(categoria: CategoriaEquipo): RobleCategoriaEquipoDTO {
        return new RobleCategoriaEquipoDTO({
            id: categoria.robleId,
            nombre: categoria.nombre,
            cursoId: categoria.cursoId,
            tipoAsignacion: categoria.tipoAsignacion,
            maxEstudiantesPorEquipo: categoria.maxEstudiantesPorEquipo,
            equiposIds: categoria.equiposIds,
            creadoEn: categoria.creadoEn.toISOString(),
            equiposGenerados: categoria.equiposGenerados,
            descripcion: categoria.descripcion,
        });
    }

    toEntity(): CategoriaEquipo {
        try {
            console.log('🔄 [DTO] Convirtiendo DTO a CategoriaEquipo...');

            // Generate consistent local ID
            let localId: number | undefined;
            if (this.id && this.id.length > 0) {
                localId = RobleCategoriaEquipoDTO.generateConsistentId(this.id);
            }

            const categoria = new CategoriaEquipo({
                id: localId,
                robleId: this.id,
                nombre: this.nombre,
                cursoId: this.cursoId,
                tipoAsignacion: this.tipoAsignacion === 'aleatoria'
                    ? TipoAsignacion.ALEATORIA
                    : TipoAsignacion.MANUAL,
                maxEstudiantesPorEquipo: this.maxEstudiantesPorEquipo,
                equiposIds: this.equiposIds,
                creadoEn: this.creadoEn ? new Date(this.creadoEn) : new Date(),
                equiposGenerados: this.equiposGenerados,
                descripcion: this.descripcion,
            });

            console.log(`✅ [DTO] Entidad creada: ${categoria.nombre}`);
            return categoria;
        } catch (e) {
            console.error('❌ [DTO] Error convirtiendo a entidad:', e);
            throw e;
        }
    }

    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            nombre: this.nombre,
            curso_id: this.cursoId,
            tipo_asignacion: this.tipoAsignacion,
            max_estudiantes_por_equipo: this.maxEstudiantesPorEquipo,
            equipos_ids: this.equiposIds.join(','),
            creado_en: this.creadoEn,
            equipos_generados: this.equiposGenerados,
            descripcion: this.descripcion ?? '',
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

    toString(): string {
        return `RobleCategoriaEquipoDTO(id: ${this.id}, nombre: ${this.nombre})`;
    }
}

export default RobleCategoriaEquipoDTO;
