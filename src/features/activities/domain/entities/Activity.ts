/**
 * Activity Entity
 * 
 * Represents an activity/task in the application.
 * Equivalent to Flutter's Activity.
 */
export class Activity {
    id?: number; // ID local convertido del String de Roble
    robleId?: string; // ID original de Roble (String)
    categoriaId: number; // Referencia a categoría
    nombre: string;
    descripcion: string;
    fechaEntrega: Date;
    creadoEn?: Date;
    archivoAdjunto?: string; // Para archivos adjuntos
    activo: boolean; // Para soft delete

    constructor(params: {
        id?: number;
        robleId?: string;
        categoriaId: number;
        nombre: string;
        descripcion: string;
        fechaEntrega: Date;
        creadoEn?: Date;
        archivoAdjunto?: string;
        activo?: boolean;
    }) {
        this.id = params.id;
        this.robleId = params.robleId;
        this.categoriaId = params.categoriaId;
        this.nombre = params.nombre;
        this.descripcion = params.descripcion;
        this.fechaEntrega = params.fechaEntrega;
        this.creadoEn = params.creadoEn ?? new Date();
        this.archivoAdjunto = params.archivoAdjunto;
        this.activo = params.activo ?? true;
    }

    /**
     * Create a copy with updated fields
     */
    copyWith(params: Partial<{
        id: number;
        robleId: string;
        categoriaId: number;
        nombre: string;
        descripcion: string;
        fechaEntrega: Date;
        creadoEn: Date;
        archivoAdjunto: string;
        activo: boolean;
    }>): Activity {
        return new Activity({
            id: params.id ?? this.id,
            robleId: params.robleId ?? this.robleId,
            categoriaId: params.categoriaId ?? this.categoriaId,
            nombre: params.nombre ?? this.nombre,
            descripcion: params.descripcion ?? this.descripcion,
            fechaEntrega: params.fechaEntrega ?? this.fechaEntrega,
            creadoEn: params.creadoEn ?? this.creadoEn,
            archivoAdjunto: params.archivoAdjunto ?? this.archivoAdjunto,
            activo: params.activo ?? this.activo,
        });
    }

    /**
     * Convert to JSON
     */
    toJson(): Record<string, any> {
        return {
            id: this.robleId,
            categoria_id: this.categoriaId,
            nombre: this.nombre,
            descripcion: this.descripcion,
            fecha_entrega: this.fechaEntrega.toISOString(),
            creado_en: this.creadoEn?.toISOString(),
            archivo_adjunto: this.archivoAdjunto ?? '',
            activo: this.activo,
        };
    }

    /**
     * Create from JSON
     */
    static fromJson(json: Record<string, any>): Activity {
        return new Activity({
            robleId: json._id?.toString() ?? json.id?.toString(),
            categoriaId: typeof json.categoria_id === 'string'
                ? parseInt(json.categoria_id, 10) || 0
                : json.categoria_id ?? 0,
            nombre: json.nombre?.toString() ?? '',
            descripcion: json.descripcion?.toString() ?? '',
            fechaEntrega: json.fecha_entrega
                ? new Date(json.fecha_entrega)
                : new Date(),
            creadoEn: json.creado_en ? new Date(json.creado_en) : undefined,
            archivoAdjunto: json.archivo_adjunto?.toString(),
            activo: json.activo === true || json.activo === 'true',
        });
    }

    toString(): string {
        return `Activity(id: ${this.id}, robleId: ${this.robleId}, nombre: ${this.nombre}, categoriaId: ${this.categoriaId})`;
    }
}

export default Activity;
