/**
 * Roble Activity DTO
 * 
 * Data Transfer Object for activities from Roble API.
 * Handles JSON serialization/deserialization and entity conversion.
 */

import { Activity } from '../../domain/entities/Activity';

export class RobleActivityDTO {
    id?: string; // Roble ID (String)
    categoriaId: number;
    nombre: string;
    descripcion: string;
    fechaEntrega: string; // ISO string
    creadoEn?: string; // ISO string
    archivoAdjunto: string;
    activo: boolean;

    constructor(params: {
        id?: string;
        categoriaId: number;
        nombre: string;
        descripcion: string;
        fechaEntrega: string;
        creadoEn?: string;
        archivoAdjunto?: string;
        activo?: boolean;
    }) {
        this.id = params.id;
        this.categoriaId = params.categoriaId;
        this.nombre = params.nombre;
        this.descripcion = params.descripcion;
        this.fechaEntrega = params.fechaEntrega;
        this.creadoEn = params.creadoEn;
        this.archivoAdjunto = params.archivoAdjunto ?? '';
        this.activo = params.activo ?? true;
    }

    /**
     * Create DTO from Roble JSON response
     */
    static fromJson(json: Record<string, any>): RobleActivityDTO {
        console.log('🔍 [DTO] Parseando actividad desde JSON:', json);

        try {
            const dto = new RobleActivityDTO({
                id: json._id?.toString() ?? json.id?.toString(),
                categoriaId: typeof json.category_id === 'string'
                    ? parseInt(json.category_id, 10) || 0
                    : json.category_id ?? 0,
                nombre: json.name?.toString() ?? '',
                descripcion: json.description?.toString() ?? '',
                fechaEntrega: json.delivery_date?.toString() ?? new Date().toISOString(),
                creadoEn: json.creado_en?.toString(),
                archivoAdjunto: json.archivo_adjunto?.toString() ?? '',
                activo: json.activo === true || json.activo === 'true',
            });

            console.log(`✅ [DTO] Actividad parseada: ${dto.nombre} (ID: ${dto.id})`);
            return dto;
        } catch (e) {
            console.error('❌ [DTO] Error parseando actividad:', e);
            console.error('❌ [DTO] JSON problemático:', json);
            throw e;
        }
    }

    /**
     * Create DTO from Activity entity
     */
    static fromEntity(activity: Activity): RobleActivityDTO {
        return new RobleActivityDTO({
            id: activity.robleId,
            categoriaId: activity.categoriaId,
            nombre: activity.nombre,
            descripcion: activity.descripcion,
            fechaEntrega: activity.fechaEntrega.toISOString(),
            creadoEn: activity.creadoEn?.toISOString(),
            archivoAdjunto: activity.archivoAdjunto ?? '',
            activo: activity.activo,
        });
    }

    /**
     * Convert DTO to Activity entity
     * Generates consistent local ID from Roble string ID
     */
    toEntity(): Activity {
        try {
            console.log('🔄 [DTO] Convirtiendo DTO a Activity...');
            console.log(`   - Roble ID: "${this.id}"`);
            console.log(`   - Nombre: "${this.nombre}"`);
            console.log(`   - Categoría ID: ${this.categoriaId}`);

            // Generate consistent local ID
            let localId: number | undefined;
            if (this.id && this.id.length > 0) {
                localId = RobleActivityDTO.generateConsistentId(this.id);
            }

            const activity = new Activity({
                id: localId,
                robleId: this.id,
                categoriaId: this.categoriaId,
                nombre: this.nombre,
                descripcion: this.descripcion,
                fechaEntrega: this.fechaEntrega ? new Date(this.fechaEntrega) : new Date(),
                creadoEn: this.creadoEn ? new Date(this.creadoEn) : undefined,
                archivoAdjunto: this.archivoAdjunto.length === 0 ? undefined : this.archivoAdjunto,
                activo: this.activo,
            });

            console.log(`✅ [DTO] Entidad creada: ${activity.nombre} (ID: ${activity.id})`);
            return activity;
        } catch (e) {
            console.error('❌ [DTO] Error convirtiendo a entidad:', e);
            throw e;
        }
    }

    /**
     * Convert DTO to JSON for Roble API
     */
    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            category_id: this.categoriaId,
            name: this.nombre,
            description: this.descripcion,
            delivery_date: this.fechaEntrega,
            creado_en: this.creadoEn ?? new Date().toISOString(),
            archivo_adjunto: this.archivoAdjunto,
            activo: this.activo,
        };

        if (this.id) {
            json._id = this.id;
        }

        return json;
    }

    /**
     * Generate consistent numeric ID from string
     * Uses deterministic hash function for cross-platform consistency
     */
    static generateConsistentId(input: string): number {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) & 0x7FFFFFFF;
        }
        return hash === 0 ? 1 : hash; // Avoid 0
    }

    toString(): string {
        return `RobleActivityDTO(id: ${this.id}, nombre: ${this.nombre}, categoriaId: ${this.categoriaId})`;
    }
}

export default RobleActivityDTO;
