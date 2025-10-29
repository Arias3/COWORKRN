import Inscripcion from '../../domain/entities/InscripcionEntity';

/**
 * RobleInscripcionDto
 * 
 * Data Transfer Object for enrollment data from Roble API.
 */
export class RobleInscripcionDto {
    id?: number;
    usuarioId: number;
    cursoId: number;
    fechaInscripcion: string;

    constructor(params: {
        id?: number;
        usuarioId: number;
        cursoId: number;
        fechaInscripcion: string;
    }) {
        this.id = params.id;
        this.usuarioId = params.usuarioId;
        this.cursoId = params.cursoId;
        this.fechaInscripcion = params.fechaInscripcion;
    }

    /**
     * Convert to JSON
     */
    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            usuario_id: this.usuarioId,
            curso_id: this.cursoId,
            fecha_inscripcion: this.fechaInscripcion,
        };

        if (this.id != null) {
            json.id = this.id;
        }

        return json;
    }

    /**
     * Create from JSON
     */
    static fromJson(json: Record<string, any>): RobleInscripcionDto {
        return new RobleInscripcionDto({
            id: json.id,
            usuarioId: json.usuario_id,
            cursoId: json.curso_id,
            fechaInscripcion: json.fecha_inscripcion,
        });
    }

    /**
     * Create from entity
     */
    static fromEntity(inscripcion: Inscripcion): RobleInscripcionDto {
        return new RobleInscripcionDto({
            id: inscripcion.id,
            usuarioId: inscripcion.usuarioId,
            cursoId: inscripcion.cursoId,
            fechaInscripcion: inscripcion.fechaInscripcion.toISOString(),
        });
    }

    /**
     * Convert to entity
     */
    toEntity(): Inscripcion {
        return new Inscripcion({
            id: this.id,
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            fechaInscripcion: new Date(this.fechaInscripcion),
        });
    }
}

export default RobleInscripcionDto;
