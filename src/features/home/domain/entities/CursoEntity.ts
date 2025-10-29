/**
 * CursoDomain Entity
 * 
 * Represents a course in the application.
 * Equivalent to Flutter's CursoDomain.
 */
export class CursoDomain {
    id: number;
    nombre: string;
    descripcion: string;
    codigoRegistro: string;
    profesorId?: number;
    creadoEn?: Date;
    categorias: string[];
    imagen?: string;
    estudiantesNombres: string[];
    fechaCreacion: Date;
    isOfflineOnly: boolean;
    lastSyncAttempt?: Date;

    constructor(params: {
        id?: number;
        nombre: string;
        descripcion?: string;
        codigoRegistro: string;
        profesorId?: number;
        creadoEn?: Date;
        categorias?: string[];
        imagen?: string;
        estudiantesNombres?: string[];
        fechaCreacion?: Date;
        isOfflineOnly?: boolean;
        lastSyncAttempt?: Date;
    }) {
        this.id = params.id ?? 0;
        this.nombre = params.nombre;
        this.descripcion = params.descripcion ?? '';
        this.codigoRegistro = params.codigoRegistro;
        this.profesorId = params.profesorId;
        this.creadoEn = params.creadoEn;
        this.categorias = params.categorias ?? [];
        this.imagen = params.imagen;
        this.estudiantesNombres = params.estudiantesNombres ?? [];
        this.fechaCreacion = params.fechaCreacion ?? new Date();
        this.isOfflineOnly = params.isOfflineOnly ?? false;
        this.lastSyncAttempt = params.lastSyncAttempt;
    }

    /**
     * Create a copy with updated fields
     */
    copyWith(params: Partial<{
        id: number;
        nombre: string;
        descripcion: string;
        codigoRegistro: string;
        profesorId: number;
        creadoEn: Date;
        categorias: string[];
        imagen: string;
        estudiantesNombres: string[];
        fechaCreacion: Date;
        isOfflineOnly: boolean;
        lastSyncAttempt: Date;
    }>): CursoDomain {
        return new CursoDomain({
            id: params.id ?? this.id,
            nombre: params.nombre ?? this.nombre,
            descripcion: params.descripcion ?? this.descripcion,
            codigoRegistro: params.codigoRegistro ?? this.codigoRegistro,
            profesorId: params.profesorId ?? this.profesorId,
            creadoEn: params.creadoEn ?? this.creadoEn,
            categorias: params.categorias ?? this.categorias,
            imagen: params.imagen ?? this.imagen,
            estudiantesNombres: params.estudiantesNombres ?? this.estudiantesNombres,
            fechaCreacion: params.fechaCreacion ?? this.fechaCreacion,
            isOfflineOnly: params.isOfflineOnly ?? this.isOfflineOnly,
            lastSyncAttempt: params.lastSyncAttempt ?? this.lastSyncAttempt,
        });
    }

    /**
     * Convert to JSON
     */
    toJson(): Record<string, any> {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            codigo_registro: this.codigoRegistro,
            profesor_id: this.profesorId,
            creado_en: this.creadoEn?.toISOString(),
            categorias: this.categorias,
            imagen: this.imagen,
            estudiantes_nombres: this.estudiantesNombres,
            fecha_creacion: this.fechaCreacion.toISOString(),
            is_offline_only: this.isOfflineOnly,
            last_sync_attempt: this.lastSyncAttempt?.toISOString(),
        };
    }

    /**
     * Create from JSON
     */
    static fromJson(json: Record<string, any>): CursoDomain {
        return new CursoDomain({
            id: json.id ?? 0,
            nombre: json.nombre ?? '',
            descripcion: json.descripcion ?? '',
            codigoRegistro: json.codigo_registro ?? '',
            profesorId: json.profesor_id,
            creadoEn: json.creado_en ? new Date(json.creado_en) : undefined,
            categorias: json.categorias ? Array.from(json.categorias) : [],
            imagen: json.imagen,
            estudiantesNombres: json.estudiantes_nombres ? Array.from(json.estudiantes_nombres) : [],
            fechaCreacion: json.fecha_creacion ? new Date(json.fecha_creacion) : new Date(),
            isOfflineOnly: json.is_offline_only ?? false,
            lastSyncAttempt: json.last_sync_attempt ? new Date(json.last_sync_attempt) : undefined,
        });
    }

    toString(): string {
        return `CursoDomain(id: ${this.id}, nombre: ${this.nombre}, codigo: ${this.codigoRegistro}, offline: ${this.isOfflineOnly})`;
    }
}

export default CursoDomain;
