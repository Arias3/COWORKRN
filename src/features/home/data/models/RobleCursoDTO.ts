import CursoDomain from '../../domain/entities/CursoEntity';

/**
 * RobleCursoDto
 * 
 * Data Transfer Object for course data from Roble API.
 * Handles serialization/deserialization and ID conversion.
 */
export class RobleCursoDto {
    id?: number;
    nombre: string;
    descripcion: string;
    codigoRegistro: string;
    profesorId: number;
    creadoEn: string;
    categorias: string[];
    imagen?: string;
    estudiantesNombres: string[];

    constructor(params: {
        id?: number;
        nombre: string;
        descripcion: string;
        codigoRegistro: string;
        profesorId: number;
        creadoEn: string;
        categorias: string[];
        imagen?: string;
        estudiantesNombres: string[];
    }) {
        this.id = params.id;
        this.nombre = params.nombre;
        this.descripcion = params.descripcion;
        this.codigoRegistro = params.codigoRegistro;
        this.profesorId = params.profesorId;
        this.creadoEn = params.creadoEn;
        this.categorias = params.categorias;
        this.imagen = params.imagen;
        this.estudiantesNombres = params.estudiantesNombres;
    }

    /**
     * Create from JSON (API response)
     */
    static fromJson(json: Record<string, any>): RobleCursoDto {
        console.log('🔄 [HYBRID] Mapeando JSON a curso...');
        console.log('   - JSON keys:', Object.keys(json).join(', '));

        // ✅ CORRECCIÓN CRÍTICA: Obtener ID de _id o id
        const rawId = json._id ?? json.id;
        let convertedId: number | undefined;

        if (rawId != null) {
            console.log(`🔄 [HYBRID] Convirtiendo ID: ${rawId} (tipo: ${typeof rawId})`);

            if (typeof rawId === 'string' && rawId.length > 0) {
                // ✅ SOLUCIONADO: Usar función determinística en lugar de hashCode
                convertedId = RobleCursoDto._generateConsistentId(rawId);
                console.log(`✅ [HYBRID] String ID convertido: "${rawId}" -> ${convertedId}`);
            } else if (typeof rawId === 'number' && rawId > 0) {
                convertedId = rawId;
                console.log(`✅ [HYBRID] Numeric ID usado: ${convertedId}`);
            }
        }

        const curso = new RobleCursoDto({
            id: convertedId,
            nombre: json.nombre ?? '',
            descripcion: json.descripcion ?? '',
            codigoRegistro: json.codigo_registro ?? '',
            profesorId: json.profesor_id ?? 0,
            creadoEn: json.creado_en ?? new Date().toISOString(),
            categorias: json.categorias != null
                ? (typeof json.categorias === 'string'
                    ? (json.categorias as string).split(',').filter(s => s.length > 0)
                    : Array.from(json.categorias))
                : [],
            imagen: json.imagen,
            estudiantesNombres: json.estudiantes_nombres != null
                ? (typeof json.estudiantes_nombres === 'string'
                    ? (json.estudiantes_nombres as string).split(',').filter(s => s.length > 0)
                    : Array.from(json.estudiantes_nombres))
                : [],
        });

        console.log('✅ [HYBRID] Curso mapeado correctamente:');
        console.log('   - Nombre:', curso.nombre);
        console.log('   - ID original:', rawId);
        console.log('   - ID convertido:', curso.id);

        return curso;
    }

    /**
     * Create from entity
     */
    static fromEntity(curso: CursoDomain): RobleCursoDto {
        return new RobleCursoDto({
            id: curso.id !== 0 ? curso.id : undefined,
            nombre: curso.nombre,
            descripcion: curso.descripcion,
            codigoRegistro: curso.codigoRegistro,
            profesorId: curso.profesorId ?? 0, // ✅ Manejar undefined con valor por defecto
            creadoEn: (curso.creadoEn ?? curso.fechaCreacion).toISOString(), // ✅ Usar fechaCreacion como fallback
            categorias: curso.categorias,
            imagen: curso.imagen,
            estudiantesNombres: curso.estudiantesNombres,
        });
    }

    /**
     * Convert to JSON (for API requests)
     */
    toJson(): Record<string, any> {
        const json: Record<string, any> = {
            nombre: this.nombre,
            descripcion: this.descripcion,
            codigo_registro: this.codigoRegistro,
            profesor_id: this.profesorId,
            creado_en: this.creadoEn,
            categorias: this.categorias.join(','), // ✅ Convertir array a string separado por comas
            imagen: this.imagen,
            estudiantes_nombres: this.estudiantesNombres.join(','), // ✅ Convertir array a string separado por comas
        };

        if (this.id != null) {
            json.id = this.id;
        }

        return json;
    }

    /**
     * Convert to entity
     */
    toEntity(): CursoDomain {
        // ✅ CORRECCIÓN: Asegurar que nunca se retorne ID 0
        const finalId = this.id ?? 1; // Si es undefined, usar 1 en lugar de 0

        console.log('🔄 [HYBRID] Convirtiendo DTO a entidad:');
        console.log('   - ID:', finalId);
        console.log('   - Nombre:', this.nombre);

        return new CursoDomain({
            id: finalId,
            nombre: this.nombre,
            descripcion: this.descripcion,
            codigoRegistro: this.codigoRegistro,
            profesorId: this.profesorId,
            creadoEn: new Date(this.creadoEn), // ✅ Usar creadoEn aquí
            categorias: this.categorias,
            imagen: this.imagen,
            estudiantesNombres: this.estudiantesNombres,
            fechaCreacion: new Date(this.creadoEn), // ✅ Mismo valor para fechaCreacion
        });
    }

    /**
     * ✅ MÉTODO AGREGADO: Genera un ID consistente entre plataformas
     * En lugar de usar hashCode (que varía entre web/mobile),
     * usamos una función determinística basada en los códigos de caracteres
     */
    private static _generateConsistentId(input: string): number {
        if (input.length === 0) return 1;

        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash * 31 + input.charCodeAt(i)) & 0x7FFFFFFF;
        }

        // Asegurar que nunca sea 0
        return hash === 0 ? 1 : hash;
    }
}

export default RobleCursoDto;
