/**
 * Inscripcion Entity
 * 
 * Represents a course enrollment.
 * Equivalent to Flutter's Inscripcion.
 */
export class Inscripcion {
    id?: number;
    usuarioId: number;
    cursoId: number;
    fechaInscripcion: Date;

    constructor(params: {
        id?: number;
        usuarioId: number;
        cursoId: number;
        fechaInscripcion?: Date;
    }) {
        this.id = params.id;
        this.usuarioId = params.usuarioId;
        this.cursoId = params.cursoId;
        this.fechaInscripcion = params.fechaInscripcion ?? new Date();
    }

    /**
     * Convert to JSON
     */
    toJson(): Record<string, any> {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            cursoId: this.cursoId,
            fechaInscripcion: this.fechaInscripcion.toISOString(),
        };
    }

    /**
     * Create from JSON
     */
    static fromJson(json: Record<string, any>): Inscripcion {
        return new Inscripcion({
            id: json.id,
            usuarioId: json.usuarioId,
            cursoId: json.cursoId,
            fechaInscripcion: new Date(json.fechaInscripcion),
        });
    }
}

export default Inscripcion;
