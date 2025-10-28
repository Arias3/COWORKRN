/**
 * Usuario Entity
 * 
 * Domain entity representing a user in the system.
 * Can be either 'profesor' or 'estudiante'.
 */
export interface UserEntity {
    id?: number;
    nombre: string;
    email: string;
    password?: string;
    rol: 'profesor' | 'estudiante';
    creadoEn: Date;
    authUserId?: string; // ID from Roble auth system
    robleId?: string; // Original Roble ID as string (e.g., "AfqZEyYldDPq")
}

/**
 * Usuario class implementation
 */
export class Usuario implements UserEntity {
    id?: number;
    nombre: string;
    email: string;
    password?: string;
    rol: 'profesor' | 'estudiante';
    creadoEn: Date;
    authUserId?: string;
    robleId?: string;

    constructor(data: {
        id?: number;
        nombre: string;
        email: string;
        password?: string;
        rol: 'profesor' | 'estudiante';
        creadoEn?: Date;
        authUserId?: string;
        robleId?: string;
    }) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.email = data.email;
        this.password = data.password;
        this.rol = data.rol;
        this.creadoEn = data.creadoEn || new Date();
        this.authUserId = data.authUserId;
        this.robleId = data.robleId;
    }

    /**
     * Convert to JSON
     */
    toJson(): Record<string, any> {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            password: this.password,
            rol: this.rol,
            creadoEn: this.creadoEn.toISOString(),
            authUserId: this.authUserId,
            robleId: this.robleId,
        };
    }

    /**
     * Create instance from JSON
     */
    static fromJson(json: Record<string, any>): Usuario {
        return new Usuario({
            id: json.id,
            nombre: json.nombre,
            email: json.email,
            password: json.password,
            rol: json.rol,
            creadoEn: json.creadoEn ? new Date(json.creadoEn) : new Date(),
            authUserId: json.authUserId,
            robleId: json.robleId,
        });
    }

    /**
     * Constructor from auth response
     */
    static fromAuthResponse(data: {
        authUserId: string;
        nombre: string;
        email: string;
        rol: 'profesor' | 'estudiante';
    }): Usuario {
        return new Usuario({
            nombre: data.nombre,
            email: data.email,
            password: '',
            rol: data.rol,
            authUserId: data.authUserId,
        });
    }

    /**
     * Copy with method for easy updates
     */
    copyWith(updates: Partial<UserEntity>): Usuario {
        return new Usuario({
            id: updates.id ?? this.id,
            nombre: updates.nombre ?? this.nombre,
            email: updates.email ?? this.email,
            password: updates.password ?? this.password,
            rol: updates.rol ?? this.rol,
            authUserId: updates.authUserId ?? this.authUserId,
            robleId: updates.robleId ?? this.robleId,
            creadoEn: updates.creadoEn ?? this.creadoEn,
        });
    }

    /**
     * String representation
     */
    toString(): string {
        return `Usuario(id: ${this.id}, nombre: ${this.nombre}, email: ${this.email}, rol: ${this.rol}, robleId: ${this.robleId})`;
    }

    /**
     * Equality comparison
     */
    equals(other: Usuario): boolean {
        return this.id === other.id && this.email === other.email;
    }
}

export default Usuario;
