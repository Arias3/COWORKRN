/**
 * Equipo Entity
 * 
 * Represents a team within a category.
 * Contains list of student IDs assigned to this team.
 */

export class Equipo {
    id?: number; // ID local convertido del String de Roble
    robleId?: string; // ID original de Roble (String)
    nombre: string;
    categoriaId: number;
    estudiantesIds: number[];
    creadoEn: Date;
    descripcion?: string;
    color?: string; // Para UI

    constructor(params: {
        id?: number;
        robleId?: string;
        nombre: string;
        categoriaId: number;
        estudiantesIds?: number[];
        creadoEn?: Date;
        descripcion?: string;
        color?: string;
    }) {
        this.id = params.id;
        this.robleId = params.robleId;
        this.nombre = params.nombre;
        this.categoriaId = params.categoriaId;
        this.estudiantesIds = params.estudiantesIds ?? [];
        this.creadoEn = params.creadoEn ?? new Date();
        this.descripcion = params.descripcion;
        this.color = params.color;
    }

    copyWith(params: Partial<{
        id: number;
        robleId: string;
        nombre: string;
        categoriaId: number;
        estudiantesIds: number[];
        creadoEn: Date;
        descripcion: string;
        color: string;
    }>): Equipo {
        return new Equipo({
            id: params.id ?? this.id,
            robleId: params.robleId ?? this.robleId,
            nombre: params.nombre ?? this.nombre,
            categoriaId: params.categoriaId ?? this.categoriaId,
            estudiantesIds: params.estudiantesIds ?? this.estudiantesIds,
            creadoEn: params.creadoEn ?? this.creadoEn,
            descripcion: params.descripcion ?? this.descripcion,
            color: params.color ?? this.color,
        });
    }

    toJson(): Record<string, any> {
        return {
            id: this.robleId,
            nombre: this.nombre,
            categoriaId: this.categoriaId,
            estudiantesIds: this.estudiantesIds,
            creadoEn: this.creadoEn.toISOString(),
            descripcion: this.descripcion,
            color: this.color,
        };
    }

    static fromJson(json: Record<string, any>): Equipo {
        return new Equipo({
            robleId: json._id?.toString() ?? json.id?.toString(),
            nombre: json.nombre?.toString() ?? '',
            categoriaId: typeof json.categoriaId === 'string'
                ? parseInt(json.categoriaId, 10) || 0
                : json.categoriaId ?? 0,
            estudiantesIds: Array.isArray(json.estudiantesIds)
                ? json.estudiantesIds.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
                : [],
            creadoEn: json.creadoEn ? new Date(json.creadoEn) : new Date(),
            descripcion: json.descripcion?.toString(),
            color: json.color?.toString(),
        });
    }

    toString(): string {
        return `Equipo(id: ${this.id}, nombre: ${this.nombre}, categoriaId: ${this.categoriaId})`;
    }
}

export default Equipo;
